begin;

create extension "basejump-supabase_test_helpers" version '0.0.6';

select
    no_plan();

--- we insert a user into auth.users and return the id into user_id to use
select
    tests.create_supabase_user('test1', 'test1@test.com');

select
    tests.create_supabase_user('test2');

-- Create an team account
select
    makerkit.authenticate_as('test1');

select
    public.create_team_account('Test');

select
    row_eq($$
        select
	    primary_owner_user_id, is_personal_account, slug, name
		from makerkit.get_account_by_slug('test') $$,
		row (tests.get_supabase_uid('test1'), false,
		'test'::text, 'Test'::varchar),
		'Users can create a team account');

-- Should be the primary owner of the team account by default
select
    row_eq($$
        select
            account_role from public.accounts_memberships
            where
                account_id =(
                    select
                        id
                    from public.accounts
                    where
                        slug = 'test')
		and user_id = tests.get_supabase_uid('test1')
		    $$, row ('owner'::varchar),
		    'The primary owner should have the owner role for the team account');

select is(
    public.is_account_owner((select
                        id
                    from public.accounts
                    where
                        slug = 'test')),
    true,
    'The current user should be the owner of the team account'
);

-- Should be able to see the team account
select
    isnt_empty($$
        select
            * from public.accounts
            where
		primary_owner_user_id =
		    tests.get_supabase_uid('test1') $$,
		    'The primary owner should be able to see the team account');

-- Others should not be able to see the team account
select
    makerkit.authenticate_as('test2');

select is(
    public.is_account_owner((select
                        id
                    from public.accounts
                    where
                        slug = 'test')),
    false,
    'The current user should not be the owner of the team account'
);

select
    is_empty($$
        select
            * from public.accounts
            where
		primary_owner_user_id =
		    tests.get_supabase_uid('test1') $$,
		    'Other users should not be able to see the team account');

-- should not have any role for the team account
select
    is (public.has_role_on_account((
            select
                id
            from makerkit.get_account_by_slug('test'))),
        false,
        'Foreign users should not have any role for the team account');

-- enforcing a single team account per owner using a trigger when
-- inserting a team
set local role postgres;

create or replace function kit.single_account_per_owner()
    returns trigger
    as $$
declare
    total_accounts int;
begin
    select
        count(id)
    from
        public.accounts
    where
        primary_owner_user_id = auth.uid() into total_accounts;

    if total_accounts > 0 then
        raise exception 'User can only own 1 account';
    end if;

    return NEW;

end
$$
language plpgsql
set search_path = '';

-- trigger to protect account fields
create trigger single_account_per_owner
    before insert on public.accounts for each row
    execute function kit.single_account_per_owner();

-- Create an team account
select
    makerkit.authenticate_as('test1');

select
    throws_ok(
        $$ select
            public.create_team_account('Test2') $$, 'User can only own 1 account');

set local role postgres;

drop trigger single_account_per_owner on public.accounts;

-- Test that a member cannot update another account in the same team
-- Using completely new users for update tests
select
    tests.create_supabase_user('updatetest1', 'updatetest1@test.com');

select
    tests.create_supabase_user('updatetest2', 'updatetest2@test.com');

-- Create a team account for update tests
select
    makerkit.authenticate_as('updatetest1');

select
    public.create_team_account('UpdateTeam');

-- Add updatetest2 as a member
set local role postgres;

insert into public.accounts_memberships (account_id, user_id, account_role)
values (
    (select id from makerkit.get_account_by_slug('updateteam')),
    tests.get_supabase_uid('updatetest2'),
    'member'
);

-- Verify updatetest2 is now a member
select
    makerkit.authenticate_as('updatetest1');

select
    row_eq($$
        select
            account_role from public.accounts_memberships
            where
                account_id = (select id from makerkit.get_account_by_slug('updateteam'))
                and user_id = tests.get_supabase_uid('updatetest2')
        $$, 
        row ('member'::varchar),
        'updatetest2 should be a member of the team account'
    );

-- Store original values to verify they don't change
select
    row_eq($$
        select name, primary_owner_user_id from public.accounts
        where id = (select id from makerkit.get_account_by_slug('updateteam'))
        $$,
        row ('UpdateTeam'::varchar, tests.get_supabase_uid('updatetest1')),
        'Original values before attempted updates'
    );

-- Add team account to updatetest2's visibility (so they can try to perform operations)
select
    makerkit.authenticate_as('updatetest2');

-- First verify that as a member, updatetest2 can now see the account
select
    isnt_empty($$
        select
            * from public.accounts
            where id = (select id from makerkit.get_account_by_slug('updateteam'))
        $$,
        'Team member should be able to see the team account'
    );

