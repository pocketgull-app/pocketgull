# ==========================================
# Stage 1: Build
# ==========================================
FROM node:24-bookworm@sha256:0d65b128504499d6fb35db0d603a1197efaa4356e545464197e937d2f92f6b3b AS builder

WORKDIR /app

# Set Node memory limit for build stability
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Patch OS-level vulnerabilities
RUN apk update && apk upgrade --no-cache

# Set Node environment to development during build stage to install devDependencies
ENV NODE_ENV=development

# Install ALL dependencies (including root & workspace devDependencies needed for tsc & ng build)
COPY package*.json ./
COPY docs/study/package*.json ./docs/study/
COPY companion-apps/avs-therapy/package*.json ./companion-apps/avs-therapy/
COPY pocketgull_api/package*.json ./pocketgull_api/
RUN npm install --legacy-peer-deps --include-workspace-root --workspaces --include=dev

# Copy source and build Angular SSR app
COPY . .
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# Prune devDependencies to keep production container small
RUN npm prune --omit=dev --legacy-peer-deps

# ==========================================
# Stage 2: Production
# ==========================================
FROM node:24-alpine@sha256:4b419b48b5f3965b6d5b0b2e2d8e411b3695276e185e495240cf200e6244f77a

WORKDIR /app

# Patch OS-level vulnerabilities in Alpine production image
RUN apk update && apk upgrade --no-cache

# Set Node to production mode
ENV NODE_ENV=production

# Copy package.json files (needed for package resolution / runtime)
COPY package*.json ./
# Copy pruned node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy compiled output from builder (includes browser, server, docs/study, data/)
COPY --from=builder /app/dist ./dist

# Copy runtime assets the server loads from the project root at startup
COPY --from=builder /app/docs/openapi.json ./docs/openapi.json

# Create runtime directories and ensure the non-root 'node' user has write permissions
RUN mkdir -p /app/logs /app/data && chown -R node:node /app

# Run as non-root user for security
USER node

# Expose the default Cloud Run port
EXPOSE 8080
ENV PORT=8080
ENV OTEL_SDK_DISABLED=true

CMD ["node", "dist/server/server.mjs"]
