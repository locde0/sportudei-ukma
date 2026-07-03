#!/usr/bin/env bash
# ============================================================================
# sportudei — Production Deployment
# Usage: ./deploy.sh
# ============================================================================
set -euo pipefail

COMPOSE="docker compose -f docker-compose.prod.yml"

echo "=========================================="
echo "  sportudei — deploying to production"
echo "=========================================="

# ─── Checks ─────────────────────────────────────────────────────────
if [ ! -f ".env" ]; then
    echo "ERROR: .env not found. Copy .env.production.example to .env and fill in values."
    exit 1
fi

# ─── Pull & build ───────────────────────────────────────────────────
echo ""
echo "Pulling latest code..."
git pull origin main

echo ""
echo "Building..."
$COMPOSE build

echo ""
echo "Starting services..."
$COMPOSE up -d

# ─── Health check ───────────────────────────────────────────────────
echo ""
echo "Waiting for startup..."
sleep 8

if curl -sf http://localhost/api/health > /dev/null 2>&1; then
    echo "  OK: backend"
else
    echo "  FAIL: backend — check: $COMPOSE logs backend"
fi

if curl -sf http://localhost/ > /dev/null 2>&1; then
    echo "  OK: frontend"
else
    echo "  FAIL: frontend — check: $COMPOSE logs nginx"
fi

# ─── Cleanup ────────────────────────────────────────────────────────
docker image prune -f > /dev/null 2>&1

echo ""
$COMPOSE ps
echo ""
echo "Done. https://sportudei.com"
