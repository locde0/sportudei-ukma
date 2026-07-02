FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline

COPY . .

ARG VITE_API_URL
ARG VITE_MEDIA_URL
ARG VITE_USE_MOCK=false

RUN npm run build

# --- Production stage ---
# The built files are in /app/dist
# They will be copied to nginx via a shared volume in docker-compose
FROM alpine:3.22

COPY --from=builder /app/dist /app/dist
