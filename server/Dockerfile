FROM node:lts AS base
RUN apt-get update && apt-get install -y libc6-dev && rm -rf /var/lib/apt/lists/*
# RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY . .
RUN corepack enable \
  && corepack prepare pnpm@10.9.0 --activate \
  && pnpm install --filter @mlop/server... --frozen-lockfile \
  && IS_DOCKER=true \
     STORAGE_ENDPOINT=http://build.invalid \
     STORAGE_ACCESS_KEY_ID=build-placeholder \
     STORAGE_SECRET_ACCESS_KEY=build-placeholder \
     STORAGE_BUCKET=build-placeholder \
     CLICKHOUSE_URL=http://build.invalid \
     CLICKHOUSE_USER=build-placeholder \
     CLICKHOUSE_PASSWORD=build-placeholder \
     DATABASE_URL=postgresql://build:build@build.invalid/build \
     DATABASE_DIRECT_URL=postgresql://build:build@build.invalid/build \
     GITHUB_CLIENT_ID=build-placeholder \
     GITHUB_CLIENT_SECRET=build-placeholder \
     GOOGLE_CLIENT_ID=build-placeholder \
     GOOGLE_CLIENT_SECRET=build-placeholder \
     PUBLIC_URL=http://build.invalid \
     BETTER_AUTH_URL=http://build.invalid \
     BETTER_AUTH_SECRET=build-placeholder \
     pnpm --filter @mlop/server build

WORKDIR /app/server

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "./.next/standalone/server/server.js"]
EXPOSE 3001