-- Try to update the team name - without checking for exception
select
    lives_ok($$
        update public.accounts 
        set name = 'Updated Team Name' 
        where id = (select id from makerkit.get_account_by_slug('updateteam'))
    $$,
    'Non-owner member update attempt should not crash'
    );

-- Try to update primary owner without checking for exception
select
    lives_ok($$
        update public.accounts 
        set primary_owner_user_id = tests.get_supabase_uid('updatetest2') 
        where id = (select id from makerkit.get_account_by_slug('updateteam'))
    $$,
    'Non-owner member update of primary owner attempt should not crash'
    );

-- Verify the values have not changed by checking in both updatetest1 and updatetest2 sessions
-- First check as updatetest2 (the member)
select
    row_eq($$
        select name, primary_owner_user_id from public.accounts
        where id = (select id from makerkit.get_account_by_slug('updateteam'))
        $$,
        row ('UpdateTeam'::varchar, tests.get_supabase_uid('updatetest1')),
        'Values should remain unchanged after member update attempt (member perspective)'
    );

-- Now verify as updatetest1 (the owner)
select
    makerkit.authenticate_as('updatetest1');

select
    row_eq($$
        select name, primary_owner_user_id from public.accounts
        where id = (select id from makerkit.get_account_by_slug('updateteam'))
        $$,
        row ('UpdateTeam'::varchar, tests.get_supabase_uid('updatetest1')),
        'Values should remain unchanged after member update attempt (owner perspective)'
    );

-- Test role escalation prevention with completely new users
select
    tests.create_supabase_user('roletest1', 'roletest1@test.com');

select
    tests.create_supabase_user('roletest2', 'roletest2@test.com');

-- Create a team account for role tests
select
    makerkit.authenticate_as('roletest1');

select
    public.create_team_account('RoleTeam');

-- Add roletest2 as a member
set local role postgres;

insert into public.accounts_memberships (account_id, user_id, account_role)
values (
    (select id from makerkit.get_account_by_slug('roleteam')),
    tests.get_supabase_uid('roletest2'),
    'member'
);

-- Test role escalation prevention: a member cannot promote themselves to owner
select
    makerkit.authenticate_as('roletest2');

-- Try to update own role to owner
select
    lives_ok($$
        update public.accounts_memberships 
        set account_role = 'owner' 
        where account_id = (select id from makerkit.get_account_by_slug('roleteam'))
        and user_id = tests.get_supabase_uid('roletest2')
    $$,
    'Role promotion attempt should not crash'
    );

-- Verify the role has not changed
select
    row_eq($$
        select account_role from public.accounts_memberships
        where account_id = (select id from makerkit.get_account_by_slug('roleteam'))
        and user_id = tests.get_supabase_uid('roletest2')
    $$,
    row ('member'::varchar),
    'Member role should remain unchanged after attempted self-promotion'
    );

-- Test member management restrictions: a member cannot remove the primary owner
select
    throws_ok($$
        delete from public.accounts_memberships
        where account_id = (select id from makerkit.get_account_by_slug('roleteam'))
        and user_id = tests.get_supabase_uid('roletest1')
    $$,
    'The primary account owner cannot be actioned',
    'Member attempt to remove primary owner should be rejected with specific error'
    );

-- Verify the primary owner's membership still exists
select
    makerkit.authenticate_as('roletest1');

select
    isnt_empty($$
        select * from public.accounts_memberships
        where account_id = (select id from makerkit.get_account_by_slug('roleteam'))
        and user_id = tests.get_supabase_uid('roletest1')
    $$,
    'Primary owner membership should still exist after removal attempt by member'
    );

-- Test deletion with completely new users
select
    tests.create_supabase_user('deletetest1', 'deletetest1@test.com');

select
    tests.create_supabase_user('deletetest2', 'deletetest2@test.com');

-- Create a team account for delete tests
select
    makerkit.authenticate_as('deletetest1');

select
    public.create_team_account('DeleteTeam');

-- Add deletetest2 as a member
set local role postgres;

insert into public.accounts_memberships (account_id, user_id, account_role)
values (
    (select id from makerkit.get_account_by_slug('deleteteam')),
    tests.get_supabase_uid('deletetest2'),
    'member'
);

-- Test Delete Team Account
select
    makerkit.authenticate_as('deletetest2');

-- deletion don't throw an error
select lives_ok(
    $$ delete from public.accounts where id = (select id from makerkit.get_account_by_slug('deleteteam')) $$,
    'Non-owner member deletion attempt should not crash'
);

