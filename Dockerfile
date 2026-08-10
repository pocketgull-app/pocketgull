# ==========================================
# Stage 1: Build
# ==========================================
FROM node:24-bookworm AS builder

WORKDIR /app

# Set Node memory limit for build stability
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Patch OS-level vulnerabilities
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*

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
FROM node:24-bookworm-slim

WORKDIR /app

# Patch OS-level vulnerabilities in production image
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*

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
