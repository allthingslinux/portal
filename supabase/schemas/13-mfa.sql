/*
 * -------------------------------------------------------
 * Section: MFA
 * We create the policies and functions to enforce MFA
 * -------------------------------------------------------
 */

/*
* public.is_aal2
* Check if the user has aal2 access
*/
create
    or replace function public.is_aal2() returns boolean
    set
        search_path = '' as
$$
declare
    is_aal2 boolean;
begin
    select auth.jwt() ->> 'aal' = 'aal2' into is_aal2;

    return coalesce(is_aal2, false);
end
$$ language plpgsql;

-- Grant access to the function to authenticated users
grant execute on function public.is_aal2() to authenticated;

/*
* public.is_super_admin
* Check if the user is a super admin. 
* A Super Admin is a user that has the role 'super-admin' and has MFA enabled.
*/
create
    or replace function public.is_super_admin() returns boolean
    set
        search_path = '' as
$$
declare
    is_super_admin boolean;
begin
    if not public.is_aal2() then
        return false;
    end if;

    select (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'super-admin' into is_super_admin;

    return coalesce(is_super_admin, false);
end
$$ language plpgsql;

-- Grant access to the function to authenticated users
grant execute on function public.is_super_admin() to authenticated;

/*
* public.is_mfa_compliant
* Check if the user meets MFA requirements if they have MFA enabled.
* If the user has MFA enabled, then the user must have aal2 enabled. Otherwise, the user must have aal1 enabled (default behavior).
*/
create or replace function public.is_mfa_compliant() returns boolean
    set search_path = '' as
$$
begin
    return array[(select auth.jwt()->>'aal')] <@ (
        select
            case
                when count(id) > 0 then array['aal2']
                else array['aal1', 'aal2']
                end as aal
        from auth.mfa_factors
        where ((select auth.uid()) = auth.mfa_factors.user_id) and auth.mfa_factors.status = 'verified'
    );
end
$$ language plpgsql security definer;

-- Grant access to the function to authenticated users
grant execute on function public.is_mfa_compliant() to authenticated;

-- MFA Restrictions:
-- the following policies are applied to the tables as a
-- restrictive policy to ensure that if MFA is enabled, then the policy will be applied.
-- For users that have not enabled MFA, the policy will not be applied and will keep the default behavior.

-- Restrict access to accounts if MFA is enabled
create policy restrict_mfa_accounts
    on public.accounts
    as restrictive
    to authenticated
    using (public.is_mfa_compliant());

-- Restrict access to accounts memberships if MFA is enabled
create policy restrict_mfa_accounts_memberships
    on public.accounts_memberships
    as restrictive
    to authenticated
    using (public.is_mfa_compliant());

-- Restrict access to role permissions if MFA is enabled
create policy restrict_mfa_role_permissions
    on public.role_permissions
    as restrictive
    to authenticated
    using (public.is_mfa_compliant());

-- Restrict access to invitations if MFA is enabled
create policy restrict_mfa_invitations
    on public.invitations
    as restrictive
    to authenticated
    using (public.is_mfa_compliant());

-- Restrict access to notifications if MFA is enabled
create policy restrict_mfa_notifications
    on public.notifications
    as restrictive
    to authenticated
    using (public.is_mfa_compliant());