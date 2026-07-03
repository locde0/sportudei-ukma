# ── Stage 1: Build frontend ──────────────────────────────────────────────────
FROM node:20-alpine AS frontend

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci

COPY frontend/ .

ARG VITE_API_URL=/api
ARG VITE_MEDIA_URL=

RUN VITE_API_URL=${VITE_API_URL} \
    VITE_MEDIA_URL=${VITE_MEDIA_URL} \
    npm run build

# ── Stage 2: Nginx ───────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d/sportudei.conf
COPY --from=frontend /app/dist /usr/share/nginx/html

EXPOSE 80
