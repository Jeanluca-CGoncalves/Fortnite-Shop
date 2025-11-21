FROM node:20-alpine AS base

WORKDIR /app
ENV NODE_ENV production
ENV DATABASE_URL="file:./dev.db" 

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --omit=dev
RUN npx prisma generate

FROM base AS builder
COPY . .
RUN npx prisma db push --accept-data-loss

CMD ["node", "index.js"]