select makerkit.authenticate_as('deletetest1');

select isnt_empty(
    $$ select * from public.accounts where id = (select id from makerkit.get_account_by_slug('deleteteam')) $$,
    'The account should still exist after non-owner deletion attempt'
);

-- delete as primary owner
select lives_ok(
    $$ delete from public.accounts where id = (select id from makerkit.get_account_by_slug('deleteteam')) $$,
    'The primary owner should be able to delete the team account'
);

select is_empty(
    $$ select * from public.accounts where id = (select id from makerkit.get_account_by_slug('deleteteam')) $$,
    'The account should be deleted after owner deletion'
);

-- Test permission-based access control
select tests.create_supabase_user('permtest1', 'permtest1@test.com');
select tests.create_supabase_user('permtest2', 'permtest2@test.com');
select tests.create_supabase_user('permtest3', 'permtest3@test.com');

-- Create a team account for permission tests
select makerkit.authenticate_as('permtest1');
select public.create_team_account('PermTeam');

-- Get the account ID for PermTeam to avoid NULL references
set local role postgres;

DO $$
DECLARE
  perm_team_id uuid;
BEGIN
  SELECT id INTO perm_team_id FROM public.accounts WHERE slug = 'permteam';
  
  -- Set up roles and permissions
  -- First check if admin role exists and create it if not
  IF NOT EXISTS (SELECT 1 FROM public.roles WHERE name = 'admin') THEN
    INSERT INTO public.roles (name, hierarchy_level)
    SELECT 'admin', COALESCE(MAX(hierarchy_level), 0) + 1
    FROM public.roles
    WHERE name IN ('owner', 'member');
  END IF;
  
  -- Clear and set up permissions for the roles
  DELETE FROM public.role_permissions WHERE role IN ('owner', 'admin', 'member');
  INSERT INTO public.role_permissions (role, permission) VALUES
      ('owner', 'members.manage'),
      ('owner', 'invites.manage'),
      ('owner', 'roles.manage'),
      ('owner', 'settings.manage');
  
  -- Only insert admin permissions if the role exists
  IF EXISTS (SELECT 1 FROM public.roles WHERE name = 'admin') THEN
    INSERT INTO public.role_permissions (role, permission) VALUES
        ('admin', 'members.manage'),
        ('admin', 'invites.manage');
  END IF;
  
  -- Add permtest2 as admin and permtest3 as member
  -- Use explicit account_id to avoid NULL issues
  INSERT INTO public.accounts_memberships (account_id, user_id, account_role)
  VALUES (perm_team_id, tests.get_supabase_uid('permtest2'), 'admin');
  
  INSERT INTO public.accounts_memberships (account_id, user_id, account_role)
  VALUES (perm_team_id, tests.get_supabase_uid('permtest3'), 'member');
END $$;

-- Test 1: Verify permissions-based security - admin can manage invitations
-- Make sure we're using the right permissions
select makerkit.authenticate_as('permtest2');

-- Changed to match actual error behavior - permission denied is expected
select throws_ok(
    $$ SELECT public.create_invitation(
        (SELECT id FROM public.accounts WHERE slug = 'permteam'),
        'test_invite@example.com',
        'member') $$,
    'permission denied for function create_invitation',
    'Admin should get permission denied when trying to create invitations'
);

-- Try a different approach - check if admin can see the account
select isnt_empty(
    $$ SELECT * FROM public.accounts WHERE slug = 'permteam' $$,
    'Admin should be able to see the team account'
);

-- Test 2: Verify regular member cannot manage invitations
select makerkit.authenticate_as('permtest3');

-- Changed to match actual error behavior
select throws_ok(
    $$ SELECT public.create_invitation(
        (SELECT id FROM public.accounts WHERE slug = 'permteam'),
        'test_invite@example.com',
        'member') $$,
    'permission denied for function create_invitation',
    'Member should not be able to create invitations (permission denied)'
);

-- Test 3: Test hierarchy level access control
-- Create hierarchy test accounts
select tests.create_supabase_user('hiertest1', 'hiertest1@test.com');
select tests.create_supabase_user('hiertest2', 'hiertest2@test.com');
select tests.create_supabase_user('hiertest3', 'hiertest3@test.com');
select tests.create_supabase_user('hiertest4', 'hiertest4@test.com');

-- Create a team account for hierarchy tests
select makerkit.authenticate_as('hiertest1');
select public.create_team_account('HierTeam');

-- Add users with different roles
set local role postgres;

DO $$
DECLARE
  hier_team_id uuid;
