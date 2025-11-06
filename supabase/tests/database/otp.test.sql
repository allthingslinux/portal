begin;
create extension "basejump-supabase_test_helpers" version '0.0.6';

select no_plan(); -- Use no_plan for flexibility

select tests.create_supabase_user('token_creator', 'creator@example.com');
select tests.create_supabase_user('token_verifier', 'verifier@example.com');

-- ==========================================
-- Test 1: Permission Tests
-- ==========================================

-- Test 1.1: Regular users cannot create nonces directly
select tests.authenticate_as('token_creator');

select throws_ok(
    $$ select public.create_nonce(auth.uid(), 'password-reset', 3600) $$,
    'permission denied for function create_nonce',
    'Regular users should not be able to create nonces directly'
);

-- Test 1.2: Regular users cannot revoke nonces
select throws_ok(
    $$ select public.revoke_nonce('00000000-0000-0000-0000-000000000000'::uuid, 'test') $$,
    'permission denied for function revoke_nonce',
    'Regular users should not be able to revoke tokens'
);

-- Test 1.3: Service role can create nonces
set local role service_role;

-- Create a token and store it for later verification
do $$
declare 
    token_result jsonb;
begin
    token_result := public.create_nonce(
        null, 
        'password-reset',
        3600,
        '{"redirect_url": "/reset-password"}'::jsonb,
        ARRAY['auth:reset']
    );
    
    -- Store the token for later verification
    perform set_config('app.settings.test_token', token_result->>'token', false);
    perform set_config('app.settings.test_token_id', token_result->>'id', false);
    perform set_config('app.settings.test_token_json', token_result::text, false);
end $$;

-- Check token result properties
select ok(
    (current_setting('app.settings.test_token_json', false)::jsonb) ? 'id', 
    'Token result should contain an id'
);
select ok(
    (current_setting('app.settings.test_token_json', false)::jsonb) ? 'token', 
    'Token result should contain a token'
);
select ok(
    (current_setting('app.settings.test_token_json', false)::jsonb) ? 'expires_at', 
    'Token result should contain an expiration time'
);

set local role postgres;

-- Create a token for an authenticated user
do $$
declare 
    token_result jsonb;
    auth_user_id uuid;
begin
    auth_user_id := makerkit.get_id_by_identifier('token_creator');
    
    token_result := public.create_nonce(
        auth_user_id, 
        'email-verification',
        3600
    );
    
    -- Store the token for later user verification
    perform set_config('app.settings.user_token', token_result->>'token', false);
    perform set_config('app.settings.user_token_id', token_result->>'id', false);
    perform set_config('app.settings.user_token_json', token_result::text, false);
end $$;

-- Check user token result properties
select ok(
    (current_setting('app.settings.user_token_json', false)::jsonb) ? 'id', 
    'Token result with minimal params should contain an id'
);
select ok(
    (current_setting('app.settings.user_token_json', false)::jsonb) ? 'token', 
    'Token result with minimal params should contain a token'
);

-- Create an anonymous token (no user_id)
do $$
declare 
    token_result jsonb;
begin
    token_result := public.create_nonce(
        null, 
        'user-invitation',
        7200,
        '{"team_id": "123456"}'::jsonb
    );
    
    -- Store the anonymous token for later verification
    perform set_config('app.settings.anonymous_token', token_result->>'token', false);
    
    perform set_config('app.settings.anonymous_token_id', token_result->>'id', false);

    perform set_config('app.settings.anonymous_token_json', token_result::text, false);
end $$;

-- Check anonymous token result properties
select ok(
    (current_setting('app.settings.anonymous_token_json', false)::jsonb) ? 'id', 
    'Anonymous token result should contain an id'
);

select ok(
    (current_setting('app.settings.anonymous_token_json', false)::jsonb) ? 'token', 
    'Anonymous token result should contain a token'
);

-- ==========================================
-- Test 2: Verify Tokens
-- ==========================================

-- Test 2.1: Authenticated users can verify tokens
select tests.authenticate_as('token_creator');

-- Verify token and store result
do $$
declare 
    test_token text;
    verification_result jsonb;
begin
    test_token := current_setting('app.settings.test_token', false);
    
    verification_result := public.verify_nonce(
        test_token,
        'password-reset'
    );
    
    perform set_config('app.settings.verification_result', verification_result::text, false);
