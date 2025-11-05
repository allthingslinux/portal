/*
 * -------------------------------------------------------
 * Section: Enums
 * We create the enums for the schema
 * -------------------------------------------------------
 */

/*
* Permissions
- We create the permissions for the Supabase Portal. These permissions are used to manage the permissions for the roles
- The permissions are 'roles.manage', 'settings.manage', 'members.manage', and 'invites.manage'.
- You can add more permissions as needed.
*/
create type public.app_permissions as enum(
  'roles.manage',
  'settings.manage',
  'members.manage',
  'invites.manage'
);

/*
* Invitation Type
- We create the invitation type for the Supabase Portal. These types are used to manage the type of the invitation
*/
create type public.invitation as (email text, role varchar(50));
