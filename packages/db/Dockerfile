FROM node:20-alpine

WORKDIR /app

RUN npm install -g prisma

COPY packages/db/prisma ./prisma

RUN prisma generate

CMD ["prisma", "db", "push", "--accept-data-loss"]
