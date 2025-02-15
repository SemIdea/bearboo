# Use a single base image definition
ARG NODE_VERSION=18-alpine
FROM node:${NODE_VERSION} AS base

# Set common environment variables
# ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs

WORKDIR /app
EXPOSE 3000

# Dependency management stage
FROM base AS deps

RUN apk update \
  && apk add --no-cache openssl curl libc6-compat \
  && rm -rf /var/lib/apt/lists/* \
  && rm -rf /var/cache/apk/*

RUN openssl version && curl --version
RUN curl -sf https://gobinaries.com/tj/node-prune | sh

WORKDIR /app
COPY package.json yarn.lock ./
COPY prisma ./prisma

RUN yarn install --production=true --frozen-lockfile --ignore-scripts \
  && npx prisma generate \
  && node-prune \
  && cp -R node_modules prod_node_modules \
  && yarn install --production=false --prefer-offline \
  && npx prisma generate \
  && rm -rf prisma \
  && yarn cache clean


# Test stage
FROM base AS test
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
CMD ["sh", "-c", "npx prisma db push && yarn test"]

# Development image
FROM base AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push && yarn dev"]

# Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# Final production image
FROM base AS production
WORKDIR /app
USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

CMD ["sh", "-c", "npx prisma db push && node server.js"]
