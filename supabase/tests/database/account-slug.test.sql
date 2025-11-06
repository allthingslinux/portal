BEGIN;
create extension "basejump-supabase_test_helpers" version '0.0.6';

select no_plan();

--- we insert a user into auth.users and return the id into user_id to use

select tests.create_supabase_user('test1', 'test1@test.com');

select tests.create_supabase_user('test2');

-- Create an team account

select makerkit.authenticate_as('test1');

select public.create_team_account('Test');
select public.create_team_account('Test');
select public.create_team_account('Test');

-- should automatically create slugs for the accounts
select row_eq(
  $$ select slug from public.accounts where name = 'Test' and slug = 'test' $$,
  row('test'::text),
  'The first team account should automatically create a slug named "test"'
);

select row_eq(
  $$ select slug from public.accounts where name = 'Test' and slug = 'test-1' $$,
  row('test-1'::text),
  'The second team account should automatically create a slug named "test-1"'
);

select row_eq(
  $$ select slug from public.accounts where name = 'Test' and slug = 'test-2' $$,
  row('test-2'::text),
    'The third team account should automatically create a slug named "test-2"'
);

-- Should automatically update the slug if the name is updated
update public.accounts set name = 'Test 4' where slug = 'test-2';

select row_eq(
  $$ select slug from public.accounts where name = 'Test 4' $$,
  row('test-4'::text),
  'Updating the name of a team account should update the slug'
);

-- Should fail if the slug is updated to an existing slug
select throws_ok(
  $$ update public.accounts set slug = 'test-1' where slug = 'test-4' $$,
  'duplicate key value violates unique constraint "accounts_slug_key"'
);

-- Test special characters in the slug
update public.accounts set slug = 'test-5' where slug = 'test-4[';

select row_eq(
  $$ select slug from public.accounts where name = 'Test 4' $$,
  row('test-4'::text),
  'Updating the name of a team account should update the slug'
);

-- Test various special characters
update public.accounts set name = 'Test@Special#Chars$' where slug = 'test-4';

select row_eq(
  $$ select slug from public.accounts where name = 'Test@Special#Chars$' $$,
  row('test-special-chars'::text),
  'Special characters should be removed from slug'
);

-- Test multiple consecutive special characters
update public.accounts set name = 'Test!!Multiple---Special$$$Chars' where slug = 'test-special-chars';

select row_eq(
  $a$ select slug from public.accounts where name = 'Test!!Multiple---Special$$$Chars' $a$,
  row('test-multiple-special-chars'::text),
  'Multiple consecutive special characters should be replaced with single hyphen'
);

-- Test leading and trailing special characters
update public.accounts set name = '!!!LeadingAndTrailing###' where slug = 'test-multiple-special-chars';

select row_eq(
  $$ select slug from public.accounts where name = '!!!LeadingAndTrailing###' $$,
  row('leadingandtrailing'::text),
  'Leading and trailing special characters should be removed'
);

-- Test non-ASCII characters
update public.accounts set name = 'Testéñ中文Русский' where slug = 'leadingandtrailing';

select row_eq(
  $$ select slug from public.accounts where name = 'Testéñ中文Русский' $$,
  row('testen'::text),
  'Non-ASCII characters should be transliterated or removed'
);

-- Test mixed case with special characters
update public.accounts set name = 'Test Mixed CASE With Special@Chars!' where slug = 'testen';

select row_eq(
  $$ select slug from public.accounts where name = 'Test Mixed CASE With Special@Chars!' $$,
  row('test-mixed-case-with-special-chars'::text),
  'Mixed case should be converted to lowercase and special chars handled'
);

-- Test using parentheses
update public.accounts set name = 'Test (Parentheses)' where slug = 'test-mixed-case-with-special-chars';

select row_eq(
  $$ select slug from public.accounts where name = 'Test (Parentheses)' $$,
  row('test-parentheses'::text),
  'Parentheses should be removed from slug'
);

-- Test using asterisk
update public.accounts set name = 'Test * Asterisk' where slug = 'test-parentheses';

select row_eq(
  $$ select slug from public.accounts where name = 'Test * Asterisk' $$,
  row('test-asterisk'::text),
  'Asterisk should be removed from slug'
);

select * from finish();

ROLLBACK;