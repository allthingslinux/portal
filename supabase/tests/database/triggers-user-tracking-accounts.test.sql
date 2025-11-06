BEGIN;
create extension "basejump-supabase_test_helpers" version '0.0.6';

select plan(3);

--- Test the trigger_set_user_tracking function on accounts table
--- This test verifies that created_by and updated_by are properly set on insert

--- Create test users
select tests.create_supabase_user('user_tracking_test1', 'tracking1@example.com');

------------
--- Test accounts table user tracking triggers - INSERT
------------

-- Authenticate as first user for insert
select makerkit.authenticate_as('user_tracking_test1');

-- Test INSERT: created_by and updated_by should be set to current user
INSERT INTO public.accounts (name, is_personal_account)
VALUES ('User Tracking Test Account', false);

SELECT ok(
    (SELECT created_by = tests.get_supabase_uid('user_tracking_test1')
     FROM public.accounts WHERE name = 'User Tracking Test Account'),
    'accounts: created_by should be set to current user on insert'
);

SELECT ok(
    (SELECT updated_by = tests.get_supabase_uid('user_tracking_test1')
     FROM public.accounts WHERE name = 'User Tracking Test Account'),
    'accounts: updated_by should be set to current user on insert'
);

SELECT ok(
    (SELECT created_by = updated_by
     FROM public.accounts WHERE name = 'User Tracking Test Account'),
    'accounts: created_by should equal updated_by on insert'
);

SELECT * FROM finish();

ROLLBACK;