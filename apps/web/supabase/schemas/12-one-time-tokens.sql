/*
 * -------------------------------------------------------
 * Section: Nonces
 * We create the schema for the nonces. Nonces are used to create one-time tokens for authentication purposes.
 * -------------------------------------------------------
 */

create extension if not exists pg_cron;

-- Create a table to store one-time tokens (nonces)
CREATE TABLE IF NOT EXISTS public.nonces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_token TEXT NOT NULL, -- token sent to client (hashed)
    nonce TEXT NOT NULL, -- token stored in DB (hashed)
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NULL, -- Optional to support anonymous tokens
    purpose TEXT NOT NULL, -- e.g., 'password-reset', 'email-verification', etc.

    -- Status fields
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    used_at TIMESTAMPTZ,
    revoked BOOLEAN NOT NULL DEFAULT FALSE, -- For administrative revocation
    revoked_reason TEXT, -- Reason for revocation if applicable

    -- Audit fields
    verification_attempts INTEGER NOT NULL DEFAULT 0, -- Track attempted uses
    last_verification_at TIMESTAMPTZ, -- Timestamp of last verification attempt
    last_verification_ip INET, -- For tracking verification source
    last_verification_user_agent TEXT, -- For tracking client information

    -- Extensibility fields
    metadata JSONB DEFAULT '{}'::JSONB, -- optional metadata
    scopes TEXT[] DEFAULT '{}' -- OAuth-style authorized scopes
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_nonces_status ON public.nonces (client_token, user_id, purpose, expires_at)
  WHERE used_at IS NULL AND revoked = FALSE;

-- Optimized index for verify_nonce function query pattern
-- Matches filter order: purpose → expires_at → user_id
CREATE INDEX IF NOT EXISTS idx_nonces_verify_lookup ON public.nonces (purpose, expires_at DESC, user_id)
  WHERE used_at IS NULL AND revoked = FALSE;

-- Enable Row Level Security (RLS)
ALTER TABLE public.nonces ENABLE ROW LEVEL SECURITY;

-- RLS policies
-- Users can view their own nonces for verification
CREATE POLICY "Users can read their own nonces"
  ON public.nonces
  FOR SELECT
  USING (
    user_id = (select auth.uid())
  );

