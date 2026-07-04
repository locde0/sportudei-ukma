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

if [ ! -f ".env" ]; then
    echo "ERROR: .env not found. Copy .env.production.example to .env and fill in values."
    exit 1
fi

echo ""
echo "Pulling latest code..."
git pull origin main

echo ""
echo "Building..."
$COMPOSE build

echo ""
echo "Starting services..."
$COMPOSE up -d

echo ""
echo "Waiting for startup..."
sleep 8

# Health checks via docker exec (port 80 is closed externally)
if docker compose -f docker-compose.prod.yml exec -T backend wget -qO- http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "  OK: backend"
else
    echo "  FAIL: backend — check: $COMPOSE logs backend"
fi

if docker compose -f docker-compose.prod.yml exec -T nginx wget -qO- http://localhost/nginx-health > /dev/null 2>&1; then
    echo "  OK: nginx"
else
    echo "  FAIL: nginx — check: $COMPOSE logs nginx"
fi

docker image prune -f > /dev/null 2>&1

echo ""
$COMPOSE ps
echo ""
echo "Done. https://sportudei.com"
