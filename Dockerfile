FROM oven/bun:1-alpine AS base

# 1. Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# 2. Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXTAUTH_URL

ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL

ENV DATABASE_URL=postgresql://placeholder:placeholder@localhost/placeholder
ENV NEXTAUTH_SECRET=placeholder-secret-minimum-32-characters-here
ENV FIREBASE_PRIVATE_KEY=placeholder
ENV FIREBASE_API_KEY=placeholder
ENV FIREBASE_CLIENT_EMAIL=placeholder@placeholder.com
ENV FIREBASE_PROJECT_ID=placeholder

# ✅ Path eksplisit untuk prisma v7 multi-schema
RUN if [ -d "prisma/schema" ]; then bunx prisma generate --schema ./prisma/schema; fi

RUN bun run build

# ✅ Stage migrator — full deps untuk migrate & seed
FROM base AS migrator
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated/prisma ./src/generated/prisma
COPY --from=builder /app/src/lib ./src/lib
COPY --from=builder /app/src/helper ./src/helper
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Tidak ada CMD — dijalankan dengan perintah eksplisit di workflow

# ✅ Production image — tetap ringan
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Prisma untuk runtime query (bukan migrate)
COPY --from=builder /app/src/generated/prisma ./src/generated/prisma
# ✅ Copy node_modules dari deps agar @prisma/adapter-pg tersedia
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]