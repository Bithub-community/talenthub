FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate

FROM base AS install
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY apps/auth-service/package.json apps/auth-service/
COPY packages/db/package.json packages/db/
COPY packages/db/prisma packages/db/prisma
RUN pnpm install --frozen-lockfile

FROM install AS build
COPY apps/auth-service apps/auth-service
COPY packages/db packages/db
COPY tsconfig.base.json ./
RUN pnpm --filter @hr/db generate
RUN pnpm exec tsc -p apps/auth-service/tsconfig.json

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate
COPY --from=install /app/node_modules ./node_modules
COPY --from=build /app/apps/auth-service/dist ./apps/auth-service/dist
COPY apps/auth-service/package.json ./apps/auth-service/package.json

EXPOSE 4000
CMD ["node", "apps/auth-service/dist/main.js"]