-- Create a function to create a nonce
-- Create a function to create a nonce
create or replace function public.create_nonce (
    p_user_id UUID default null,
    p_purpose TEXT default null,
    p_expires_in_seconds INTEGER default 3600, -- 1 hour by default
    p_metadata JSONB default null,
    p_scopes text[] default null,
    p_revoke_previous BOOLEAN default true -- New parameter to control automatic revocation
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER
    set
        search_path to '' as $$
DECLARE
    v_client_token TEXT;
    v_nonce TEXT;
    v_expires_at TIMESTAMPTZ;
    v_id UUID;
    v_plaintext_token TEXT;
    v_revoked_count INTEGER;
BEGIN
    -- Revoke previous tokens for the same user and purpose if requested
    -- This only applies if a user ID is provided (not for anonymous tokens)
    IF p_revoke_previous = TRUE AND p_user_id IS NOT NULL THEN
        WITH revoked AS (
            UPDATE public.nonces
                SET
                    revoked = TRUE,
                    revoked_reason = 'Superseded by new token with same purpose'
                WHERE
                    user_id = p_user_id
                        AND purpose = p_purpose
                        AND used_at IS NULL
                        AND revoked = FALSE
                        AND expires_at > NOW()
                RETURNING 1
        )
        SELECT COUNT(*) INTO v_revoked_count FROM revoked;
    END IF;

    -- Generate a 6-digit token
    v_plaintext_token := (100000 + floor(random() * 900000))::text;
    v_client_token := extensions.crypt(v_plaintext_token, extensions.gen_salt('bf'));

    -- Still generate a secure nonce for internal use
    v_nonce := encode(extensions.gen_random_bytes(24), 'base64');
    v_nonce := extensions.crypt(v_nonce, extensions.gen_salt('bf'));

    -- Calculate expiration time
    v_expires_at := NOW() + (p_expires_in_seconds * interval '1 second');

    -- Insert the new nonce
    INSERT INTO public.nonces (
        client_token,
        nonce,
        user_id,
        expires_at,
        metadata,
        purpose,
        scopes
    )
    VALUES (
               v_client_token,
               v_nonce,
               p_user_id,
               v_expires_at,
               COALESCE(p_metadata, '{}'::JSONB),
               p_purpose,
               COALESCE(p_scopes, '{}'::TEXT[])
           )
    RETURNING id INTO v_id;

    -- Return the token information
    -- Note: returning the plaintext token, not the hash
    RETURN jsonb_build_object(
            'id', v_id,
            'token', v_plaintext_token,
            'expires_at', v_expires_at,
            'revoked_previous_count', COALESCE(v_revoked_count, 0)
           );
END;
$$;

grant execute on function public.create_nonce to service_role;

-- Create a function to verify a nonce
create or replace function public.verify_nonce (
    p_token TEXT,
    p_purpose TEXT,
    p_user_id UUID default null,
    p_required_scopes text[] default null,
    p_max_verification_attempts INTEGER default 5,
    p_ip INET default null,
    p_user_agent TEXT default null
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER
    set
        SEARCH_PATH to '' as $$
DECLARE
    v_nonce          RECORD;
BEGIN
    -- Find and update the nonce in a single operation
    -- First filter by indexed columns to reduce candidate rows, then do bcrypt comparison
    WITH candidate_nonces AS (
        -- Use index to filter candidates by purpose, user_id, expiry, status
        SELECT id, client_token, user_id, purpose, metadata, scopes,
               verification_attempts, expires_at, used_at, revoked
        FROM public.nonces
        WHERE purpose = p_purpose
          AND used_at IS NULL
          AND NOT revoked
          AND expires_at > NOW()
          -- Only apply user_id filter if the token was created for a specific user
          AND (
            -- Case 1: Anonymous token (user_id is NULL in DB)
            (user_id IS NULL)
                OR
                -- Case 2: User-specific token (check if user_id matches)
            (user_id = p_user_id)
          )
        ORDER BY created_at DESC
        -- Safety net: Limit to 100 most recent candidates to cap worst-case performance
        -- In production, auto-revocation keeps this low, but this protects against edge cases
        LIMIT 100
        -- CRITICAL: Lock rows to prevent race conditions in concurrent verifications
        -- SKIP LOCKED ensures other requests fail fast instead of waiting
        FOR UPDATE SKIP LOCKED
    ),
    matched_nonce AS (
        -- Now do the expensive bcrypt comparison only on filtered candidates
        SELECT *
        FROM candidate_nonces
        WHERE client_token = extensions.crypt(p_token, client_token)
        LIMIT 1
    ),
    updated_nonce AS (
        -- Update only the matched nonce
        UPDATE public.nonces
        SET verification_attempts        = verification_attempts + 1,
            last_verification_at         = NOW(),
            last_verification_ip         = COALESCE(p_ip, last_verification_ip),
            last_verification_user_agent = COALESCE(p_user_agent, last_verification_user_agent)
        WHERE id = (SELECT id FROM matched_nonce)
        RETURNING *
    )
    SELECT * INTO v_nonce FROM updated_nonce;

    -- Check if nonce exists
    IF v_nonce.id IS NULL THEN
        RETURN jsonb_build_object(
                'valid', false,
                'message', 'Invalid or expired token'
               );
    END IF;

    -- Check if max verification attempts exceeded (using the incremented value)
    IF p_max_verification_attempts > 0 AND v_nonce.verification_attempts > p_max_verification_attempts THEN
        -- Automatically revoke the token
        UPDATE public.nonces
        SET revoked        = TRUE,
            revoked_reason = 'Maximum verification attempts exceeded'
        WHERE id = v_nonce.id;

        RETURN jsonb_build_object(
                'valid', false,
                'message', 'Token revoked due to too many verification attempts',
                'max_attempts_exceeded', true
               );
    END IF;

    -- Check scopes if required
    IF p_required_scopes IS NOT NULL AND array_length(p_required_scopes, 1) > 0 THEN
        -- Fix scope validation to properly check if token scopes contain all required scopes
        -- Using array containment check: array1 @> array2 (array1 contains array2)
        IF NOT (v_nonce.scopes @> p_required_scopes) THEN
            RETURN jsonb_build_object(
                    'valid', false,
                    'message', 'Token does not have required permissions',
                    'token_scopes', v_nonce.scopes,
                    'required_scopes', p_required_scopes
                   );
        END IF;
    END IF;

    -- Mark nonce as used
    UPDATE public.nonces
    SET used_at = NOW()
    WHERE id = v_nonce.id;

    -- Return success with metadata
    RETURN jsonb_build_object(
            'valid', true,
            'user_id', v_nonce.user_id,
            'metadata', v_nonce.metadata,
            'scopes', v_nonce.scopes,
            'purpose', v_nonce.purpose
           );
END;
$$;

grant
    execute on function public.verify_nonce to authenticated,
    service_role;

-- Create a function to revoke a nonce
CREATE OR REPLACE FUNCTION public.revoke_nonce(
  p_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_affected_rows INTEGER;
BEGIN
  UPDATE public.nonces
  SET
    revoked = TRUE,
    revoked_reason = p_reason
  WHERE
    id = p_id
    AND used_at IS NULL
    AND NOT revoked
  RETURNING 1 INTO v_affected_rows;

  RETURN v_affected_rows > 0;
END;
$$;

grant execute on function public.revoke_nonce to service_role;

-- Create a function to clean up expired nonces
CREATE OR REPLACE FUNCTION public.cleanup_expired_nonces(
  p_older_than_days INTEGER DEFAULT 1,
  p_include_used BOOLEAN DEFAULT TRUE,
  p_include_revoked BOOLEAN DEFAULT TRUE
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Count and delete expired or used nonces based on parameters
  WITH deleted AS (
    DELETE FROM public.nonces
    WHERE
      (
        -- Expired and unused tokens
        (expires_at < NOW() AND used_at IS NULL)

        -- Used tokens older than specified days (if enabled)
        OR (p_include_used = TRUE AND used_at < NOW() - (p_older_than_days * interval '1 day'))

        -- Revoked tokens older than specified days (if enabled)
        OR (p_include_revoked = TRUE AND revoked = TRUE AND created_at < NOW() - (p_older_than_days * interval '1 day'))
      )
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_count FROM deleted;

  RETURN v_count;
END;
$$;

-- Create a function to get token status (for administrative use)
CREATE OR REPLACE FUNCTION public.get_nonce_status(
  p_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_nonce public.nonces;
BEGIN
  SELECT * INTO v_nonce FROM public.nonces WHERE id = p_id;

  IF v_nonce.id IS NULL THEN
    RETURN jsonb_build_object('exists', false);
  END IF;

  RETURN jsonb_build_object(
    'exists', true,
    'purpose', v_nonce.purpose,
    'user_id', v_nonce.user_id,
    'created_at', v_nonce.created_at,
    'expires_at', v_nonce.expires_at,
    'used_at', v_nonce.used_at,
    'revoked', v_nonce.revoked,
    'revoked_reason', v_nonce.revoked_reason,
    'verification_attempts', v_nonce.verification_attempts,
    'last_verification_at', v_nonce.last_verification_at,
    'last_verification_ip', v_nonce.last_verification_ip,
    'is_valid', (v_nonce.used_at IS NULL AND NOT v_nonce.revoked AND v_nonce.expires_at > NOW())
  );
END;
$$;

-- Comments for documentation
COMMENT ON TABLE public.nonces IS 'Table for storing one-time tokens with enhanced security and audit features';
COMMENT ON FUNCTION public.create_nonce IS 'Creates a new one-time token for a specific purpose with enhanced options';
COMMENT ON FUNCTION public.verify_nonce IS 'Verifies a one-time token, checks scopes, and marks it as used';
COMMENT ON FUNCTION public.revoke_nonce IS 'Administratively revokes a token to prevent its use';
COMMENT ON FUNCTION public.cleanup_expired_nonces IS 'Cleans up expired, used, or revoked tokens based on parameters';
COMMENT ON FUNCTION public.get_nonce_status IS 'Retrieves the status of a token for administrative purposes';
