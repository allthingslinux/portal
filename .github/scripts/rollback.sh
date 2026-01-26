#!/bin/bash
# ============================================================================
# Rollback Script for Portal Application
# ============================================================================
# This script rolls back the Portal application to a previous version
# It expects the following environment variables:
#   - COMPOSE_FILE: Docker Compose file to use (e.g., compose.staging.yaml)
#   - ENVIRONMENT: Deployment environment (staging or production)
#   - PREVIOUS_COMMIT: Git commit SHA or image tag to rollback to
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

# Determine image tag format
# If PREVIOUS_COMMIT looks like a full SHA, construct tag; otherwise use as-is
if [[ "$PREVIOUS_COMMIT" =~ ^[a-f0-9]{40}$ ]]; then
  # Full SHA provided, construct tag
  IMAGE_TAG="${ENVIRONMENT}-${PREVIOUS_COMMIT:0:7}"
elif [[ "$PREVIOUS_COMMIT" =~ ^[a-f0-9]{7,}$ ]]; then
  # Short SHA provided, construct tag
  IMAGE_TAG="${ENVIRONMENT}-${PREVIOUS_COMMIT}"
else
  # Assume it's already a tag (e.g., staging-abc1234 or production-xyz5678)
  IMAGE_TAG="$PREVIOUS_COMMIT"
fi

# Pull the previous image
echo "Rolling back to image: ghcr.io/$IMAGE_NAME:$IMAGE_TAG"
docker pull "ghcr.io/$IMAGE_NAME:$IMAGE_TAG" || {
  echo "Error: Failed to pull image ghcr.io/$IMAGE_NAME:$IMAGE_TAG"
  echo "Please verify the commit SHA or image tag is correct."
  exit 1
}

# Export environment variables for compose file
export GITHUB_REPOSITORY="$GITHUB_REPOSITORY"
export IMAGE_TAG="$IMAGE_TAG"

# Stop existing containers
echo "Stopping existing containers..."
docker compose -f "$COMPOSE_FILE" down --timeout 30 || true

# Start containers with previous image
echo "Starting containers with previous image..."
docker compose -f "$COMPOSE_FILE" up -d

# Wait for health check
echo "Waiting for application to be healthy..."
timeout=120
elapsed=0
while [ $elapsed -lt $timeout ]; do
  if docker compose -f "$COMPOSE_FILE" ps portal-app | grep -q "healthy"; then
    echo "Application is healthy after rollback!"
    break
  fi
  sleep 5
  elapsed=$((elapsed + 5))
done

# Check if health check timed out
if [ $elapsed -ge $timeout ]; then
  echo "Warning: Health check timeout after rollback."
  echo "Application may not be fully healthy. Please check logs manually."
fi

echo "Rollback completed to: $IMAGE_TAG"
echo "Current image: $(docker compose -f $COMPOSE_FILE ps portal-app | grep portal-app || echo 'Not found')"
