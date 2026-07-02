#!/usr/bin/env bash
# ============================================================================
# sportudei-ukma — Production Deployment Script
# Usage: ./deploy.sh
# ============================================================================
set -euo pipefail

COMPOSE_FILE="docker-compose.prod.yml"
PROJECT_NAME="sportudei"

echo "=========================================="
echo "  sportudei — Production Deployment"
echo "=========================================="

# ─── Pre-flight checks ──────────────────────────────────────────────
if [ ! -f ".env" ]; then
    echo "❌ ERROR: .env file not found!"
    echo "   Copy .env.production.example to .env and fill in real values."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ ERROR: Docker is not installed!"
    exit 1
fi

# ─── Pull latest code ───────────────────────────────────────────────
echo ""
echo "📥 Pulling latest code..."
git pull origin main

# ─── Build and deploy ───────────────────────────────────────────────
echo ""
echo "🔨 Building containers..."
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" build --no-cache

echo ""
echo "🚀 Starting services..."
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" up -d

# ─── Wait for services to be healthy ────────────────────────────────
echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# ─── Health check ───────────────────────────────────────────────────
echo ""
echo "🏥 Running health checks..."

# Check backend via nginx proxy
if curl -sf http://localhost/api/health > /dev/null 2>&1; then
    echo "  ✅ Backend API: healthy"
else
    echo "  ❌ Backend API: unhealthy"
    echo "     Check logs: docker compose -f $COMPOSE_FILE logs backend"
fi

# Check nginx
if curl -sf http://localhost/nginx-health > /dev/null 2>&1; then
    echo "  ✅ Nginx: healthy"
else
    echo "  ❌ Nginx: unhealthy"
    echo "     Check logs: docker compose -f $COMPOSE_FILE logs nginx"
fi

# Check frontend (returns HTML)
if curl -sf http://localhost/ | grep -q "</html>" 2>/dev/null; then
    echo "  ✅ Frontend: serving"
else
    echo "  ⚠️  Frontend: could not verify (check manually)"
fi

# ─── Cleanup ────────────────────────────────────────────────────────
echo ""
echo "🧹 Cleaning up old images..."
docker image prune -f

# ─── Status ─────────────────────────────────────────────────────────
echo ""
echo "📊 Running containers:"
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps

echo ""
echo "=========================================="
echo "  ✅ Deployment complete!"
echo "  🌍 http://sportudei.com"
echo "=========================================="
