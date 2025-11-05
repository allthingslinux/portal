
/**
 * -------------------------------------------------------
 * Section: Notifications
 * We create the schema for the notifications. Notifications are the notifications for an account.
 * -------------------------------------------------------
 */
create type public.notification_channel as enum('in_app', 'email');

create type public.notification_type as enum('info', 'warning', 'error');

create table if not exists
  public.notifications (
    id bigint generated always as identity primary key,
    account_id uuid not null references public.accounts (id) on delete cascade,
    type public.notification_type not null default 'info',
    body varchar(5000) not null,
    link varchar(255),
    channel public.notification_channel not null default 'in_app',
    dismissed boolean not null default false,
    expires_at timestamptz default (now() + interval '1 month'),
    created_at timestamptz not null default now()
  );

comment on table notifications is 'The notifications for an account';

comment on column notifications.account_id is 'The account the notification is for (null for system messages)';

comment on column notifications.type is 'The type of the notification';

comment on column notifications.body is 'The body of the notification';

comment on column notifications.link is 'The link for the notification';

comment on column notifications.channel is 'The channel for the notification';

comment on column notifications.dismissed is 'Whether the notification has been dismissed';

comment on column notifications.expires_at is 'The expiry date for the notification';

comment on column notifications.created_at is 'The creation date for the notification';

-- Revoke all access to notifications table for authenticated users and service_role
revoke all on public.notifications
from
  authenticated,
  service_role;

-- Open up relevant access to notifications table for authenticated users and service_role
grant
select
,
update on table public.notifications to authenticated,
service_role;

grant insert on table public.notifications to service_role;

-- enable realtime
alter publication supabase_realtime
add table public.notifications;

-- Indexes
-- Indexes on the notifications table
-- index for selecting notifications for an account that are not dismissed and not expired
create index idx_notifications_account_dismissed on notifications (account_id, dismissed, expires_at);

-- RLS
alter table public.notifications enable row level security;

-- SELECT(notifications):
-- Users can read notifications on an account they are a member of
create policy notifications_read_self on public.notifications for
select
  to authenticated using (
    account_id = (
      select
        auth.uid ()
    )
    or has_role_on_account (account_id)
  );

-- UPDATE(notifications):
-- Users can set notifications to read on an account they are a member of
create policy notifications_update_self on public.notifications
for update
  to authenticated using (
    account_id = (
      select
        auth.uid ()
    )
    or has_role_on_account (account_id)
  );

-- Function "public.update_notification_dismissed_status"
-- Make sure the only updatable field is the dismissed status and nothing else
create
or replace function public.update_notification_dismissed_status () returns trigger
set
  search_path to '' as $$
begin
    old.dismissed := new.dismissed;

    if (new is distinct from old) then
         raise exception 'UPDATE of columns other than "dismissed" is forbidden';
    end if;

    return old;
end;
$$ language plpgsql;

-- add trigger when updating a notification to update the dismissed status
create trigger update_notification_dismissed_status before
update on public.notifications for each row
execute procedure public.update_notification_dismissed_status ();