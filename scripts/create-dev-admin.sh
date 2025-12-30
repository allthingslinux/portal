#!/bin/bash

# Create development admin user for Portal realm
set -e

echo "Creating portal admin user..."

# Configure kcadm.sh
docker compose exec keycloak /opt/keycloak/bin/kcadm.sh config credentials \
  --server http://localhost:8080 \
  --realm master \
  --user admin \
  --password admin_password

# Create user
USER_ID=$(docker compose exec keycloak /opt/keycloak/bin/kcadm.sh create users -r portal \
  -s username=portal-admin \
  -s email=admin@portal.local \
  -s enabled=true \
  -s emailVerified=true \
  -s firstName=Portal \
  -s lastName=Admin \
  --id 2>/dev/null | grep -o "'.*'" | tr -d "'")

echo "Created user with ID: $USER_ID"

# Set password
docker compose exec keycloak /opt/keycloak/bin/kcadm.sh set-password -r portal \
  --username portal-admin \
  --new-password Portal_admin_123

# Add role
docker compose exec keycloak /opt/keycloak/bin/kcadm.sh add-roles -r portal \
  --uusername portal-admin \
  --rolename staff

echo "✅ Portal admin user created successfully!"
echo "   Username: portal-admin"
echo "   Email: admin@portal.local"
echo "   Password: Portal_admin_123"
echo "   Role: staff"
