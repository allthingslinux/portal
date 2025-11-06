/*
 * -------------------------------------------------------
 * Section: Roles
 * We create the schema for the roles. Roles are the roles for an account. For example, an account might have the roles 'owner', 'admin', and 'member'.
 * -------------------------------------------------------
 */

-- Roles Table
create table if not exists
  public.roles (
    name varchar(50) not null,
    hierarchy_level int not null check (hierarchy_level > 0),
    primary key (name),
    unique (hierarchy_level)
  );

-- Revoke all on roles table from authenticated and service_role
revoke all on public.roles
from
  authenticated,
  service_role;

-- Open up access to roles table for authenticated users and service_role
grant
select
on table public.roles to authenticated,
service_role;

-- RLS
alter table public.roles enable row level security;