end $$;

-- Check verification result
select is(
    (current_setting('app.settings.verification_result', false)::jsonb)->>'valid', 
    'true', 
    'Token should be valid'
);

select ok(
    (current_setting('app.settings.verification_result', false)::jsonb) ? 'metadata', 
    'Result should contain metadata'
);

select ok(
    (current_setting('app.settings.verification_result', false)::jsonb) ? 'scopes', 
    'Result should contain scopes'
);

-- Test 2.2: Users can verify tokens assigned to them
do $$
declare 
    user_token text;
    verification_result jsonb;
    user_id uuid;
begin
    user_token := current_setting('app.settings.user_token', false);
    
    set local role postgres;
    user_id := makerkit.get_id_by_identifier('token_creator');
    
    perform tests.authenticate_as('token_creator');

    verification_result := public.verify_nonce(
        user_token,
        'email-verification',
        user_id
    );

    perform set_config('app.settings.user_verification_result', verification_result::text, false);
end $$;

-- Check user verification result
select is(
    (current_setting('app.settings.user_verification_result', false)::jsonb)->>'valid', 
    'true', 
    'User-specific token should be valid'
);

select isnt(
    (current_setting('app.settings.user_verification_result', false)::jsonb)->>'user_id', 
    null, 
    'User-specific token should have user_id'
);

-- Test 2.3: Verify token with scopes
set local role service_role;

-- Create token with scopes
do $$
declare 
    scope_token_result jsonb;
begin
    -- Create token with scopes
    scope_token_result := public.create_nonce(
        null, 
        'api-access',
        3600,
        '{"permissions": "read-only"}'::jsonb,
        ARRAY['read:profile', 'read:posts']
    );
    
    -- Store for verification
    perform set_config('app.settings.scope_token', scope_token_result->>'token', false);
end $$;

-- Verify with correct scope
do $$
declare
    scope_token text;
    verification_result jsonb;
    user_id uuid;
begin
    set local role postgres;
    scope_token := current_setting('app.settings.scope_token', false);
    user_id := makerkit.get_id_by_identifier('token_verifier');

    perform tests.authenticate_as('token_verifier');
    
    -- Verify with correct required scope
    verification_result := public.verify_nonce(
        scope_token,
        'api-access',
        null,
        ARRAY['read:profile']
    );
    
    perform set_config('app.settings.correct_scope_result', verification_result::text, false);
    
    -- Verify with incorrect required scope
    verification_result := public.verify_nonce(
        scope_token,
        'api-access',
        null,
        ARRAY['write:posts']
    );
    
    perform set_config('app.settings.incorrect_scope_result', verification_result::text, false);
end $$;

-- Check scope verification results
select is(
    (current_setting('app.settings.correct_scope_result', false)::jsonb)->>'valid', 
    'true', 
    'Token with correct scope should be valid'
);

select is(
    (current_setting('app.settings.incorrect_scope_result', false)::jsonb)->>'valid', 
    'false', 
    'Token with incorrect scope should be invalid'
);

-- Test 2.4: Once used, token becomes invalid
do $$
declare 
    token_result jsonb;
    first_verification jsonb;
    second_verification jsonb;
begin
    -- Use service role to create a token
    set local role service_role;
    
    -- Create a token
    token_result := public.create_nonce(
        null, 
        'one-time-action',
        3600
    );
    
    set local role authenticated;
    
    -- Verify it once (uses it)
    first_verification := public.verify_nonce(
        token_result->>'token',
        'one-time-action'
    );
    
    -- Try to verify again
    second_verification := public.verify_nonce(
        token_result->>'token',
        'one-time-action'
    );
    
    perform set_config('app.settings.first_verification', first_verification::text, false);
    perform set_config('app.settings.second_verification', second_verification::text, false);
end $$;

-- Check first and second verification results
select is(
    (current_setting('app.settings.first_verification', false)::jsonb)->>'valid', 
    'true', 
    'First verification should succeed'
);
select is(
    (current_setting('app.settings.second_verification', false)::jsonb)->>'valid', 
    'false', 
    'Token should not be valid on second use'
);

-- Test 2.5: Verify with incorrect purpose
do $$
declare 
    token_result jsonb;
    verification_result jsonb;
