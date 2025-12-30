# Authentication Flow Examples

This directory contains example configurations for custom authentication flows.

## ⚠️ **Important Notice**

These are **EXAMPLES ONLY** and are **NOT automatically imported**.

Our current configuration uses:
```yaml
IMPORT_MANAGED_AUTHENTICATION_FLOW: no-delete
```

This means we **preserve** Keycloak's default authentication flows and don't manage custom flows yet.

## Available Examples

### `custom-auth-flow.json`
- Custom browser flow with optional 2FA
- Conditional OTP based on user attribute
- Enhanced security configuration

## To Use These Examples

1. **Review the configuration** carefully
2. **Test in development** environment first
3. **Remove the no-delete protection**:
   ```yaml
   # Remove or change this line in compose.yaml
   IMPORT_MANAGED_AUTHENTICATION_FLOW: no-delete
   ```
4. **Copy desired flows** to main realm configuration
5. **Update client bindings** if needed:
   ```json
   "authenticationFlowBindingOverrides": {
     "browser": "portal-browser-flow"
   }
   ```

## Best Practices

- ✅ **Test thoroughly** before production
- ✅ **Backup existing flows** before changes
- ✅ **Use descriptive aliases** for flows and configs
- ✅ **Document custom configurations** for team

## Common Use Cases

- **Multi-factor Authentication**: Conditional OTP/TOTP
- **Social Login Integration**: Custom identity provider flows  
- **Corporate SSO**: LDAP/SAML integration flows
- **Passwordless Authentication**: WebAuthn/FIDO2 flows
