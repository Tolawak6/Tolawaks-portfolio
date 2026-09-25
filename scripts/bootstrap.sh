#!/usr/bin/env bash
#
# Brings a completely fresh machine to the point where the API and the site can
# be started. Safe to run repeatedly.
#
#   bash scripts/bootstrap.sh
#
# This exists because the sandbox this project was developed in discards
# node_modules, the PostgreSQL cluster and /tmp between sessions. On an ordinary
# development machine you only need steps 1 and 4 once; the script is written to
# detect what is already done and skip it, so it works in both situations.
#
# It does NOT start the servers. Those are long-running, so start them yourself:
#
#   npm run dev:api      # terminal 1
#   npm run dev:web      # terminal 2
#   # or:  npm run dev   # both at once
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# ---- Settings. Override with env vars if your local setup differs. ----------
DB_NAME="${DB_NAME:-portfolio_db}"
DB_USER="${DB_USER:-portfolio_user}"
DB_PASSWORD="${DB_PASSWORD:-portfolio_dev_password}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
PG_VERSION="${PG_VERSION:-17}"

say()  { printf '\n\033[1m%s\033[0m\n' "$1"; }
ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; }
skip() { printf '  \033[2m·\033[0m %s\n' "$1"; }

# ---- 1. PostgreSQL ---------------------------------------------------------
say '1/5  PostgreSQL'

if command -v psql >/dev/null 2>&1; then
  skip 'already installed'
else
  echo '  installing (needs sudo)...'
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq postgresql postgresql-contrib
  ok 'installed'
fi

if pg_isready -h "$DB_HOST" -p "$DB_PORT" >/dev/null 2>&1; then
  skip 'server already accepting connections'
else
  sudo pg_ctlcluster "$PG_VERSION" main start
  for _ in $(seq 1 20); do
    pg_isready -h "$DB_HOST" -p "$DB_PORT" >/dev/null 2>&1 && break
    sleep 0.5
  done
  ok 'started'
fi

# `CREATE ROLE`/`CREATE DATABASE` have no IF NOT EXISTS, so ask first.
ROLE_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" 2>/dev/null || true)
if [ "$ROLE_EXISTS" = "1" ]; then
  skip "role $DB_USER exists"
else
  sudo -u postgres psql -c "CREATE ROLE $DB_USER WITH LOGIN PASSWORD '$DB_PASSWORD';" >/dev/null
  ok "role $DB_USER created"
fi

DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null || true)
if [ "$DB_EXISTS" = "1" ]; then
  skip "database $DB_NAME exists"
else
  sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" >/dev/null
  ok "database $DB_NAME created"
fi

sudo -u postgres psql -d "$DB_NAME" -c "GRANT ALL ON SCHEMA public TO $DB_USER;" >/dev/null 2>&1 || true

# ---- 2. Environment files --------------------------------------------------
say '2/5  Environment files'

if [ -f server/.env ]; then
  skip 'server/.env exists'
else
  cp server/.env.example server/.env
  # Point the copied file at the database this script just made.
  sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME|" server/.env
  rm -f server/.env.bak
  ok 'server/.env created from the example'
  printf '  \033[33m! \033[0mgenerate admin credentials:  npm run admin:key\n'
fi

# Only needed when the frontend and backend are on different hosts, which is
# not the case in local development.
if [ -f client/.env ]; then
  skip 'client/.env exists'
else
  skip 'client/.env not needed locally (the Vite proxy forwards /api)'
fi

# ---- 3. Dependencies -------------------------------------------------------
say '3/5  Dependencies'

for dir in server client; do
  if [ -d "$dir/node_modules" ]; then
    skip "$dir/node_modules present"
  else
    echo "  installing $dir..."
    npm --prefix "$dir" install --no-audit --no-fund
    ok "$dir dependencies installed"
  fi
done

# ---- 4. Schema and sample data --------------------------------------------
say '4/5  Database schema'

npm --prefix server run db:migrate
ok 'schema applied (idempotent)'

# db:seed skips when rows already exist, so this never overwrites real work.
npm --prefix server run db:seed
ok 'seeded if the table was empty'

# ---- 5. Summary ------------------------------------------------------------
say '5/5  Ready'

PROJECT_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  -tAc 'SELECT COUNT(*) FROM projects' 2>/dev/null || echo '?')

echo "  projects in the database : $PROJECT_COUNT"
echo "  API       : http://localhost:4000/api/health"
echo "  Portfolio : http://localhost:5173"
echo "  Admin     : http://localhost:5173/admin"
echo
echo "  Start the servers:"
echo "    npm run dev:api     # API only"
echo "    npm run dev:web     # site only"
echo "    npm run dev         # both"
echo
if ! grep -q '^ADMIN_API_KEY=.\+' server/.env 2>/dev/null; then
  printf '  \033[33mNext:\033[0m no admin key set yet. Run  npm run admin:key  and paste the\n'
  echo "        two lines into server/.env, then restart the API."
  echo
fi
if ! grep -q '^CLOUDINARY_API_SECRET=.\+' server/.env 2>/dev/null; then
  printf '  \033[33mNext:\033[0m no Cloudinary credentials set. Image uploads stay off and\n'
  echo "        the admin form offers a URL field instead. See README §18."
  echo
fi