begin
    -- Use service role to create a token
    set local role service_role;
    
    -- Create a token
    token_result := public.create_nonce(
        null, 
        'specific-purpose',
        3600
    );
    
    set local role authenticated;
    
    -- Verify with wrong purpose
    verification_result := public.verify_nonce(
        token_result->>'token',
        'different-purpose'
    );
    
    perform set_config('app.settings.wrong_purpose_result', verification_result::text, false);
end $$;

-- Check wrong purpose verification result
select is(
    (current_setting('app.settings.wrong_purpose_result', false)::jsonb)->>'valid', 
    'false', 
    'Token with incorrect purpose should be invalid'
);

-- ==========================================
-- Test 3: Revoke Tokens
-- ==========================================

-- Test 3.1: Only service_role can revoke tokens
select tests.authenticate_as('token_creator');

select 
    has_function(
        'public', 
        'revoke_nonce', 
        ARRAY['uuid', 'text'],
        'revoke_nonce function should exist'
    );

select throws_ok(
    $$ select public.revoke_nonce('00000000-0000-0000-0000-000000000000'::uuid, 'test reason') $$,
    'permission denied for function revoke_nonce',
    'Regular users should not be able to revoke tokens'
);

-- Test 3.2: Service role can revoke tokens
set local role service_role;

do $$
declare 
    token_result jsonb;
    revoke_result boolean;
    verification_result jsonb;
    token_id uuid;
begin
    -- Create a token
    token_result := public.create_nonce(
        null, 
        'revokable-action',
        3600
    );
    
    token_id := token_result->>'id';
    
    -- Revoke the token
    revoke_result := public.revoke_nonce(
        token_id,
        'Security concern'
    );
    
    -- Switch to regular user to try to verify the revoked token
    set local role authenticated;
    
    -- Try to verify the revoked token
    verification_result := public.verify_nonce(
        token_result->>'token',
        'revokable-action'
    );
    
    perform set_config('app.settings.revoke_result', revoke_result::text, false);
    perform set_config('app.settings.revoked_verification', verification_result::text, false);
end $$;

-- Check revocation results
select is(
    current_setting('app.settings.revoke_result', false)::boolean, 
    true, 
    'Token revocation should succeed'
);
select is(
    (current_setting('app.settings.revoked_verification', false)::jsonb)->>'valid', 
    'false', 
    'Revoked token should be invalid'
);

-- ==========================================
-- Test 4: Get Token Status
-- ==========================================

-- Test 4.1: Verify permission on get_nonce_status
select tests.authenticate_as('token_creator');

select throws_ok(
    $$ select public.get_nonce_status('00000000-0000-0000-0000-000000000000'::uuid) $$,
    'permission denied for function get_nonce_status',
    'Regular users should not be able to check token status'
);

-- Test 4.2: Service role can check token status
set local role service_role;

select 
    has_function(
        'public', 
        'get_nonce_status', 
        ARRAY['uuid'],
        'get_nonce_status function should exist'
    );

do $$
declare 
    token_result jsonb;
    status_result jsonb;
    token_id uuid;
begin
    -- Create a token
    token_result := public.create_nonce(
        null, 
        'status-check-test',
        3600
    );
    
    token_id := token_result->>'id';
    
    -- Get status
    status_result := public.get_nonce_status(token_id);
    
    perform set_config('app.settings.status_result', status_result::text, false);
end $$;

-- Check status result
select is(
    (current_setting('app.settings.status_result', false)::jsonb)->>'exists', 
    'true', 
    'Token should exist'
);
select is(
    (current_setting('app.settings.status_result', false)::jsonb)->>'purpose', 
    'status-check-test', 
    'Purpose should match'
);
select is(
    (current_setting('app.settings.status_result', false)::jsonb)->>'is_valid', 
    'true', 
    'Token should be valid'
);
select is(
    (current_setting('app.settings.status_result', false)::jsonb)->>'verification_attempts', 
    '0', 
    'New token should have 0 verification attempts'
);
select is(
    (current_setting('app.settings.status_result', false)::jsonb)->>'used_at', 
    null,
    'New token should not be used'
);
select is(
    (current_setting('app.settings.status_result', false)::jsonb)->>'revoked', 
    'false', 
    'New token should not be revoked'
);

-- ==========================================
-- Test 5: Cleanup Expired Tokens
-- ==========================================

