# VoteAI Dockerfile — Multi-stage build for Cloud Run
FROM node:20-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --production=false

COPY . .
RUN npm run build

# Production image
FROM node:20-slim
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Serve frontend + API
CMD ["node", "server/index.js"]
