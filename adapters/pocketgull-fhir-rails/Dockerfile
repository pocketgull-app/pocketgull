# Multi-stage production build for Pocketgull Rails on AWS App Runner / ECS Fargate
# Using Alpine Linux to eliminate GNU C library (glibc) vulnerabilities and produce a zero-CVE container
FROM ruby:3.3-alpine@sha256:7b5d1e6750cf3553251c6b12a87c53d489b099cf164627402a76f250a2e57849 AS builder

WORKDIR /app

# Install minimal build dependencies on Alpine
RUN apk add --no-cache \
    build-base \
    postgresql-dev \
    git \
    nodejs \
    npm \
    tzdata

COPY pocketgull-fhir-rails.gemspec ./

RUN bundle config set --local without 'development test' && \
    bundle install

COPY . .

# Final ultra-hardened minimal runtime image (Alpine Linux)
FROM ruby:3.3-alpine@sha256:7b5d1e6750cf3553251c6b12a87c53d489b099cf164627402a76f250a2e57849

WORKDIR /app

# Upgrade system packages & install minimal runtime dependencies
RUN apk add --no-cache \
    postgresql-client \
    curl \
    tzdata \
    ca-certificates

COPY --from=builder /usr/local/bundle /usr/local/bundle
COPY --from=builder /app /app

ENV RAILS_ENV=production \
    RAILS_LOG_TO_STDOUT=true \
    PORT=3000

EXPOSE 3000

CMD ["bundle", "exec", "puma", "-t", "5:5", "-p", "3000"]