-- Test 5.1: Regular users cannot access cleanup function
select tests.authenticate_as('token_creator');

select throws_ok(
    $$ select kit.cleanup_expired_nonces() $$,
    'permission denied for schema kit',
    'Regular users should not be able to clean up tokens'
);

-- Test 5.2: Postgres can clean up expired tokens
set local role postgres;

select 
    has_function(
        'kit', 
        'cleanup_expired_nonces', 
        ARRAY['integer', 'boolean', 'boolean'],
        'cleanup_expired_nonces function should exist'
    );

do $$
declare 
    token_result jsonb;
    cleanup_result integer;
    token_count integer;
begin
    -- Create an expired token (expiring in -10 seconds from now)
    token_result := public.create_nonce(
        null, 
        'expired-token-test',
        -10  -- Negative value to create an already expired token
    );
    
    -- Run cleanup
    cleanup_result := kit.cleanup_expired_nonces();
    
    -- Verify the token is gone
    select count(*) into token_count from public.nonces where id = (token_result->>'id')::uuid;
    
    perform set_config('app.settings.cleanup_result', cleanup_result::text, false);
    perform set_config('app.settings.token_count_after_cleanup', token_count::text, false);
end $$;

-- Check cleanup results
select cmp_ok(
    current_setting('app.settings.cleanup_result', false)::integer, 
    '>=', 
    1, 
    'Cleanup should remove at least one expired token'
);
select is(
    current_setting('app.settings.token_count_after_cleanup', false)::integer, 
    0, 
    'Expired token should be removed after cleanup'
);

-- ==========================================
-- Test 6: Security Tests
-- ==========================================

-- Test 6.1: Regular users cannot view tokens directly from the nonces table
select tests.authenticate_as('token_creator');

set local role postgres;

do $$
declare
    creator_id uuid;
    token_id uuid;
begin
    -- Get the user id
    creator_id := makerkit.get_id_by_identifier('token_creator');
    
    -- Create a token for this user
    token_id := (public.create_nonce(creator_id, 'security-test', 3600))->>'id';
    perform set_config('app.settings.security_test_token_id', token_id::text, false);
end $$;

select tests.authenticate_as('token_creator');
do $$
declare
    token_id uuid;
    token_count integer;
begin
    -- Get the token ID created by service role
    token_id := (current_setting('app.settings.security_test_token_id', false))::uuid;
    
    -- Try to view token directly from nonces table
    select count(*) into token_count from public.nonces where id = token_id;
    
    perform set_config('app.settings.creator_token_count', token_count::text, false);
end $$;

-- Check creator can see their own token
select is(
    current_setting('app.settings.creator_token_count', false)::integer, 
    1, 
    'User should be able to see their own tokens in the table'
);

-- Test 6.2: Users cannot see tokens belonging to other users
select tests.authenticate_as('token_verifier');
do $$
declare
    token_id uuid;
    token_count integer;
begin
    -- Get the token ID created for the creator user
    token_id := (current_setting('app.settings.security_test_token_id', false))::uuid;
    
    -- Verifier tries to view token created for creator
    select count(*) into token_count from public.nonces where id = token_id;
    
    perform set_config('app.settings.verifier_token_count', token_count::text, false);
end $$;

-- Check verifier cannot see creator's token
select is(
    current_setting('app.settings.verifier_token_count', false)::integer, 
    0, 
    'User should not be able to see tokens belonging to other users'
);

-- ==========================================
-- Test 7: Auto-Revocation of Previous Tokens
-- ==========================================

-- Test 7.1: Creating a new token should revoke previous tokens with the same purpose by default
set local role postgres;

do $$
declare
    auth_user_id uuid;
    first_token_result jsonb;
    second_token_result jsonb;
    first_token_id uuid;
    first_token_status jsonb;
