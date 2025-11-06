/*
 * -------------------------------------------------------
 * Section: Memberships
 * We create the schema for the memberships. Memberships are the memberships for an account. For example, a user might be a member of an account with the role 'owner'.
 * -------------------------------------------------------
 */

-- Account Memberships table
create table if not exists
  public.accounts_memberships (
    user_id uuid references auth.users on delete cascade not null,
    account_id uuid references public.accounts (id) on delete cascade not null,
    account_role varchar(50) references public.roles (name) not null,
    created_at timestamptz default current_timestamp not null,
    updated_at timestamptz default current_timestamp not null,
    created_by uuid references auth.users,
    updated_by uuid references auth.users,
    primary key (user_id, account_id)
  );

comment on table public.accounts_memberships is 'The memberships for an account';

comment on column public.accounts_memberships.account_id is 'The account the membership is for';

comment on column public.accounts_memberships.account_role is 'The role for the membership';

-- Revoke all on accounts_memberships table from authenticated and service_role
revoke all on public.accounts_memberships
from
  authenticated,
  service_role;

-- Open up access to accounts_memberships table for authenticated users and service_role
grant
select
,
  insert,
update,
delete on table public.accounts_memberships to authenticated,
service_role;

-- Indexes on the accounts_memberships table
create index ix_accounts_memberships_account_id on public.accounts_memberships (account_id);

create index ix_accounts_memberships_user_id on public.accounts_memberships (user_id);

create index ix_accounts_memberships_account_role on public.accounts_memberships (account_role);

-- Triggers for accounts_memberships table
create trigger accounts_memberships_set_timestamps
before insert or update on public.accounts_memberships
for each row execute function public.trigger_set_timestamps();

create trigger accounts_memberships_set_user_tracking
before insert or update on public.accounts_memberships
for each row execute function public.trigger_set_user_tracking();

-- Enable RLS on the accounts_memberships table
alter table public.accounts_memberships enable row level security;

-- Function "public.prevent_account_owner_membership_delete"
-- Trigger to prevent a primary owner from being removed from an account
create
or replace function public.prevent_account_owner_membership_delete () returns trigger
set
  search_path = '' as $$
begin
    if exists(
        select
            1
        from
            public.accounts
        where
            id = old.account_id
            and primary_owner_user_id = old.user_id) then
    raise exception 'The primary account owner cannot be removed from the account membership list';

end if;

    return old;

end;

$$ language plpgsql;

create
or replace trigger prevent_account_owner_membership_delete_check before delete on public.accounts_memberships for each row
execute function public.prevent_account_owner_membership_delete ();

-- Function "public.prevent_memberships_update"
-- Trigger to prevent updates to account memberships with the exception of the account_role
create
or replace function public.prevent_memberships_update () returns trigger
set
  search_path = '' as $$
begin
    if new.account_role <> old.account_role then
        return new;
    end if;

    raise exception 'Only the account_role can be updated';

end; $$ language plpgsql;

create
or replace trigger prevent_memberships_update_check before
update on public.accounts_memberships for each row
execute function public.prevent_memberships_update ();

-- Function "public.has_role_on_account"
-- Function to check if a user has a role on an account
create
or replace function public.has_role_on_account (
  account_id uuid,
  account_role varchar(50) default null
) returns boolean language sql security definer
set
  search_path = '' as $$
    select
        exists(
            select
                1
            from
                public.accounts_memberships membership
            where
                membership.user_id = (select auth.uid())
                and membership.account_id = has_role_on_account.account_id
                and((membership.account_role = has_role_on_account.account_role
                    or has_role_on_account.account_role is null)));
$$;

grant
execute on function public.has_role_on_account (uuid, varchar) to authenticated;

-- Function "public.is_team_member"
-- Check if a user is a team member of an account or not
create
or replace function public.is_team_member (account_id uuid, user_id uuid) returns boolean language sql security definer
set
  search_path = '' as $$
    select
        exists(
            select
                1
            from
                public.accounts_memberships membership
            where
                public.has_role_on_account(account_id)
                and membership.user_id = is_team_member.user_id
                and membership.account_id = is_team_member.account_id);
