# Environment Variable Arrays Example

This example shows how to use environment variables for JSON arrays in Keycloak configurations.

## Current Implementation

### Environment Variables (.env)
```bash
# Single values that expand to arrays
PORTAL_REDIRECT_URIS="$(env:NEXT_PUBLIC_SITE_URL)/api/auth/callback/keycloak"
PORTAL_WEB_ORIGINS="$(env:NEXT_PUBLIC_SITE_URL)"

# Multiple values (comma-separated for post.logout.redirect.uris)
PORTAL_POST_LOGOUT_URIS="$(env:NEXT_PUBLIC_SITE_URL),$(env:NEXT_PUBLIC_SITE_URL)/auth/signin"
```

### JSON Configuration
```json
{
  "redirectUris": ["$(env:PORTAL_REDIRECT_URIS)"],
  "webOrigins": ["$(env:PORTAL_WEB_ORIGINS)"],
  "attributes": {
    "post.logout.redirect.uris": "$(env:PORTAL_POST_LOGOUT_URIS)"
  }
}
```

## Multiple Values Example

For multiple redirect URIs, you can use comma-separated values:

### Environment Variable
```bash
CLIENT_REDIRECT_URIS="https://app1.example.com/callback,https://app2.example.com/callback,https://app3.example.com/callback"
```

### JSON Configuration
```json
{
  "redirectUris": ["$(env:CLIENT_REDIRECT_URIS)"]
}
```

## Different Environments

### Development (.env.development)
```bash
PORTAL_REDIRECT_URIS="http://localhost:3000/api/auth/callback/keycloak"
PORTAL_WEB_ORIGINS="http://localhost:3000"
```

### Production (.env.production)
```bash
PORTAL_REDIRECT_URIS="https://portal.example.com/api/auth/callback/keycloak,https://portal-staging.example.com/api/auth/callback/keycloak"
PORTAL_WEB_ORIGINS="https://portal.example.com,https://portal-staging.example.com"
```

## Benefits

✅ **Environment Flexibility**: Different URLs per environment
✅ **Easy Maintenance**: Change URLs without editing JSON
✅ **Multiple Values**: Support for multiple redirect URIs
✅ **Variable Substitution**: Nested environment variable expansion
