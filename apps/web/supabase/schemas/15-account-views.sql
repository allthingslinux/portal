/*
 * -------------------------------------------------------
 * Section: Account Functions
 * We create the schema for the functions. Functions are the custom functions for the application.
 * -------------------------------------------------------
 */


--
-- VIEW "user_account_workspace":
-- we create a view to load the general app data for the authenticated
-- user which includes the user accounts and memberships
create or replace view
    public.user_account_workspace
            with
            (security_invoker = true) as
select
    accounts.id as id,
    accounts.name as name,
    accounts.picture_url as picture_url
from
    public.accounts
where
    primary_owner_user_id = (select auth.uid ())
  and accounts.is_personal_account = true
limit
    1;

grant
    select
    on public.user_account_workspace to authenticated,
    service_role;

--
-- VIEW "user_accounts":
-- we create a view to load the user's accounts and memberships
-- useful to display the user's accounts in the app
create or replace view
    public.user_accounts (id, name, picture_url, slug, role)
        with
        (security_invoker = true) as
select
    account.id,
    account.name,
    account.picture_url,
    account.slug,
    membership.account_role
from
    public.accounts account
        join public.accounts_memberships membership on account.id = membership.account_id
where
    membership.user_id = (select auth.uid ())
  and account.is_personal_account = false
  and account.id in (
    select
        account_id
    from
        public.accounts_memberships
    where
        user_id = (select auth.uid ())
);

grant
    select
    on public.user_accounts to authenticated,
    service_role;

--
-- Function "public.team_account_workspace"
-- Load all the data for a team account workspace
create or replace function public.team_account_workspace(account_slug text)
returns table (
    id uuid,
    name varchar(255),
    picture_url varchar(1000),
    slug text,
    role varchar(50),
    role_hierarchy_level int,
    primary_owner_user_id uuid,
    permissions public.app_permissions[]
)
set search_path to ''
as $$
begin
    return QUERY
    select
        accounts.id,
        accounts.name,
        accounts.picture_url,
        accounts.slug,
        accounts_memberships.account_role,
        roles.hierarchy_level,
        accounts.primary_owner_user_id,
        array_agg(role_permissions.permission)
    from
        public.accounts
        join public.accounts_memberships on accounts.id = accounts_memberships.account_id
        join public.roles on accounts_memberships.account_role = roles.name
        left join public.role_permissions on accounts_memberships.account_role = role_permissions.role
    where
        accounts.slug = account_slug
        and public.accounts_memberships.user_id = (select auth.uid())
    group by
        accounts.id,
        accounts_memberships.account_role,
        roles.hierarchy_level;
end;
$$ language plpgsql;

grant
execute on function public.team_account_workspace (text) to authenticated,
service_role;