$$;

grant
execute on function public.is_team_member (uuid, uuid) to authenticated,
service_role;

-- RLS
-- SELECT(roles)
-- authenticated users can query roles
create policy roles_read on public.roles for
select
  to authenticated using (
    true
  );

-- Function "public.can_action_account_member"
-- Check if a user can perform management actions on an account member
create
or replace function public.can_action_account_member (target_team_account_id uuid, target_user_id uuid) returns boolean
set
  search_path = '' as $$
declare
    permission_granted boolean;
    target_user_hierarchy_level int;
    current_user_hierarchy_level int;
    is_account_owner boolean;
    target_user_role varchar(50);
begin
    if target_user_id = auth.uid() then
      raise exception 'You cannot update your own account membership with this function';
    end if;

    -- an account owner can action any member of the account
    if public.is_account_owner(target_team_account_id) then
      return true;
    end if;

     -- check the target user is the primary owner of the account
    select
        exists (
            select
                1
            from
                public.accounts
            where
                id = target_team_account_id
                and primary_owner_user_id = target_user_id) into is_account_owner;

    if is_account_owner then
        raise exception 'The primary account owner cannot be actioned';
    end if;

    -- validate the auth user has the required permission on the account
    -- to manage members of the account
    select
 public.has_permission(auth.uid(), target_team_account_id,
     'members.manage'::public.app_permissions) into
     permission_granted;

    -- if the user does not have the required permission, raise an exception
    if not permission_granted then
      raise exception 'You do not have permission to action a member from this account';
    end if;

    -- get the role of the target user
    select
        am.account_role,
        r.hierarchy_level
    from
        public.accounts_memberships as am
    join
        public.roles as r on am.account_role = r.name
    where
        am.account_id = target_team_account_id
        and am.user_id = target_user_id
    into target_user_role, target_user_hierarchy_level;

    -- get the hierarchy level of the current user
    select
        r.hierarchy_level into current_user_hierarchy_level
    from
        public.roles as r
    join
        public.accounts_memberships as am on r.name = am.account_role
    where
        am.account_id = target_team_account_id
        and am.user_id = auth.uid();

    if target_user_role is null then
      raise exception 'The target user does not have a role on the account';
    end if;

    if current_user_hierarchy_level is null then
      raise exception 'The current user does not have a role on the account';
    end if;

    -- check the current user has a higher role than the target user
    if current_user_hierarchy_level >= target_user_hierarchy_level then
      raise exception 'You do not have permission to action a member from this account';
    end if;

    return true;

end;

$$ language plpgsql;

grant
execute on function public.can_action_account_member (uuid, uuid) to authenticated,
service_role;

-- RLS
-- SELECT(accounts_memberships):
-- Users can read their team members account memberships
create policy accounts_memberships_read on public.accounts_memberships for
select
  to authenticated using (
    (
      (
        select
          auth.uid ()
      ) = user_id
    )
    or is_team_member (account_id, user_id)
  );

create
or replace function public.is_account_team_member (target_account_id uuid) returns boolean
set
  search_path = '' as $$
    select exists(
        select 1
        from public.accounts_memberships as membership
        where public.is_team_member (membership.account_id, target_account_id)
    );
$$ language sql;

grant
execute on function public.is_account_team_member (uuid) to authenticated,
service_role;

-- RLS on the accounts table
-- SELECT(accounts):
-- Users can read the an account if
--   - they are the primary owner of the account
--   - they have a role on the account
--   - they are reading an account of the same team
create policy accounts_read on public.accounts for
select
  to authenticated using (
    (
      (
        select
          auth.uid ()
      ) = primary_owner_user_id
    )
    or public.has_role_on_account (id)
    or public.is_account_team_member (id)
  );

-- DELETE(accounts_memberships):
-- Users with the required role can remove members from an account or remove their own
create policy accounts_memberships_delete on public.accounts_memberships for delete to authenticated using (
  (
    user_id = (
      select
        auth.uid ()
    )
  )
  or public.can_action_account_member (account_id, user_id)
);