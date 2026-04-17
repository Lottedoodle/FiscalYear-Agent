FROM node:20-alpine AS base

RUN npm install -g npm@latest

# -----------------------------------------------------------------------------
# 2. Dependencies Stage: Install necessary dependencies
# -----------------------------------------------------------------------------
FROM base AS deps
# libc6-compat is required for some Node libraries on Alpine (equivalent to build-essential)
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files (equivalent to requirements.txt)
COPY package.json package-lock.json* ./

# 🔥 Highlight: Use Cache Mount similar to uv pip
# npm stores cache at /root/.npm; we mount it so future builds don't need to re-download
RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps

# -----------------------------------------------------------------------------
# 3. Builder Stage: Build the project (Next.js requires building before running)
# -----------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .


# Add to Dockerfile before the RUN npm run build line
ARG OPENAI_MODEL_NAME=gpt-4o-mini
ENV OPENAI_MODEL_NAME=$OPENAI_MODEL_NAME

# ⚠️ NEXT_PUBLIC_* will be inlined into client-side code during build
# Values must be passed via --build-arg during docker build
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY

# Run Build (ensure output: 'standalone' is set in next.config.js)
RUN npm run build

# -----------------------------------------------------------------------------
# 4. Runner Stage: Actual runner (Production)
# -----------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

# Add necessary dependencies for sharp and native modules
RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Create User for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Use exec form (JSON) so OS signals are sent directly to the node process
CMD ["node", "server.js"]