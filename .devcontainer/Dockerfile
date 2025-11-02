FROM node:20-bullseye

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate

# Install dependencies for prisma client generation, openssl, and git
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl postgresql-client \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace
