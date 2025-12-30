# Keycloak Configuration

This directory contains Keycloak realm and client configurations managed by keycloak-config-cli.

## Structure

```
keycloak-config/
├── portal-realm.json          # Main realm configuration
├── environments/              # Environment-specific overrides
│   ├── development.yaml       # Development settings
│   └── production.yaml        # Production settings
├── examples/                  # Example configurations (not imported)
│   ├── custom-auth-flow.json  # Custom authentication flows
│   └── README.md              # Examples documentation
├── MANAGED-RESOURCES.md       # Resource management documentation
└── README.md
```

## ⚠️ **Important: Managed Resources**

keycloak-config-cli will **DELETE** resources not defined in your config for certain resource types. 

**Currently managed (safe):**
- ✅ `clients` - We define Portal client
- ✅ `roles` - We define portal roles  
- ✅ `users` - We define admin user

**Protected from deletion:**
- 🛡️ `required-actions` - Keycloak defaults preserved
- 🛡️ `components` - System components preserved
- 🛡️ `authentication-flows` - Default flows preserved

See `MANAGED-RESOURCES.md` for detailed information.

## Import Patterns

The configuration uses flexible import patterns:
- `**/*.json` - All JSON files recursively
- `**/*.yaml` - All YAML files recursively

## Usage

```bash
# Start the full stack (includes config import)
docker compose up -d

# Run config import only
docker compose run --rm keycloak-config

# View config import logs
docker compose logs keycloak-config
```

## Environment Overrides

- **Development**: Relaxed security, extended sessions, detailed logging
- **Production**: Enhanced security, strict sessions, comprehensive auditing

## Configuration Format

Files should follow the Keycloak export format with variable substitution:
- `$(env:VARIABLE_NAME)` - Environment variables
- `$(file:path/to/file)` - File contents
- `$(base64Decoder:encoded_value)` - Base64 decoding

## Export Existing Configuration

```bash
# Export realm
docker compose exec keycloak /opt/keycloak/bin/kc.sh export --realm portal --file /tmp/portal-export.json
docker compose cp keycloak:/tmp/portal-export.json ./keycloak-config/

# Clean exported configuration (removes IDs, defaults)
./scripts/clean-keycloak-export.sh keycloak-config/portal-export.json

# Review and add environment variables as needed
```

## Maintenance Scripts

- `./scripts/clean-keycloak-export.sh` - Clean exported configurations
- `./scripts/test-keycloak-config.sh` - Test configuration import
