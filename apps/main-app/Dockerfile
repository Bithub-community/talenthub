# syntax=docker/dockerfile:1.6

FROM node:22.20.0-alpine AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable && corepack prepare pnpm@8.15.4 --activate

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/main-app/package.json apps/main-app/
COPY apps/auth-service/package.json apps/auth-service/
COPY packages/db/package.json packages/db/

RUN pnpm install --filter hr-main-app... --filter @hr/db...

COPY . .

RUN pnpm --filter hr-main-app build

FROM node:22.20.0-alpine AS production
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

RUN corepack enable && corepack prepare pnpm@8.15.4 --activate

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/apps/main-app/.next ./apps/main-app/.next
COPY --from=builder /app/apps/main-app/public ./apps/main-app/public
COPY --from=builder /app/apps/main-app/package.json ./apps/main-app/package.json
