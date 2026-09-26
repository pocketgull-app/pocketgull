# ==========================================
# Pocket Gull — Production Container
# Pre-Compiled Local Build (Zero Cloud Compute)
# ==========================================
FROM node:24-alpine@sha256:50c8e8ca1d27439048670df5883f32d57cf81cff6233222c893fd0d9884cbd81

WORKDIR /app

# Patch OS-level vulnerabilities
RUN apk update && apk upgrade --no-cache

# Set Node environment to production
ENV NODE_ENV=production

# Install ONLY production dependencies (Zero devDependencies, zero esbuild in cloud)
COPY package*.json ./
COPY packages/core-sdk/package*.json ./packages/core-sdk/
COPY packages/pocketgull-github-app/package*.json ./packages/pocketgull-github-app/
COPY companion-apps/avs-therapy/package*.json ./companion-apps/avs-therapy/
COPY pocketgull_api/package*.json ./pocketgull_api/
RUN npm install --omit=dev --legacy-peer-deps --include-workspace-root --workspaces

# Copy pre-compiled distribution from local build (100% free local CPU)
COPY dist ./dist

# Copy server files & runtime assets
COPY server.js ./
COPY docs/openapi.json ./docs/openapi.json

# Create runtime directories with write permissions for non-root 'node' user
RUN mkdir -p /app/logs /app/data && chown -R node:node /app

USER node

EXPOSE 8080
ENV PORT=8080
ENV OTEL_SDK_DISABLED=true

CMD ["node", "dist/server/server.mjs"]