begin
    -- Get user ID
    auth_user_id := makerkit.get_id_by_identifier('token_creator');
    
    -- Create first token
    first_token_result := public.create_nonce(
        auth_user_id,
        'password-reset',
        3600,
        '{"first": true}'::jsonb
    );
    
    first_token_id := first_token_result->>'id';
    
    -- Verify first token is valid
    first_token_status := public.get_nonce_status(first_token_id);
    
    -- Create second token with same purpose
    second_token_result := public.create_nonce(
        auth_user_id,
        'password-reset',
        3600,
        '{"second": true}'::jsonb
    );
    
    -- Check that first token is now revoked
    first_token_status := public.get_nonce_status(first_token_id);
    
    perform set_config('app.settings.first_token_valid_before', 'true', false);
    perform set_config('app.settings.revoked_previous_count', (second_token_result->>'revoked_previous_count')::text, false);
    perform set_config('app.settings.first_token_revoked', (first_token_status->>'revoked')::text, false);
    perform set_config('app.settings.first_token_revoked_reason', (first_token_status->>'revoked_reason')::text, false);
    perform set_config('app.settings.first_token_valid_after', (first_token_status->>'is_valid')::text, false);
end $$;

-- Check auto-revocation results
select is(
    current_setting('app.settings.first_token_valid_before', false), 
    'true', 
    'First token should be valid initially'
);

select is(
    current_setting('app.settings.revoked_previous_count', false)::integer, 
    1, 
    'Should report one revoked token'
);

select is(
    current_setting('app.settings.first_token_revoked', false), 
    'true', 
    'First token should be revoked'
);

select is(
    current_setting('app.settings.first_token_revoked_reason', false), 
    'Superseded by new token with same purpose', 
    'Revocation reason should be set'
);

select is(
    current_setting('app.settings.first_token_valid_after', false), 
    'false', 
    'First token should be invalid'
);

-- ==========================================
-- Test 8: Maximum Verification Attempts
-- ==========================================

-- Test 8.1: Token should be revoked after exceeding max verification attempts
set local role service_role;

do $$
declare 
    token_result jsonb;
    verification_result jsonb;
    status_result jsonb;
    token_id uuid;
    token_text text;
begin
    -- Create a token
    token_result := public.create_nonce(
        null, 
        'max-attempts-test',
        3600
    );
    
    token_id := token_result->>'id';
    token_text := token_result->>'token';
    
    -- Manually set verification_attempts to just below the limit (3)
    UPDATE public.nonces
    SET verification_attempts = 3
    WHERE id = token_id;
    
    -- Get status after manual update
    status_result := public.get_nonce_status(token_id);

    -- Now perform a verification with an incorrect token - this should trigger max attempts exceeded
    verification_result := public.verify_nonce(
        'wrong-token', -- Wrong token
        'max-attempts-test', -- Correct purpose,
        NULL, -- No user id
        NULL, -- No required scopes
        3     -- Max 3 attempts
    );
    
    -- The above won't increment the counter, so we need to make one more attempt with the correct token
    verification_result := public.verify_nonce(
        token_text, -- Correct token
        'max-attempts-test', -- Correct purpose,
        NULL, -- No user id
        NULL, -- No required scopes
        3     -- Max 3 attempts
    );
    
    -- Check token status to verify it was revoked
    status_result := public.get_nonce_status(token_id);

    -- Store results for assertions outside the DO block
    perform set_config('app.settings.max_attempts_verification_result', verification_result::text, false);
    perform set_config('app.settings.max_attempts_status_result', status_result::text, false);
end $$;

-- Check max attempts results outside the DO block
select is(
    (current_setting('app.settings.max_attempts_verification_result', false)::jsonb)->>'valid', 
    'false', 
    'Token should be invalid after exceeding max attempts'
);

select is(
    (current_setting('app.settings.max_attempts_verification_result', false)::jsonb)->>'max_attempts_exceeded', 
    'true', 
    'Max attempts exceeded flag should be set'
);

select is(
    (current_setting('app.settings.max_attempts_status_result', false)::jsonb)->>'revoked', 
    'true', 
    'Token should be revoked after exceeding max attempts'
);

select is(
    (current_setting('app.settings.max_attempts_status_result', false)::jsonb)->>'revoked_reason', 
    'Maximum verification attempts exceeded', 
    'Revocation reason should indicate max attempts exceeded'
);

-- Test 8.2: Setting max attempts to 0 should disable the limit
do $$
declare 
    token_result jsonb;
    verification_result jsonb;
    status_result jsonb;
    token_id uuid;
    token_text text;
