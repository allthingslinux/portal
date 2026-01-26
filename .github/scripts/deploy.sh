#!/bin/bash
# ============================================================================
# Deployment Script for Portal Application
# ============================================================================
# This script handles the deployment of the Portal application to a VPS
# It expects the following environment variables:
#   - IMAGE_TAG: Docker image tag to deploy
#   - COMPOSE_FILE: Docker Compose file to use (e.g., compose.staging.yaml)
#   - ENVIRONMENT: Deployment environment (staging or production)
#   - GIT_COMMIT_SHA: Git commit SHA being deployed
#   - GITHUB_REPOSITORY: GitHub repository (e.g., owner/repo)
#   - GITHUB_ACTOR: GitHub username
#   - GITHUB_TOKEN: GitHub token for registry authentication
#   - IMAGE_NAME: Docker image name (e.g., ghcr.io/owner/repo)
# ============================================================================

set -e

# Navigate to deployment directory
cd ~/portal || { echo 'Deployment directory not found'; exit 1; }

# Authenticate to GitHub Container Registry
echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_ACTOR" --password-stdin

# Pull the new image
echo "Pulling image: ghcr.io/$IMAGE_NAME:$IMAGE_TAG"
docker pull "ghcr.io/$IMAGE_NAME:$IMAGE_TAG" || exit 1

# Export environment variables for compose file
export GITHUB_REPOSITORY="$GITHUB_REPOSITORY"
export GIT_COMMIT_SHA="$GIT_COMMIT_SHA"
export IMAGE_TAG="$IMAGE_TAG"

# Stop existing containers gracefully
echo "Stopping existing containers..."
docker compose -f "$COMPOSE_FILE" down --timeout 30 || true

# Start new containers
echo "Starting new containers..."
docker compose -f "$COMPOSE_FILE" up -d

# Wait for health check
echo "Waiting for application to be healthy..."
timeout=120
elapsed=0
while [ $elapsed -lt $timeout ]; do
  if docker compose -f "$COMPOSE_FILE" ps portal-app | grep -q "healthy"; then
    echo "Application is healthy!"
    break
  fi
  sleep 5
  elapsed=$((elapsed + 5))
done

# Check if health check timed out
if [ $elapsed -ge $timeout ]; then
  echo "Health check timeout! Rolling back..."
  docker compose -f "$COMPOSE_FILE" down
  exit 1
fi

# Handle database migrations for production
if [ "$ENVIRONMENT" == "production" ]; then
  echo "Note: Database migrations should be run manually or via a separate migration step."
  echo "Run: docker compose -f $COMPOSE_FILE run --rm portal-app sh -c \"pnpm install && pnpm db:migrate\""
  echo "Or run migrations from host machine with database connection."
fi

# Clean up old images (keep images from last 7 days)
echo "Cleaning up old images..."
docker image prune -af --filter "until=168h" || true

echo "Deployment completed successfully!"