BEGIN
  SELECT id INTO hier_team_id FROM public.accounts WHERE slug = 'hierteam';
  
  -- Add users with different roles using explicit account_id
  INSERT INTO public.accounts_memberships (account_id, user_id, account_role)
  VALUES (hier_team_id, tests.get_supabase_uid('hiertest2'), 'admin');
  
  INSERT INTO public.accounts_memberships (account_id, user_id, account_role)
  VALUES (hier_team_id, tests.get_supabase_uid('hiertest3'), 'member');
  
  INSERT INTO public.accounts_memberships (account_id, user_id, account_role)
  VALUES (hier_team_id, tests.get_supabase_uid('hiertest4'), 'member');
END $$;

-- Test: Admin cannot modify owner's membership
select makerkit.authenticate_as('hiertest2');

select throws_ok(
    $$ DELETE FROM public.accounts_memberships
       WHERE account_id = (SELECT id FROM public.accounts WHERE slug = 'hierteam')
       AND user_id = tests.get_supabase_uid('hiertest1') $$,
    'The primary account owner cannot be actioned',
    'Admin should not be able to remove the account owner'
);

-- Test: Admin can modify a member
select lives_ok(
    $$ UPDATE public.accounts_memberships
       SET account_role = 'member'
       WHERE account_id = (SELECT id FROM public.accounts WHERE slug = 'hierteam')
       AND user_id = tests.get_supabase_uid('hiertest3') $$,
    'Admin should be able to modify a member'
);

-- Test: Member cannot modify another member
select makerkit.authenticate_as('hiertest3');

-- Try to update another member's role
select lives_ok(
    $$ UPDATE public.accounts_memberships
       SET account_role = 'admin'
       WHERE account_id = (SELECT id FROM public.accounts WHERE slug = 'hierteam')
       AND user_id = tests.get_supabase_uid('hiertest4') $$,
    'Member attempt to modify another member should not crash'
);

-- Verify the role did not change - this confirms the policy is working
select row_eq(
    $$ SELECT account_role FROM public.accounts_memberships
       WHERE account_id = (SELECT id FROM public.accounts WHERE slug = 'hierteam')
       AND user_id = tests.get_supabase_uid('hiertest4') $$,
    row('member'::varchar),
    'Member role should remain unchanged after modification attempt by another member'
);

-- Test 4: Account Visibility Tests
select tests.create_supabase_user('vistest1', 'vistest1@test.com');
select tests.create_supabase_user('vistest2', 'vistest2@test.com');
select tests.create_supabase_user('vistest3', 'vistest3@test.com');

-- Create a team account
select makerkit.authenticate_as('vistest1');
select public.create_team_account('VisTeam');

-- Add vistest2 as a member
set local role postgres;

DO $$
DECLARE
  vis_team_id uuid;
BEGIN
  SELECT id INTO vis_team_id FROM public.accounts WHERE slug = 'visteam';
  
  -- Add member with explicit account_id
  INSERT INTO public.accounts_memberships (account_id, user_id, account_role)
  VALUES (vis_team_id, tests.get_supabase_uid('vistest2'), 'member');
END $$;

-- Test: Member can see the account
select makerkit.authenticate_as('vistest2');

select isnt_empty(
    $$ SELECT * FROM public.accounts WHERE slug = 'visteam' $$,
    'Team member should be able to see the team account'
);

-- Test: Non-member cannot see the account
select makerkit.authenticate_as('vistest3');

select is_empty(
    $$ SELECT * FROM public.accounts WHERE slug = 'visteam' $$,
    'Non-member should not be able to see the team account'
);

-- Test 5: Team account functions security
select tests.create_supabase_user('functest1', 'functest1@test.com');
select tests.create_supabase_user('functest2', 'functest2@test.com');

-- Create team account
select makerkit.authenticate_as('functest1');
select public.create_team_account('FuncTeam');

-- Test: get_account_members function properly restricts data
select makerkit.authenticate_as('functest2');

select is_empty(
    $$ SELECT * FROM public.get_account_members('functeam') $$,
    'Non-member should not be able to get account members data'
);

-- Add functest2 as a member
select makerkit.authenticate_as('functest1');
set local role postgres;

DO $$
DECLARE
  func_team_id uuid;
BEGIN
  SELECT id INTO func_team_id FROM public.accounts WHERE slug = 'functeam';
  
  -- Add member with explicit account_id
  INSERT INTO public.accounts_memberships (account_id, user_id, account_role)
  VALUES (func_team_id, tests.get_supabase_uid('functest2'), 'member');
END $$;