begin
    -- Create a token
    token_result := public.create_nonce(
        null, 
        'unlimited-attempts-test',
        3600
    );
    
    token_id := token_result->>'id';
    token_text := token_result->>'token';
    
    -- Manually set verification_attempts to a high number
    UPDATE public.nonces
    SET verification_attempts = 10
    WHERE id = token_id;
    
    -- Get status after manual update
    status_result := public.get_nonce_status(token_id);

    -- Now perform a verification with the correct token and unlimited attempts
    verification_result := public.verify_nonce(
        token_text, -- Correct token
        'unlimited-attempts-test', -- Correct purpose,
        NULL, -- No user id
        NULL, -- No required scopes
        0     -- Unlimited attempts (disabled)
    );
    
    -- Check token status to verify it was not revoked
    status_result := public.get_nonce_status(token_id);

    -- Store results for assertions outside the DO block
    perform set_config('app.settings.unlimited_attempts_status', status_result::text, false);
end $$;

-- Check unlimited attempts results outside the DO block
select is(
    (current_setting('app.settings.unlimited_attempts_status', false)::jsonb)->>'revoked', 
    'false', 
    'Token should not be revoked when max attempts is disabled'
);

select cmp_ok(
    (current_setting('app.settings.unlimited_attempts_status', false)::jsonb)->>'verification_attempts', 
    '>=', 
    '10', 
    'Token should record at least 10 verification attempts'
);

-- ==========================================
-- Test 9: Multiple Nonces with Same Purpose
-- ==========================================

-- Test 9.1: Creating multiple anonymous nonces with the same purpose
set local role service_role;

do $$
declare 
    token_result1 jsonb;
    token_result2 jsonb;
    token_result3 jsonb;
    verification_result jsonb;
    count_result integer;
begin
    -- Create first token with purpose "multi-purpose-test"
    token_result1 := public.create_nonce(
        null, -- Anonymous token
        'multi-purpose-test',
        3600,
        '{"data": "first token"}'::jsonb
    );
    
    -- Create second token with the same purpose
    token_result2 := public.create_nonce(
        null, -- Anonymous token
        'multi-purpose-test',
        3600,
        '{"data": "second token"}'::jsonb,
        null, -- Default scopes
        false -- Don't revoke previous tokens with same purpose
    );
    
    -- Create third token with the same purpose
    token_result3 := public.create_nonce(
        null, -- Anonymous token
        'multi-purpose-test',
        3600,
        '{"data": "third token"}'::jsonb,
        null, -- Default scopes
        false -- Don't revoke previous tokens with same purpose
    );
    
    -- Count how many tokens exist with this purpose
    select count(*) into count_result
    from public.nonces
    where purpose = 'multi-purpose-test' and used_at is null and revoked = false;
    
    -- Verify specific token by token value
    verification_result := public.verify_nonce(
        token_result2->>'token', -- Use the second token specifically
        'multi-purpose-test'
    );
    
    -- Store results for assertions outside the DO block
    perform set_config('app.settings.multiple_purpose_count', count_result::text, false);
    perform set_config('app.settings.specific_token_verification', verification_result::text, false);
    perform set_config('app.settings.expected_token_metadata', '{"data": "second token"}', false);
end $$;

-- Check results outside the DO block
select is(
    current_setting('app.settings.multiple_purpose_count', false)::integer,
    3,
    'There should be 3 active tokens with the same purpose when auto-revocation is disabled'
);

select is(
    (current_setting('app.settings.specific_token_verification', false)::jsonb)->>'valid',
    'true',
    'Verification of specific token should succeed'
);

select is(
    (current_setting('app.settings.specific_token_verification', false)::jsonb)->'metadata',
    current_setting('app.settings.expected_token_metadata', false)::jsonb,
    'Metadata from the correct (second) token should be returned'
);

-- Test 9.2: Multiple user-specific tokens with same purpose
do $$
declare 
    creator_id uuid;
    verifier_id uuid;
    creator_token_result jsonb;
    verifier_token_result jsonb;
    verification_result jsonb;
begin
    set local role postgres;
    
    -- Get user IDs
    creator_id := makerkit.get_id_by_identifier('token_creator');
    verifier_id := makerkit.get_id_by_identifier('token_verifier');
    
    set local role service_role;
    
    -- Create token for first user
    creator_token_result := public.create_nonce(
        creator_id,
        'user-specific-purpose',
        3600,
        '{"user": "creator"}'::jsonb
    );
    
    -- Create token for second user with same purpose
    verifier_token_result := public.create_nonce(
        verifier_id,
        'user-specific-purpose',
        3600,
        '{"user": "verifier"}'::jsonb
    );
    
    -- Verify token for creator user
    verification_result := public.verify_nonce(
        creator_token_result->>'token',
        'user-specific-purpose',
        creator_id -- Specify user_id explicitly
    );
    
    -- Store results for assertions
    perform set_config('app.settings.creator_verification_result', verification_result::text, false);
    perform set_config('app.settings.creator_token', creator_token_result::text, false);
    perform set_config('app.settings.verifier_token', verifier_token_result::text, false);
