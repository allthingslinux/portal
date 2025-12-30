#!/bin/bash
set -e

echo "🔧 Running post-migration setup..."

# Apply database views
echo "Creating database views..."
docker exec portal-postgres psql -U portal -d portal -f /tmp/create-views.sql

# Copy the SQL file to the container first
docker cp src/core/database/migrations/create-views.sql portal-postgres:/tmp/create-views.sql

# Apply the views
docker exec portal-postgres psql -U portal -d portal -f /tmp/create-views.sql

# Clean up
docker exec portal-postgres rm /tmp/create-views.sql

echo "✅ Post-migration setup complete!"