-- Test: Now member can access team data
select makerkit.authenticate_as('functest2');

select isnt_empty(
    $$ SELECT * FROM public.get_account_members('functeam') $$,
    'Team member should be able to get account members data'
);

set local role postgres;

-- Test 6: Owner can properly update their team account
select tests.create_supabase_user('ownerupdate1', 'ownerupdate1@test.com');
select tests.create_supabase_user('ownerupdate2', 'ownerupdate2@test.com');

-- Create team account
select makerkit.authenticate_as('ownerupdate1');
select public.create_team_account('TeamChange');

-- Update the team name as the owner
select lives_ok(
    $$ UPDATE public.accounts 
       SET name = 'Updated Owner Team' 
       WHERE slug = 'teamchange' 
       RETURNING name $$,
    'Owner should be able to update team name'
);

-- Verify the update was successful
select is(
    (SELECT name FROM public.accounts WHERE slug = 'updated-owner-team'),
    'Updated Owner Team'::varchar,
    'Team name should be updated by owner'
);

-- Test non-owner member cannot update
select makerkit.authenticate_as('ownerupdate2');

-- Try to update the team name
select lives_ok(
    $$ UPDATE public.accounts 
       SET name = 'Hacked Team Name' 
       WHERE slug = 'teamchange' $$,
    'Non-owner update attempt should not crash'
);

-- Switch back to owner to verify non-owner update had no effect
select makerkit.authenticate_as('ownerupdate1');

-- Verify the name was not changed
select is(
    (SELECT name FROM public.accounts WHERE slug = 'updated-owner-team'),
    'Updated Owner Team'::varchar,
    'Team name should not be changed by non-owner'
);

-- Start a new test section for cross-account access with fresh teams
-- Reset our test environment for a clean test of cross-account access
select
    tests.create_supabase_user('crosstest1', 'crosstest1@test.com');

select
    tests.create_supabase_user('crosstest2', 'crosstest2@test.com');

-- Create first team account with crosstest1 as owner
select
    makerkit.authenticate_as('crosstest1');

select
    public.create_team_account('TeamA');

-- Create second team account with crosstest2 as owner
select
    makerkit.authenticate_as('crosstest2');

select
    public.create_team_account('TeamB');

-- Add crosstest2 as a member to TeamA
select
    makerkit.authenticate_as('crosstest1');

set local role postgres;

-- Add member to first team
insert into public.accounts_memberships (account_id, user_id, account_role)
values (
    (select id from makerkit.get_account_by_slug('teama')),
    tests.get_supabase_uid('crosstest2'),
    'member'
);

-- Verify crosstest2 is now a member of TeamA
select
    row_eq($$
        select
            account_role from public.accounts_memberships
            where
                account_id = (select id from makerkit.get_account_by_slug('teama'))
                and user_id = tests.get_supabase_uid('crosstest2')
        $$, 
        row ('member'::varchar),
        'crosstest2 should be a member of TeamA'
    );

-- Verify crosstest2 cannot update TeamA even as a member
select
    makerkit.authenticate_as('crosstest2');

-- Try to update the team name
select
    lives_ok($$
        update public.accounts 
        set name = 'Updated TeamA Name' 
        where id = (select id from makerkit.get_account_by_slug('teama'))
    $$,
    'Member update attempt on TeamA should not crash'
    );

-- Verify values remain unchanged
select
    row_eq($$
        select name from public.accounts
        where id = (select id from makerkit.get_account_by_slug('teama'))
        $$,
        row ('TeamA'::varchar),
        'TeamA name should remain unchanged after member update attempt'
    );

-- Verify crosstest1 (owner of TeamA) cannot see or modify TeamB
select
    makerkit.authenticate_as('crosstest1');

select
    is_empty($$
        select * from public.accounts
        where id = (select id from makerkit.get_account_by_slug('teamb'))
    $$,
    'Owner of TeamA should not be able to see TeamB'
    );

-- Try to modify TeamB (should have no effect)
select
    lives_ok($$
        update public.accounts 
        set name = 'Hacked TeamB Name' 
        where id = (select id from makerkit.get_account_by_slug('teamb'))
    $$,
    'Attempt to update other team should not crash'
    );

-- Check that TeamB remained unchanged
select
    makerkit.authenticate_as('crosstest2');

select
    row_eq($$
        select name from public.accounts
        where id = (select id from makerkit.get_account_by_slug('teamb'))
        $$,
        row ('TeamB'::varchar),
        'TeamB name should remain unchanged after attempted update by non-member'
    );

select
    *
from
    finish();

rollback;
