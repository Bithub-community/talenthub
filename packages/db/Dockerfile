FROM node:22.20.0-alpine

WORKDIR /app

RUN npm install -g prisma

COPY packages/db/prisma ./prisma

RUN prisma generate

CMD ["prisma", "db", "push", "--accept-data-loss"]