#!/bin/bash
set -e

# Define paths
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
THEME_DIR="$PROJECT_ROOT/packages/keycloak-theme"

echo "🎨 Building Keycloak theme..."
cd "$THEME_DIR"
npm run build-keycloak-theme

echo "🔄 Restarting Keycloak container..."
cd "$PROJECT_ROOT"
docker compose restart keycloak

echo "✅ Theme deployed and Keycloak restarting!"
