# Deprecated Hooks Analysis

## ✅ Already Working (Just Wrappers Around NextAuth)

These hooks already work because they're just thin wrappers:

1. **`useUser`** → Uses `useSession` from NextAuth ✅
   - Just gets current user session
   - Already migrated!

2. **`useSignOut`** → Uses `signOut` from NextAuth ✅
   - Signs out the user
   - Already migrated!

3. **`useSignInWithEmailPassword`** → Uses NextAuth credentials provider ✅
   - Email/password sign in
   - Already migrated!

4. **`useSignUpWithEmailAndPassword`** → Uses NextAuth signup API ✅
   - Email/password sign up
   - Already migrated!

## ⚠️ Need API Routes (Can't Use NextAuth Directly)

These need custom API routes because NextAuth doesn't handle them:

5. **`useSignInWithOtp`** / **`useVerifyOtp`** ⚠️
   - **What it does**: Sends OTP codes via email/SMS and verifies them
   - **Why not NextAuth**: NextAuth doesn't have built-in OTP support
   - **Solution**: Use our existing OTP service via API routes
   - **Status**: Partially done - we have the service, need API routes

## ❌ Need Different Solutions (Not Authentication)

These use Supabase client for non-auth features:

6. **`useSupabase`** ❌ **THIS IS THE BIG PROBLEM**
   - **What it does**: Returns Supabase client for various operations
   - **Why not NextAuth**: NextAuth is ONLY for authentication, not database/real-time
   - **Used for**:
     - **Real-time subscriptions** (notifications) → Need WebSockets/SSE
     - **Database queries** (account updates) → Need server actions with Drizzle
     - **MFA operations** → Need NextAuth MFA or custom solution
     - **Identity linking** → Need NextAuth account linking

7. **`useFetchAuthFactors`** (MFA) ❌
   - **What it does**: Lists MFA factors (TOTP, SMS, etc.)
   - **Why not NextAuth**: NextAuth v5 has MFA support, but we need to implement it
   - **Solution**: Use NextAuth MFA or custom implementation

8. **`useUserIdentities`** / **`useLinkIdentityWithProvider`** ❌
   - **What it does**: Links multiple OAuth accounts to one user
   - **Why not NextAuth**: NextAuth supports this but needs configuration
   - **Solution**: Configure NextAuth account linking

9. **`useNotificationsStream`** ❌
   - **What it does**: Real-time notifications via Supabase Realtime
   - **Why not NextAuth**: This is NOT authentication, it's real-time data
   - **Solution**: Use WebSockets, Server-Sent Events, or Supabase Realtime directly

10. **`useUpdateAccount`** ❌
    - **What it does**: Updates account data in database
    - **Why not NextAuth**: This is database operations, not auth
    - **Solution**: Use server actions with Drizzle

## Summary

**Can keep as-is (already work):**
- `useUser` ✅
- `useSignOut` ✅
- `useSignInWithEmailPassword` ✅
- `useSignUpWithEmailAndPassword` ✅

**Need API routes:**
- `useSignInWithOtp` / `useVerifyOtp` → Create `/api/auth/otp/*` routes

**Need to replace with different solutions:**
- `useSupabase` → Replace with:
  - Real-time: WebSockets or Supabase Realtime client (just for realtime, not auth)
  - Database: Server actions with Drizzle
  - MFA: NextAuth MFA or custom
- MFA hooks → Implement NextAuth MFA
- Identity linking → Configure NextAuth account linking
- Notifications → WebSockets/SSE or Supabase Realtime (non-auth client)

