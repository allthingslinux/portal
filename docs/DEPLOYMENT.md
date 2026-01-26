# Deployment Guide

This guide covers deploying Portal to a Hetzner VPS with Cloudflare as a reverse proxy.

## Architecture

```
Users → Cloudflare (CDN/DDoS/SSL) → Hetzner VPS → Next.js App + PostgreSQL
```

## Prerequisites

### VPS Setup

1. **Hetzner VPS** with:
   - Ubuntu 22.04 LTS or newer
   - Minimum 2 CPU cores, 4GB RAM (4 cores, 8GB recommended for production)
   - Docker and Docker Compose installed
   - SSH access configured

2. **Install Docker and Docker Compose**:
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # Install Docker Compose (plugin)
   sudo apt-get update
   sudo apt-get install docker-compose-plugin
   
   # Add user to docker group (replace $USER with your username)
   sudo usermod -aG docker $USER
   ```

3. **Create deployment directory**:
   ```bash
   mkdir -p ~/portal
   cd ~/portal
   ```

### Cloudflare Setup

1. **Add your domain** to Cloudflare
2. **Point DNS** to your VPS IP (A record)
3. **Enable proxy** (orange cloud) for DDoS protection and CDN
4. **SSL/TLS mode**: Set to "Full (strict)"
5. **Firewall rules**: Optionally restrict to Cloudflare IPs only

### GitHub Secrets

Configure the following secrets in your GitHub repository settings:

**For both staging and production environments:**

- `VPS_HOST`: Your Hetzner VPS IP address or domain
- `VPS_USER`: SSH username (e.g., `deploy` or `root`)
- `VPS_SSH_KEY`: Private SSH key for authentication (generate with `ssh-keygen -t ed25519`)

**Optional:**
- `GITHUB_TOKEN`: Automatically provided, but can be overridden if needed

## Environment Variables

### Staging Environment

Create `.env.staging` on your VPS:

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@portal-db-staging:5432/portal_staging
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=portal_staging

# BetterAuth
BETTER_AUTH_SECRET=your-staging-secret-key-here
BETTER_AUTH_URL=https://staging.atl.dev

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=portal
SENTRY_AUTH_TOKEN=your-token
SENTRY_RELEASE=staging

# Other integrations
# XMPP_DOMAIN=xmpp.atl.chat
# PROSODY_REST_URL=https://prosody.example.com
```

### Production Environment

Create `.env.production` on your VPS:

```bash
# Database
DATABASE_URL=postgresql://postgres:your-secure-password@portal-db-production:5432/portal
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-production-password
POSTGRES_DB=portal

# BetterAuth
BETTER_AUTH_SECRET=your-production-secret-key-here
BETTER_AUTH_URL=https://atl.dev

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=portal
SENTRY_AUTH_TOKEN=your-token
SENTRY_RELEASE=production

# Other integrations
# XMPP_DOMAIN=xmpp.atl.chat
# PROSODY_REST_URL=https://prosody.example.com
```

**Security Notes:**
- Use strong, unique passwords for production
- Generate secure secrets: `openssl rand -base64 32`
- Never commit `.env` files to git
- Store secrets securely (consider using a secrets manager)

## Deployment Process

### Automatic Deployment

1. **Staging**: Automatically deploys on push to `main` branch
2. **Production**: Manual deployment via GitHub Actions workflow dispatch

### Manual Deployment

If you need to deploy manually:

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Navigate to deployment directory
cd ~/portal

# Pull latest image
docker pull ghcr.io/allthingslinux/portal:staging-<commit-sha>

# Deploy
export GITHUB_REPOSITORY="allthingslinux/portal"
export GIT_COMMIT_SHA="<commit-sha>"
docker compose -f compose.staging.yaml up -d

# Or for production
docker compose -f compose.production.yaml up -d
```

## Database Migrations

Migrations run automatically during production deployments. For manual migration:

```bash
# On VPS
docker compose -f compose.production.yaml exec portal-app pnpm db:migrate
```

**Before production migrations:**
1. Backup database: `docker compose -f compose.production.yaml exec portal-db-production pg_dump -U postgres portal > backup.sql`
2. Test migrations on staging first
3. Review migration files in `drizzle/` directory

## Monitoring and Logs

### View Logs

```bash
# Application logs
docker compose -f compose.production.yaml logs -f portal-app

