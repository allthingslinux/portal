begin;
create extension "basejump-supabase_test_helpers" version '0.0.6';

select no_plan();

-- Create Users
select tests.create_supabase_user('super_admin');
select tests.create_supabase_user('regular_user');
select tests.create_supabase_user('mfa_user');
select tests.create_supabase_user('malicious_user');
select tests.create_supabase_user('partial_mfa_user');

-- Set up test users
select makerkit.set_identifier('super_admin', 'super@makerkit.dev');
select makerkit.set_identifier('regular_user', 'regular@makerkit.dev');
select makerkit.set_identifier('mfa_user', 'mfa@makerkit.dev');
select makerkit.set_identifier('malicious_user', 'malicious@makerkit.dev');
select makerkit.set_identifier('partial_mfa_user', 'partial@makerkit.dev');

-- Test is_aal2 function
set local role postgres;

create or replace function makerkit.setup_super_admin() returns void as $$
begin
    perform makerkit.authenticate_as('super_admin');
    perform makerkit.set_mfa_factor();
    perform makerkit.set_session_aal('aal2');
    perform makerkit.set_super_admin();
end $$ language plpgsql;

-- Test super admin with AAL2
select makerkit.setup_super_admin();

select is(
    (select public.is_aal2()),
    true,
    'Super admin should have AAL2 authentication'
);

select is(
    (select public.is_super_admin()),
    true,
    'User should be identified as super admin'
);

-- Test regular user (no AAL2)
select makerkit.authenticate_as('regular_user');

select is(
    (select public.is_aal2()),
    false,
    'Regular user should not have AAL2 authentication'
);

select is(
    (select public.is_super_admin()),
    false,
    'Regular user should not be identified as super admin'
);

-- Test MFA compliance
set local role postgres;

select is(
    (select public.is_super_admin()),
    false,
    'Postgres user should not be identified as super admin'
);

select makerkit.authenticate_as('mfa_user');
select makerkit.set_mfa_factor();
select makerkit.set_session_aal('aal2');

select is(
    (select public.is_mfa_compliant()),
    true,
    'User with verified MFA should be MFA compliant because it is optional'
);

-- Test super admin access to protected tables
select makerkit.setup_super_admin();

-- Test malicious user attempts
select makerkit.authenticate_as('malicious_user');

-- Attempt to fake super admin role (should fail)
select is(
    (select public.is_super_admin()),
    false,
    'Malicious user cannot fake super admin role'
);

-- Test access to protected tables (should be restricted)
select is_empty(
    $$ select * from public.accounts where id != auth.uid() $$,
    'Malicious user should not access other accounts'
);

select is_empty(
    $$ select * from public.accounts_memberships where user_id != auth.uid() $$,
    'Malicious user should not access other memberships'
);

select is_empty(
);

-- Test partial MFA setup (not verified)
select makerkit.authenticate_as('partial_mfa_user');
select makerkit.set_session_aal('aal2');

-- Test regular user restricted access
select makerkit.authenticate_as('regular_user');

-- Test MFA restrictions
select makerkit.authenticate_as('regular_user');
select makerkit.set_mfa_factor();

-- Should be restricted without MFA
select is_empty(
    $$ select * from public.accounts $$,
    'Regular user without MFA should not access accounts when MFA is required'
);

-- A super admin without MFA should not be able to have super admin rights
select makerkit.authenticate_as('super_admin');
select makerkit.set_super_admin();

select is(
               (select public.is_super_admin()),
               false,
               'Super admin without MFA should not be able to have super admin rights'
       );

-- Test edge cases for MFA and AAL2
select makerkit.authenticate_as('mfa_user');
select makerkit.set_mfa_factor();
-- Set AAL1 despite having MFA to test edge case
select makerkit.set_session_aal('aal1');

select is(
    (select public.is_mfa_compliant()),
    false,
    'User with MFA but AAL1 session should not be MFA compliant'
);

select is_empty(
    $$ select * from public.accounts $$,
    'Non-compliant MFA should not be able to read any accounts'
);

select is_empty(
    $$ select * from public.accounts_memberships $$,
    'Non-compliant MFA should not be able to read any memberships'
);

-- A Super Admin should be able to access all tables when MFA is enabled
select makerkit.setup_super_admin();

select is(
    (select public.is_super_admin()),
    true,
    'Super admin has super admin rights'
);

-- Test comprehensive access for super admin
select isnt_empty(
    $$ select * from public.accounts where id = tests.get_supabase_uid('regular_user') $$,
    'Super admin should be able to access all accounts'
);

do $$
begin
    delete from public.accounts where id = tests.get_supabase_uid('regular_user');
end $$;

-- A Super admin cannot delete accounts directly
select isnt_empty(
    $$ select * from public.accounts where id = tests.get_supabase_uid('regular_user') $$,
    'Super admin should not be able to delete data directly'
);

set local role postgres;

-- update the account name to be able to test the update
do $$
begin
    update public.accounts set name = 'Regular User' where id = tests.get_supabase_uid('regular_user');
end $$;

-- re-authenticate as super admin
select makerkit.setup_super_admin();

-- test a super admin cannot update accounts directly
do $$
begin
    update public.accounts set name = 'Super Admin' where id = tests.get_supabase_uid('regular_user');
end $$;

select row_eq(
    $$ select name from public.accounts where id = tests.get_supabase_uid('regular_user') $$,
    row('Regular User'::varchar),
    'Super admin should not be able to update data directly'
);

-- Finish the tests and clean up
select * from finish();

rollback;