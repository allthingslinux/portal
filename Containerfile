# ============================================================================
# Multi-stage Containerfile for Portal (Turborepo Monorepo)
# ============================================================================
# Stage 1: Pruner  - Prune workspace to only @portal/portal and its deps
# Stage 2: Deps    - Install production dependencies from pruned lockfile
# Stage 3: Builder - Build the Next.js application via turbo
# Stage 4: Runner  - Minimal production runtime
# ============================================================================

# Base image pinned for reproducibility
ARG NODE_IMAGE=node:24-alpine@sha256:7fddd9ddeae8196abf4a3ef2de34e11f7b1a722119f91f28ddf1e99dcafdf114

# ============================================================================
# Stage 1: Pruner — generate minimal workspace subset
# ============================================================================
FROM ${NODE_IMAGE} AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate
RUN pnpm add -g turbo@^2

# Copy the full monorepo (filtered by .dockerignore)
COPY . .

# Prune to only the portal app and its workspace dependencies
RUN turbo prune @portal/portal --docker

# ============================================================================
# Stage 2: Deps — install dependencies from pruned package.json files
# ============================================================================
FROM ${NODE_IMAGE} AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

# Copy only the pruned package.json files and lockfile (maximises layer cache)
COPY --from=pruner /app/out/json/ .

# Install dependencies using the pruned lockfile
RUN pnpm install --frozen-lockfile

# ============================================================================
# Stage 3: Builder — build the application
# ============================================================================
FROM ${NODE_IMAGE} AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

# Copy installed node_modules from deps stage
COPY --from=deps /app/ .

# Copy full source from pruned workspace
COPY --from=pruner /app/out/full/ .

# Build-time environment variables
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

ARG BETTER_AUTH_SECRET
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET

ARG BETTER_AUTH_URL
ENV BETTER_AUTH_URL=$BETTER_AUTH_URL

ARG GIT_COMMIT_SHA
ENV GIT_COMMIT_SHA=$GIT_COMMIT_SHA

ENV NEXT_TELEMETRY_DISABLED=1

# Build the portal app (turbo handles dependency ordering)
RUN pnpm turbo run build --filter=@portal/portal

# ============================================================================
# Stage 4: Runner — minimal production image
# ============================================================================
FROM ${NODE_IMAGE} AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs

# Copy standalone output, static assets, and public files
COPY --from=builder /app/apps/portal/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/portal/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/portal/.next/static ./.next/static

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check against /api/health
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
