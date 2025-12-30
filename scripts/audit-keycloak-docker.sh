#!/bin/bash
set -e

# Run kcwarden audit using Docker Compose
echo "🔍 Running Keycloak security audit with kcwarden..."

# Create temp directory for audit files
mkdir -p keycloak-config/audit

# Set password from environment
export KCWARDEN_KEYCLOAK_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD:-admin_password}"

# Download configuration and run audit
docker compose --profile audit run --rm \
    -e KCWARDEN_KEYCLOAK_PASSWORD="$KCWARDEN_KEYCLOAK_PASSWORD" \
    kcwarden download \
    --realm portal \
    --auth-method password \
    --user admin \
    --output - \
    http://keycloak:8080 > keycloak-config/audit/portal-audit.json

docker compose --profile audit run --rm kcwarden audit \
    /config/audit/portal-audit.json \
    --format txt \
    --min-severity MEDIUM

echo "✅ Audit complete!"
