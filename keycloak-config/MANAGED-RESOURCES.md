# Managed Resources Configuration

This document explains how keycloak-config-cli manages resources and prevents accidental deletions.

## Resource Management Modes

### 1. **No Management** (Default)
If you don't define a resource type in your config, keycloak-config-cli won't touch existing resources.

### 2. **Full Management** 
If you define a resource type, keycloak-config-cli will:
- Create/update defined resources
- **DELETE** resources not in your config

## Our Configuration

We use **safe defaults** to prevent accidental deletions:

```yaml
IMPORT_REMOTESTATE_ENABLED: true          # Only manage resources we created
IMPORT_MANAGED_REQUIRED_ACTIONS: no-delete # Don't delete Keycloak defaults
IMPORT_MANAGED_COMPONENTS: no-delete       # Don't delete system components  
IMPORT_MANAGED_AUTHENTICATION_FLOW: no-delete # Don't delete default flows
```

## Fully Managed Resources

These resources **WILL BE DELETED** if not in your config:

✅ **Safe to manage:**
- `clients` - We define our Portal client
- `roles` - We define portal-user, portal-admin
- `users` - We define admin user

⚠️ **Requires careful management:**
- `groups` - Only define if you want to manage ALL groups
- `client-scopes` - Only define if you want to manage ALL scopes
- `identity-providers` - Only define if you want to manage ALL providers

🚫 **Protected (no-delete):**
- `required-actions` - Keycloak defaults preserved
- `components` - System components preserved
- `authentication-flows` - Default flows preserved

## Best Practices

1. **Start Small**: Only define resources you actively manage
2. **Use Remote State**: Keep `IMPORT_REMOTESTATE_ENABLED: true`
3. **Test First**: Use development environment before production
4. **Export Before Changes**: Always backup existing configuration

## Example: Adding Groups

```json
{
  "groups": [
    {
      "name": "portal-users",
      "path": "/portal-users"
    }
  ]
}
```

⚠️ **Warning**: This will DELETE all other groups not listed!
