# Multi-stage Dockerfile for YouTube Video & Audio Downloader
# Build: docker build -t youtube-downloader .
# Run:   docker run -p 3000:3000 youtube-downloader

# Stage 1: Dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install Python3, FFmpeg, and yt-dlp
RUN apk add --no-cache python3 py3-pip ffmpeg ca-certificates libc6-compat && \
    python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --no-cache-dir -U "yt-dlp" && \
    ln -sf /opt/venv/bin/python /usr/local/bin/python && \
    ln -sf /opt/venv/bin/yt-dlp /usr/local/bin/yt-dlp

ENV PATH="/opt/venv/bin:$PATH"

# Setup non-root nextjs user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 -h /home/nextjs nextjs && \
    mkdir -p /app/.temp_downloads /home/nextjs/.cache/yt-dlp && \
    chown -R nextjs:nodejs /app /home/nextjs
ENV HOME=/home/nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]

