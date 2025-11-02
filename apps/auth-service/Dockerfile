# syntax=docker/dockerfile:1.6
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate

FROM base AS install
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/auth-service/package.json apps/auth-service/
COPY packages/db/package.json packages/db/
RUN pnpm install --frozen-lockfile --filter auth-service... --filter @hr/db...

FROM install AS build
COPY . .
RUN pnpm --filter auth-service build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate
COPY --from=install /app/node_modules ./node_modules
COPY --from=build /app/apps/auth-service/dist ./apps/auth-service/dist
COPY apps/auth-service/package.json ./apps/auth-service/package.json

EXPOSE 4000
CMD ["node", "apps/auth-service/dist/main.js"]
