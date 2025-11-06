create schema if not exists makerkit;

-- anon, authenticated, and service_role should have access to makerkit schema
grant USAGE on schema makerkit to anon, authenticated, service_role;

-- Don't allow public to execute any functions in the makerkit schema
alter default PRIVILEGES in schema makerkit revoke execute on FUNCTIONS from public;

-- Grant execute to anon, authenticated, and service_role for testing purposes
alter default PRIVILEGES in schema makerkit grant execute on FUNCTIONS to anon,
    authenticated, service_role;

create or replace function makerkit.get_id_by_identifier(   
  identifier text
)
  returns uuid
  as $$
begin

  return (select id from auth.users where raw_user_meta_data->>'test_identifier' = identifier);

end;

$$ language PLPGSQL;

create or replace function makerkit.set_identifier(
    identifier text,
    user_email text
)
    returns text
    security definer
    set search_path = auth, pg_temp
as
$$
begin
    update auth.users
    set raw_user_meta_data = jsonb_build_object('test_identifier', identifier)
    where email = user_email;

    return identifier;

end;

$$ language PLPGSQL;

create or replace function makerkit.get_account_by_slug(
    account_slug text
)
    returns setof accounts
as
$$
begin
    return query
        select *
        from accounts
        where slug = account_slug;

end;

$$ language PLPGSQL;

create or replace function makerkit.authenticate_as(
    identifier text
) returns void
as
$$
begin
    perform tests.authenticate_as(identifier);
    perform makerkit.set_session_aal('aal1');
end;
$$ language plpgsql;

create or replace function makerkit.get_account_id_by_slug(
    account_slug text
)
    returns uuid
as
$$

begin

    return
        (select id
         from accounts
         where slug = account_slug);

end;

$$ language PLPGSQL;


create or replace function makerkit.set_mfa_factor(
    identifier text = gen_random_uuid()
)
    returns void
as
$$
begin
    insert into "auth"."mfa_factors" ("id", "user_id", "friendly_name", "factor_type", "status", "created_at", "updated_at", "secret")
    values (gen_random_uuid(), auth.uid(), identifier, 'totp', 'verified', '2025-02-24 09:48:18.402031+00', '2025-02-24 09:48:18.402031+00',
            'HOWQFBA7KBDDRSBNMGFYZAFNPRSZ62I5');
end;
$$ language plpgsql security definer;

create or replace function makerkit.set_session_aal(session_aal auth.aal_level)
    returns void
as
$$
begin
    perform set_config('request.jwt.claims', json_build_object(
            'sub', current_setting('request.jwt.claims')::json ->> 'sub',
            'email', current_setting('request.jwt.claims')::json ->> 'email',
            'phone', current_setting('request.jwt.claims')::json ->> 'phone',
            'user_metadata', current_setting('request.jwt.claims')::json ->> 'user_metadata',
            'app_metadata', current_setting('request.jwt.claims')::json ->> 'app_metadata',
            'aal', session_aal)::text, true);
end;
$$ language plpgsql;

create or replace function makerkit.set_super_admin() returns void
as
$$
begin
    perform set_config('request.jwt.claims', json_build_object(
            'sub', current_setting('request.jwt.claims')::json ->> 'sub',
            'email', current_setting('request.jwt.claims')::json ->> 'email',
            'phone', current_setting('request.jwt.claims')::json ->> 'phone',
            'user_metadata', current_setting('request.jwt.claims')::json ->> 'user_metadata',
            'app_metadata', json_build_object('role', 'super-admin'),
            'aal', current_setting('request.jwt.claims')::json ->> 'aal'
        )::text, true);
end;
$$ language plpgsql;

begin;

select plan(1);

select is_empty($$
  select
    *
  from
    makerkit.get_account_by_slug('test') $$,
                'get_account_by_slug should return an empty set when the account does not exist'
       );

select *
from
    finish();

rollback;
