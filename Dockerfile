# Dockerfile
# Multi-stage build for BuilderLab — Next.js 16 app.
#
# Stages:
#   deps    → installs dependencies once, cached and reused by dev/builder
#   dev     → runs `next dev` with hot reload, used by docker-compose
#   builder → runs `next build` for production
#   runner  → minimal final image that only serves the built app
#
# Build a production image:
#   docker build \
#     --build-arg NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
#     --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx \
#     --build-arg NEXT_PUBLIC_SITE_URL=https://builderlab.com \
#     -t builderlab:prod .
#
# Run it:
#   docker run -p 3000:3000 --env-file .env.production builderlab:prod
#
# NEXT_PUBLIC_* variables are inlined into the JS bundle at build time —
# this is a Next.js constraint, not a choice. Rebuild a separate image
# per environment (dev/prod) rather than trying to inject them at
# runtime. Server-only secrets (SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY)
# are NOT build args — they are only ever read at runtime via --env-file
# or docker-compose's env_file, and never end up in the image.

# ─────────────────────────────────────────────────────────────────────
# Stage: deps
# Installs node_modules once. Cached by Docker as long as
# package.json / package-lock.json don't change.
# ─────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

# libc6-compat is needed by some native deps (e.g. sharp) on Alpine
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
RUN npm ci


# ─────────────────────────────────────────────────────────────────────
# Stage: dev
# Used by docker-compose for local development. Source code is
# mounted as a volume (see docker-compose.yml), so this stage only
# needs node_modules — it never bakes in app code directly.
# ─────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS dev
WORKDIR /app

RUN apk add --no-cache libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]


# ─────────────────────────────────────────────────────────────────────
# Stage: builder
# Builds the production bundle. NEXT_PUBLIC_* build args are inlined
# into the JS here — this is the only stage where they matter.
# ─────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SITE_URL

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

RUN apk add --no-cache libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js standalone output produces a minimal runtime folder
# (.next/standalone) with only the files needed to run the server —
# no need to ship the full node_modules in the final image.
RUN npm run build


# ─────────────────────────────────────────────────────────────────────
# Stage: runner
# Final, minimal production image. Only contains the standalone
# server output — no source code, no dev dependencies, no build tools.
# ─────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Run as a non-root user — standard container security practice
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Static assets and public files are copied separately because the
# standalone build doesn't include them by default
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]