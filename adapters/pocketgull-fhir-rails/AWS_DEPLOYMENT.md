# AWS Deployment Plan: Pocketgull SMART-on-FHIR Rails Engine

## Overview
This document outlines the containerization, environment configuration, and AWS deployment pipeline for running the **Pocketgull SMART-on-FHIR Rails Engine (`pocketgull-fhir-rails`)** on Amazon Web Services (AWS App Runner or AWS ECS Fargate).

---

## 🏗️ 1. Production Container Setup (`Dockerfile.rails`)

Location: `adapters/pocketgull-fhir-rails/Dockerfile`

```dockerfile
# Multi-stage production build for Rails on AWS
FROM ruby:3.3-slim AS builder

WORKDIR /app

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential libpq-dev git nodejs npm && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

COPY pocketgull-fhir-rails.gemspec ./
COPY lib/pocketgull/fhir/rails/version.rb lib/pocketgull/fhir/rails/

RUN bundle config set --local without 'development test' && \
    bundle install

COPY . .

# Final runtime image
FROM ruby:3.3-slim

WORKDIR /app

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y libpq-dev curl && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

COPY --from=builder /usr/local/bundle /usr/local/bundle
COPY --from=builder /app /app

ENV RAILS_ENV=production \
    RAILS_LOG_TO_STDOUT=true \
    PORT=3000

EXPOSE 3000

CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
```

---

## ☁️ 2. AWS App Runner Infrastructure Specification (`apprunner.yaml`)

Location: `adapters/pocketgull-fhir-rails/apprunner.yaml`

```yaml
version: '1.0'
runtime: docker
build:
  commands:
    build:
      - docker build -t pocketgull-fhir-rails .
run:
  runtime-version: latest
  command: bundle exec puma -t 5:5 -p 3000
  network:
    port: '3000'
  env:
    - name: RAILS_ENV
      value: production
    - name: RAILS_LOG_TO_STDOUT
      value: 'true'
  instance-configuration:
    cpu: '1024'
    memory: '2048'
```

---

## 🛡️ 3. AWS Architecture & Cost Control Checklist

1. **Service Target**: **AWS App Runner** (or **AWS ECS Fargate** behind an Application Load Balancer).
2. **Scale Protection**:
   * Minimum Provisioned Instances: `0` (or `1` low-memory 1 vCPU / 2GB instance for staging).
   * Auto-scaling max limit capped at `5` instances to prevent run-away billing.
3. **IAM & Secrets Management**:
   * Store EHR OAuth Client IDs and Secrets in **AWS Secrets Manager** (`/pocketgull/production/smart_client_secret`).
   * Attach minimal IAM Execution Role for CloudWatch Logs ingestion.
4. **Zero-Egress HIPAA Compliance**:
   * Patient payloads are processed in-memory within private AWS VPC subnets without persistent log storage of PHI.
