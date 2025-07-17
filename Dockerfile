# Base image
ARG NODE_VERSION=20-alpine
FROM node:${NODE_VERSION} AS base

# Environment setup
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app
EXPOSE 3000

# Dependencies stage
FROM base AS deps

RUN apk update \
  && apk add --no-cache openssl curl libc6-compat \
  && rm -rf /var/lib/apt/lists/* /var/cache/apk/*

WORKDIR /app
COPY package.json yarn.lock ./
COPY prisma ./prisma

RUN yarn install --frozen-lockfile --prefer-offline \
  && npx prisma generate \
  && yarn cache clean

# Test stage
FROM base AS test
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production=false --no-cache
COPY . .
CMD ["sh", "-c", "npx prisma db push && yarn test"]


# Development image
FROM base AS dev
WORKDIR /app
COPY . .
RUN yarn install
CMD ["sh", "-c", "npx prisma db push && yarn dev"]

# Builder stage
FROM base AS builder

ENV NODE_ENV=production
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN npx prisma generate
RUN yarn build

# Production image
FROM base AS production

ENV NODE_ENV=production

WORKDIR /app
USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app/. .

CMD ["sh", "-c", "npx prisma db push && yarn start"]