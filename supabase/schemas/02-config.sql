/*
 * -------------------------------------------------------
 * Section: App Configuration
 * We create the configuration for the Supabase Portal to enable or disable features
 * -------------------------------------------------------
 */

create table if not exists
  public.config (
    enable_team_accounts boolean default true not null
  );

comment on table public.config is 'Configuration for the Supabase Portal.';

comment on column public.config.enable_team_accounts is 'Enable team accounts';

-- RLS(config)
alter table public.config enable row level security;

-- create config row
insert into
  public.config (
    enable_team_accounts
  )
values
  (true);

-- Revoke all on accounts table from authenticated and service_role
revoke all on public.config
from
  authenticated,
  service_role;

-- Open up access to config table for authenticated users and service_role
grant
select
  on public.config to authenticated,
  service_role;

-- RLS
-- SELECT(config):
-- Authenticated users can read the config
create policy "public config can be read by authenticated users" on public.config for
select
  to authenticated using (true);

-- Function to get the config settings
create
or replace function public.get_config () returns json
set
  search_path = '' as $$
declare
    result record;
begin
    select
        *
    from
        public.config
    limit 1 into result;

    return row_to_json(result);

end;

$$ language plpgsql;

-- Automatically set timestamps on tables when a row is inserted or updated
create
or replace function public.trigger_set_timestamps () returns trigger
set
  search_path = '' as $$
begin
    if TG_OP = 'INSERT' then
        new.created_at = now();

        new.updated_at = now();

    else
        new.updated_at = now();

        new.created_at = old.created_at;

    end if;

    return NEW;

end
$$ language plpgsql;

-- Automatically set user tracking on tables when a row is inserted or updated
create
or replace function public.trigger_set_user_tracking () returns trigger
set
  search_path = '' as $$
begin
    if TG_OP = 'INSERT' then
        new.created_by = auth.uid();
        new.updated_by = auth.uid();

    else
        new.updated_by = auth.uid();

        new.created_by = old.created_by;

    end if;

    return NEW;

end
$$ language plpgsql;

grant
execute on function public.get_config () to authenticated,
service_role;

-- Function "public.is_set"
-- Check if a field is set in the config
create
or replace function public.is_set (field_name text) returns boolean
set
  search_path = '' as $$
declare
    result boolean;
begin
    execute format('select %I from public.config limit 1', field_name) into result;

    return result;

end;

$$ language plpgsql;

grant
execute on function public.is_set (text) to authenticated;
