# Multi-stage Dockerfile for Google Cloud Run (Node 24 Alpine, Minimal Footprint)
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json vite.config.ts index.html ./
COPY public/ ./public/
COPY src/ ./src/

RUN npm ci && npm run build

# Production Runner
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package*.json ./
RUN npm ci --only=production

COPY server.js ./
COPY --from=builder /app/dist ./dist

EXPOSE 8080

USER node

CMD ["node", "server.js"]
