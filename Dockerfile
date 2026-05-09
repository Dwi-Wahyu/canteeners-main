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

ARG DATABASE_URL
ARG FIREBASE_PRIVATE_KEY
ARG FIREBASE_API_KEY
ARG FIREBASE_CLIENT_EMAIL
ARG FIREBASE_PROJECT_ID
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL

ENV DATABASE_URL=$DATABASE_URL
ENV FIREBASE_PRIVATE_KEY=$FIREBASE_PRIVATE_KEY
ENV FIREBASE_API_KEY=$FIREBASE_API_KEY
ENV FIREBASE_CLIENT_EMAIL=$FIREBASE_CLIENT_EMAIL
ENV FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV NEXTAUTH_URL=$NEXTAUTH_URL

# Generate Prisma Client if schema exists
RUN if [ -d "prisma" ]; then bunx prisma generate; fi

RUN bun run build

# 3. Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy standalone build and static files
COPY --from=builder /app/public ./public

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated/prisma ./src/generated/prisma

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Next.js standalone output uses a server.js file
CMD ["bun", "server.js"]
