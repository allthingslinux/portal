#!/bin/bash
# ============================================================================
# Database Migration Script for Portal Application (VPS-based)
# ============================================================================
# This script runs database migrations directly on the VPS using drizzle-kit
# It expects the following environment variables:
#   - COMPOSE_FILE: Docker Compose file to use (e.g., compose.staging.yaml)
#   - ENVIRONMENT: Deployment environment (staging or production)
#   - DATABASE_URL: Database connection string
#   - DRY_RUN: If "true", preview SQL without executing
# ============================================================================
# According to Drizzle docs: drizzle-kit migrate reads migration files from
# the drizzle/ directory and applies them to the database
# ============================================================================

set -e

# Navigate to deployment directory
cd ~/portal || { echo 'Deployment directory not found'; exit 1; }

echo "Running database migrations for $ENVIRONMENT environment..."

# Ensure we have the latest migration files from the repository
# This ensures migrations are always up-to-date before running
if [ -d ".git" ]; then
  echo "Updating migration files from repository..."
  git fetch origin main || true
  git checkout origin/main -- drizzle/ 2>/dev/null || {
    echo "⚠️  Warning: Could not update migration files from git"
    echo "Proceeding with existing migration files..."
  }
fi

# Check if migration files exist
if [ ! -d "drizzle" ] || [ -z "$(find drizzle -name "*.sql" -type f 2>/dev/null)" ]; then
  echo "❌ Error: Migration files not found in drizzle/ directory"
  echo "Migration files should be synced from the repository"
  echo "Consider pulling the latest code: git pull origin main"
  exit 1
fi

# Check if Node.js and pnpm are available
if ! command -v node &> /dev/null; then
  echo "❌ Error: Node.js is not installed"
  exit 1
fi

# Install drizzle-kit if not available
if ! command -v drizzle-kit &> /dev/null; then
  echo "Installing drizzle-kit..."
  if command -v pnpm &> /dev/null; then
    pnpm add -g drizzle-kit@latest
  elif command -v npm &> /dev/null; then
    npm install -g drizzle-kit@latest
  else
    echo "❌ Error: Neither pnpm nor npm is available"
    exit 1
  fi
fi

# Check if config file exists (required for drizzle-kit migrate)
if [ ! -f "src/lib/db/config.ts" ]; then
  echo "❌ Error: src/lib/db/config.ts not found"
  echo "Drizzle config file is required for running migrations"
  exit 1
fi

# Verify DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable is not set"
  echo "Database connection string is required for migrations"
  exit 1
fi

if [ "$DRY_RUN" == "true" ]; then
  echo "⚠️  DRY RUN MODE: Previewing migrations without executing"
  echo ""
  echo "Migration files found:"
  find drizzle -name "*.sql" -type f | sort | head -20
  echo ""
  echo "Total migration directories: $(find drizzle -mindepth 1 -maxdepth 1 -type d | wc -l)"
  echo ""
  echo "Note: drizzle-kit migrate will:"
  echo "  1. Read migration files from drizzle/ directory"
  echo "  2. Check __drizzle_migrations__ table for applied migrations"
  echo "  3. Apply only new migrations that haven't been run"
  echo ""
  echo "To execute migrations, run the workflow again with dry_run: false"
else
  echo "Executing database migrations..."
  echo "Using DATABASE_URL from environment..."
  echo "Using config file: src/lib/db/config.ts"
  echo ""
  
  # Run migrations using drizzle-kit migrate
  # According to Drizzle docs:
  # - Reads migration files from drizzle/ directory (specified in config.out)
  # - Fetches migration history from __drizzle_migrations__ table
  # - Applies only new migrations that haven't been run
  drizzle-kit migrate --config src/lib/db/config.ts || {
    echo ""
    echo "❌ Migration failed!"
    echo "Please review the error above and fix any issues before retrying."
    echo ""
    echo "Common issues:"
    echo "  - Database connection failed (check DATABASE_URL)"
    echo "  - Migration files are missing or corrupted"
    echo "  - Database permissions insufficient"
    exit 1
  }
  
  echo ""
  echo "✅ Migrations completed successfully!"
  echo "Applied migrations are logged in __drizzle_migrations__ table"
fi
