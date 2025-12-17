# Better Auth Migration Guide

This document tracks the migration from NextAuth.js to Better Auth.

## Status

✅ **Completed:**
- Better Auth installed
- Better Auth instance configured with Drizzle adapter
- Client instance created
- Route handler updated
- Session hooks created
- Server session helpers created

⏳ **In Progress:**
- Database schema migration
- Component updates
- Testing

## Database Schema Migration

Better Auth requires its own database schema. The current setup uses Supabase's `auth.users` table directly. We need to:

1. **Create Better Auth tables** in the public schema:
   - `user` - User accounts
   - `session` - User sessions
   - `account` - OAuth accounts
   - `verification` - Email verification tokens

2. **Migration Strategy:**
   - Option A: Migrate existing users from `auth.users` to Better Auth's `user` table
   - Option B: Use Better Auth's stateless (JWT) mode (no database required)
   - Option C: Keep both systems temporarily and sync data

## Next Steps

1. **Update AuthProvider component** to use Better Auth client
2. **Update all components** using NextAuth hooks
3. **Update server actions** to use Better Auth API
4. **Set up database schema** for Better Auth
5. **Test authentication flows**
6. **Remove NextAuth dependencies**

## Breaking Changes

- Session structure may differ slightly
- Hook APIs are similar but not identical
- Server-side session retrieval uses different API

## References

- [Better Auth Migration Guide](https://www.better-auth.com/docs/guides/next-auth-migration-guide)
- [Better Auth Drizzle Adapter](https://www.better-auth.com/docs/adapters/drizzle)

