#!/bin/bash

# Test keycloak-config-cli setup
echo "Testing keycloak-config-cli setup..."

# Check if services are running
echo "Checking service status..."
docker compose ps

echo -e "\n=== Testing configuration import ==="
docker compose run --rm keycloak-config

echo -e "\n=== Checking import logs ==="
docker compose logs keycloak-config

echo -e "\n=== Verifying realm creation ==="
echo "Check if portal realm exists at: http://localhost:8080/admin/master/console/#/portal"
