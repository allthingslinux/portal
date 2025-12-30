#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔍 Keycloak Security Audit${NC}"
echo "================================"

# Check if kcwarden is installed
if ! command -v kcwarden &> /dev/null; then
    echo -e "${YELLOW}⚠️  kcwarden not found. Installing...${NC}"
    pip install kcwarden
fi

# Ensure Keycloak is running
if ! docker compose ps keycloak | grep -q "Up"; then
    echo -e "${YELLOW}⚠️  Starting Keycloak...${NC}"
    docker compose up -d keycloak
    echo "Waiting for Keycloak to be ready..."
    sleep 30
fi

# Download current configuration
echo -e "${GREEN}📥 Downloading Keycloak configuration...${NC}"
kcwarden download \
    --realm portal \
    --auth-method password \
    --user admin \
    --output keycloak-config/portal-audit.json \
    http://localhost:8080

# Run security audit
echo -e "${GREEN}🔍 Running security audit...${NC}"
kcwarden audit keycloak-config/portal-audit.json \
    --format txt \
    --output keycloak-config/audit-results.txt \
    --min-severity MEDIUM \
    --fail-on-findings

echo -e "${GREEN}✅ Audit complete! Results saved to keycloak-config/audit-results.txt${NC}"
