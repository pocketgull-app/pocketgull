# ==========================================
# Pocket Gull — Multi-Stage Production Container
# Stage 1 (builder): Production dependency assembly & dist/ hygiene gate
# Stage 2 (runtime): Minimal non-root Node 24 Alpine runtime with HEALTHCHECK
# ==========================================
FROM node:24-alpine@sha256:50c8e8ca1d27439048670df5883f32d57cf81cff6233222c893fd0d9884cbd81 AS builder

WORKDIR /app

ENV NODE_ENV=production

# Install ONLY production runtime dependencies (isolated in builder so npm caches never enter runtime)
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps --no-workspaces \
  && npm cache clean --force

# Copy pre-compiled Angular SSR distribution (verified by 8-gate pre-flight) and OpenAPI runtime spec
COPY dist ./dist
COPY docs/openapi.json ./docs/openapi.json

# Fail closed if SSR bundle is missing and strip any stray source maps or desktop fonts
RUN test -f /app/dist/server/server.mjs \
  && find /app/dist -type f \( -name '*.map' -o -name '*.ttf' \) -delete

# ==========================================
# Stage 2: Minimal Hardened Production Runtime
# ==========================================
FROM node:24-alpine@sha256:50c8e8ca1d27439048670df5883f32d57cf81cff6233222c893fd0d9884cbd81 AS runtime

WORKDIR /app

# Patch OS-level Alpine vulnerabilities
RUN apk update && apk upgrade --no-cache

ENV NODE_ENV=production
ENV PORT=8080
ENV OTEL_SDK_DISABLED=true

# Copy only clean production artifacts with non-root ownership (avoids duplicate chown layer bloat)
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/docs/openapi.json ./docs/openapi.json

# Create writable runtime directories for non-root 'node' user
RUN mkdir -p /app/logs /app/data && chown -R node:node /app/logs /app/data

USER node

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 8080) + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "dist/server/server.mjs"]