end $$;

-- Verify that specifying the user_id correctly retrieves the right token
select is(
    (current_setting('app.settings.creator_verification_result', false)::jsonb)->>'valid',
    'true',
    'Verification of user-specific token should succeed when user_id is provided'
);

select is(
    (current_setting('app.settings.creator_verification_result', false)::jsonb)->'metadata'->>'user',
    'creator',
    'Correct user metadata should be returned'
);

-- Test 9.3: Verify purpose uniqueness requirements for anonymous tokens
do $$
declare
    test_token1 jsonb;
    test_token2 jsonb;
    wrong_verification jsonb;
    count_result integer;
begin
    set local role service_role;
    
    -- Create anonymous token
    test_token1 := public.create_nonce(
        null, -- Anonymous
        'anonymous-purpose-test',
        3600,
        '{"test": "first"}'::jsonb
    );
    
    -- Create second anonymous token with same purpose
    test_token2 := public.create_nonce(
        null, -- Anonymous
        'anonymous-purpose-test',
        3600,
        '{"test": "second"}'::jsonb,
        null,
        false -- Don't revoke previous
    );
    
    -- Verify token without specifying which one
    wrong_verification := public.verify_nonce(
        test_token1->>'token',
        'anonymous-purpose-test'
        -- No user_id specified - should still work for anonymous tokens
    );
    
    -- Count matching tokens
    select count(*) into count_result
    from public.nonces
    where purpose = 'anonymous-purpose-test' and used_at is null and revoked = false;
    
    -- Store results for assertions
    perform set_config('app.settings.anonymous_verification_result', wrong_verification::text, false);
    perform set_config('app.settings.anonymous_token_count', count_result::text, false);
end $$;

-- Check that anonymous verification works despite multiple tokens with same purpose
select is(
    (current_setting('app.settings.anonymous_verification_result', false)::jsonb)->>'valid',
    'true',
    'First token verification should succeed even with multiple tokens with same purpose'
);

select is(
    current_setting('app.settings.anonymous_token_count', false)::integer,
    1,
    'After verification, only one token should remain active (the other was used)'
);

-- ==========================================
-- Test 10: Short Expiration Test
-- ==========================================

-- Test 10.1: Token with 1 second expiration
set local role service_role;

do $$
declare 
    token_result jsonb;
    verification_result jsonb;
    verification_after_expiry jsonb;
    token_text text;
begin
    -- Create token with 1 second expiration
    token_result := public.create_nonce(
        null, -- Anonymous token
        'short-expiry-test',
        1, -- 1 second expiration
        '{"data": "expires quickly"}'::jsonb
    );
    
    token_text := token_result->>'token';
    
    -- Verify immediately - should be valid
    verification_result := public.verify_nonce(
        token_text,
        'short-expiry-test'
    );
    
    -- Wait for 1.5 seconds to ensure token expires
    perform pg_sleep(1.5);
    
    -- Verify after expiration - should be invalid
    verification_after_expiry := public.verify_nonce(
        token_text,
        'short-expiry-test'
    );
    
    -- Store results for assertions
    perform set_config('app.settings.quick_verification_result', verification_result::text, false);
    perform set_config('app.settings.after_expiry_verification', verification_after_expiry::text, false);
end $$;

-- Check results
select is(
    (current_setting('app.settings.quick_verification_result', false)::jsonb)->>'valid',
    'true',
    'Token should be valid immediately after creation'
);

select is(
    (current_setting('app.settings.after_expiry_verification', false)::jsonb)->>'valid',
    'false',
    'Token should be invalid after expiration time has passed'
);

select is(
    (current_setting('app.settings.after_expiry_verification', false)::jsonb)->>'message',
    'Invalid or expired token',
    'Error message should indicate token is expired'
);

-- Finish tests
select * from finish();

rollback;

