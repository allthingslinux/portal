#!/bin/bash
set -e

echo "🗄️  Setting up portal database..."

# Enable UUID extension
echo "Enabling UUID extension..."
docker exec portal-postgres psql -U portal -d portal -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

# Push schema (creates all tables)
echo "Creating database schema..."
bun run db:push

# Create views that are marked as .existing() in schema
echo "Creating database views..."
docker exec portal-postgres psql -U portal -d portal -c "
-- User account workspace view
CREATE OR REPLACE VIEW user_account_workspace AS 
SELECT 
  a.id,
  a.name,
  a.picture_url
FROM accounts a 
WHERE a.is_personal_account = true
LIMIT 1;

-- User accounts view  
CREATE OR REPLACE VIEW user_accounts AS
SELECT 
  a.id,
  a.name,
  a.picture_url,
  a.slug,
  am.account_role as role
FROM accounts a
JOIN accounts_memberships am ON a.id = am.account_id;
"

# Seed initial data
echo "Seeding database..."
bun run db:seed

echo "✅ Database setup complete!"
