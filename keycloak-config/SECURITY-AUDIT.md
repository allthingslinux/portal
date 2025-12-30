# Keycloak Security Auditing

We use [kcwarden](https://github.com/iteratec/kcwarden) to audit our Keycloak configuration for security vulnerabilities and misconfigurations.

## Quick Start

Run a security audit of the current Keycloak configuration:

```bash
./scripts/audit-keycloak.sh
```

This will:
1. Install kcwarden if not present
2. Download the current portal realm configuration
3. Run security checks with MEDIUM+ severity
4. Save results to `keycloak-config/audit-results.txt`

## Manual Usage

### Install kcwarden

```bash
pip install kcwarden
```

### Download Configuration

```bash
kcwarden download \
    --realm portal \
    --auth-method password \
    --user admin \
    --output keycloak-config/portal-audit.json \
    http://localhost:8080
```

### Run Audit

```bash
# Basic audit
kcwarden audit keycloak-config/portal-audit.json

# Detailed audit with specific output
kcwarden audit keycloak-config/portal-audit.json \
    --format json \
    --output keycloak-config/audit-results.json \
    --min-severity LOW
```

## Common Security Checks

kcwarden checks for:

### Client Security
- Public clients must enforce PKCE
- Confidential clients should disable direct access grants
- Wildcard redirect URIs should be avoided
- HTTPS redirect URIs for non-local clients
- Proper client authentication methods

### Realm Security
- Password policies are configured
- Brute force protection is enabled
- Email verification is enabled
- Access token lifespans are reasonable
- Refresh token security settings

### General Security
- Up-to-date Keycloak version
- Proper scope configurations
- Service account security

## Integration with CI/CD

Add to your CI pipeline:

```yaml
- name: Keycloak Security Audit
  run: |
    pip install kcwarden
    kcwarden download --realm portal --auth-method client --client-id audit-client http://keycloak:8080
    kcwarden audit config.json --fail-on-findings --min-severity HIGH
```

## Configuration

Generate a configuration template for custom auditor settings:

```bash
kcwarden generate-config-template --output keycloak-config/kcwarden-config.yaml
```

Then use it in audits:

```bash
kcwarden audit config.json --config keycloak-config/kcwarden-config.yaml
```
