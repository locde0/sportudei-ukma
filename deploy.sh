set -euo pipefail

COMPOSE="docker compose -f docker-compose.prod.yml"

echo "[+] deploying to production"

if [ ! -f ".env" ]; then
    echo "[-] error: .env not found. copy .env.production.example to .env and fill in values"
    exit 1
fi

echo ""
echo "[+] building..."
$COMPOSE build

echo ""
echo "[+] starting services..."
$COMPOSE up -d

echo ""
echo "[+] waiting for startup..."
sleep 8

if docker compose -f docker-compose.prod.yml exec -T backend wget -qO- http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "[+] ok: backend"
else
    echo "[-] fail: backend (check: $COMPOSE logs backend)"
fi

if docker compose -f docker-compose.prod.yml exec -T nginx wget -qO- http://127.0.0.1/nginx-health > /dev/null 2>&1; then
    echo "[+] ok: nginx"
else
    echo "[-] fail: nginx (check: $COMPOSE logs nginx)"
fi

docker image prune -f > /dev/null 2>&1

echo ""
$COMPOSE ps
echo ""
echo "[+] https://sportudei.com"
