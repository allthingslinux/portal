begin;
create extension "basejump-supabase_test_helpers" version '0.0.6';

select no_plan();

-- Create test users for different scenarios
select tests.create_supabase_user('transitioning_admin');
select tests.create_supabase_user('revoking_mfa_admin');
select tests.create_supabase_user('concurrent_session_user');

-- Set up test users
select makerkit.set_identifier('transitioning_admin', 'transitioning@makerkit.dev');
select makerkit.set_identifier('revoking_mfa_admin', 'revoking@makerkit.dev');
select makerkit.set_identifier('concurrent_session_user', 'concurrent@makerkit.dev');

-- Test 1: Role Transition Scenarios
select makerkit.authenticate_as('transitioning_admin');
select makerkit.set_mfa_factor();
select makerkit.set_session_aal('aal2');

-- Initially not a super admin
select is(
    (select public.is_super_admin()),
    false,
    'User should not be super admin initially'
);

-- Grant super admin
select makerkit.set_super_admin();

select is(
    (select public.is_super_admin()),
    true,
    'User should now be super admin'
);

-- Test 2: MFA Revocation Scenarios
select makerkit.authenticate_as('revoking_mfa_admin');
select makerkit.set_mfa_factor();
select makerkit.set_session_aal('aal2');
select makerkit.set_super_admin();

-- Initially has super admin access
select is(
    (select public.is_super_admin()),
    true,
    'Admin should have super admin access initially'
);

-- Simulate MFA revocation by setting AAL1
select makerkit.set_session_aal('aal1');

select is(
    (select public.is_super_admin()),
    false,
    'Admin should lose super admin access when MFA is revoked'
);

-- Test 3: Concurrent Session Management
select makerkit.authenticate_as('concurrent_session_user');
select makerkit.set_mfa_factor();
select makerkit.set_session_aal('aal2');
select makerkit.set_super_admin();

-- Test access with AAL2
select is(
    (select public.is_super_admin()),
    true,
    'Should have super admin access with AAL2'
);

-- Simulate different session with AAL1
select makerkit.set_session_aal('aal1');

select is(
    (select public.is_super_admin()),
    false,
    'Should not have super admin access with AAL1 even if other session has AAL2'
);

-- Finish the tests and clean up
select * from finish();

rollback;