# Database logs
docker compose -f compose.production.yaml logs -f portal-db-production

# All logs
docker compose -f compose.production.yaml logs -f
```

### Health Checks

The application includes health check endpoints:
- `/api/health` - Application health status

Check container health:
```bash
docker compose -f compose.production.yaml ps
```

### Rollback

If deployment fails or you need to rollback:

```bash
# Stop current containers
docker compose -f compose.production.yaml down

# Pull previous image
docker pull ghcr.io/allthingslinux/portal:production-<previous-commit-sha>

# Update compose file with previous tag and restart
export GIT_COMMIT_SHA="<previous-commit-sha>"
docker compose -f compose.production.yaml up -d
```

## Cloudflare Configuration

### Recommended Settings

1. **SSL/TLS**:
   - Encryption mode: Full (strict)
   - Always Use HTTPS: On
   - Minimum TLS Version: 1.2

2. **Caching**:
   - Cache static assets (images, CSS, JS)
   - Bypass cache for API routes (`/api/*`)
   - Cache level: Standard

3. **Firewall Rules**:
   - Optionally restrict access to Cloudflare IPs only
   - Rate limiting for API endpoints

4. **Page Rules** (optional):
   - Cache static assets: `*.atl.dev/_next/static/*` → Cache Everything
   - Bypass API: `*.atl.dev/api/*` → Bypass Cache

### Nginx/Caddy Reverse Proxy (Optional)

If you want an additional reverse proxy on the VPS:

```nginx
# Nginx example
server {
    listen 80;
    server_name atl.dev;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

With Cloudflare in front, this is usually not necessary.

## Troubleshooting

### Container won't start

```bash
# Check logs
docker compose -f compose.production.yaml logs portal-app

# Check container status
docker compose -f compose.production.yaml ps

# Verify environment variables
docker compose -f compose.production.yaml exec portal-app env
```

### Database connection issues

```bash
# Check database is running
docker compose -f compose.production.yaml ps portal-db-production

# Test connection
docker compose -f compose.production.yaml exec portal-db-production psql -U postgres -d portal

# Check database logs
docker compose -f compose.production.yaml logs portal-db-production
```

### Port conflicts

Staging and production use different ports:
- Staging: App on 3001, DB on 5433
- Production: App on 3000, DB on 5432

If you need to change ports, update the compose files.

### Out of disk space

```bash
# Clean up unused images
docker image prune -af

# Clean up old containers
docker container prune -f

# Remove old volumes (careful!)
docker volume prune -f
```

## Security Best Practices

1. **Firewall**: Only allow SSH (22) and HTTP/HTTPS (80/443) from Cloudflare IPs
2. **SSH**: Use key-based authentication, disable password login
3. **Docker**: Run containers as non-root user (already configured)
4. **Secrets**: Never commit secrets, use environment variables
5. **Updates**: Keep VPS and Docker images updated
6. **Backups**: Regular database backups
7. **Monitoring**: Set up alerts for container failures

## Backup Strategy

### Database Backups

```bash
# Create backup
docker compose -f compose.production.yaml exec portal-db-production \
  pg_dump -U postgres portal > backup-$(date +%Y%m%d-%H%M%S).sql

# Restore backup
docker compose -f compose.production.yaml exec -T portal-db-production \
  psql -U postgres portal < backup-20240126-120000.sql
```

### Automated Backups

Set up a cron job for daily backups:

```bash
# Add to crontab (crontab -e)
0 2 * * * cd ~/portal && docker compose -f compose.production.yaml exec -T portal-db-production pg_dump -U postgres portal > /backups/portal-$(date +\%Y\%m\%d).sql
```

## Scaling

For higher traffic, consider:

1. **Horizontal scaling**: Multiple app containers behind a load balancer
2. **Database**: Managed PostgreSQL (Hetzner Database, AWS RDS, etc.)
3. **Caching**: Redis for session storage
4. **CDN**: Cloudflare already provides this

Update compose files to add more app replicas:

```yaml
services:
  portal-app:
    deploy:
      replicas: 3
```

## Support

For issues or questions:
- Check logs first
- Review GitHub Actions workflow runs
- Check Cloudflare analytics for traffic patterns
- Review Sentry for error tracking
