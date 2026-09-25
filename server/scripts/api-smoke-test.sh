#!/usr/bin/env bash
# End-to-end API test against a running server.
# Usage: ./scripts/api-smoke-test.sh [base_url] [admin_api_key]
set -uo pipefail

BASE="${1:-http://localhost:4000}"
KEY="${2:-}"
PASS=0
FAIL=0

# ---------------------------------------------------------------------------
# Direct database access, used to prove that changes the API reports actually
# landed in PostgreSQL rather than only in the API's own response.
#
# These defaults match the database `scripts/bootstrap.sh` creates on a local
# machine. They are development-only credentials for a database bound to
# localhost - production values live in the hosting provider's environment
# variables and are never referenced here. Override with env vars to point the
# checks at a different database.
# ---------------------------------------------------------------------------
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-portfolio_user}"
DB_NAME="${DB_NAME:-portfolio_db}"
DB_PASSWORD="${DB_PASSWORD:-portfolio_dev_password}"

db_query() { # db_query <sql>
  PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "$1"
}

check() { # check <label> <expected_status> <actual_status>
  if [ "$2" = "$3" ]; then
    printf '  \033[32mPASS\033[0m %-58s %s\n' "$1" "$3"
    PASS=$((PASS+1))
  else
    printf '  \033[31mFAIL\033[0m %-58s expected %s got %s\n' "$1" "$2" "$3"
    FAIL=$((FAIL+1))
  fi
}

status() { # status <method> <path> [data] [auth_header]
  local method="$1" path="$2" data="${3:-}" auth="${4:-}"
  local args=(-s -o /tmp/smoke_body.json -w '%{http_code}' -X "$method" "$BASE$path")
  [ -n "$data" ] && args+=(-H 'Content-Type: application/json' -d "$data")
  [ -n "$auth" ] && args+=(-H "Authorization: Bearer $auth")
  curl "${args[@]}"
}

jqv() { node -e "const d=require('/tmp/smoke_body.json');console.log($1)" 2>/dev/null; }

echo ""
echo "Testing API at $BASE"
echo "---------------------------------------------------------------------"

echo ""
echo "Health & public reads"
check "GET /api/health"                    200 "$(status GET /api/health)"
check "GET /api/projects"                  200 "$(status GET /api/projects)"
check "GET /api/projects/999999 -> 404"    404 "$(status GET /api/projects/999999)"
check "GET /api/projects/abc -> 400"       400 "$(status GET /api/projects/abc)"
check "GET /api/nope -> 404"               404 "$(status GET /api/nope)"

echo ""
echo "Admin auth is enforced on writes"
check "POST /api/projects anonymous -> 401"       401 "$(status POST /api/projects '{"name":"x","image":"","link":"","description":"y"}')"
check "POST /api/projects bad token -> 401"       401 "$(status POST /api/projects '{"name":"x","image":"","link":"","description":"y"}' 'not-a-real-token')"
check "POST /api/projects tampered sig -> 401"    401 "$(status POST /api/projects '{"name":"x","image":"","link":"","description":"y"}' 'eyJzdWIiOiJhZG1pbiIsImV4cCI6OTk5OTk5OTk5OX0.forged')"
check "POST /api/projects wrong key -> 401"       401 "$(status POST /api/admin/session '{"apiKey":"definitely-wrong"}')"

if [ -z "$KEY" ]; then
  echo ""
  echo "  (no admin key supplied - skipping authenticated CRUD checks)"
  echo "---------------------------------------------------------------------"
  printf "  passed: %s   failed: %s\n\n" "$PASS" "$FAIL"
  exit $((FAIL > 0))
fi

echo ""
echo "Admin session exchange"
check "POST /api/admin/session correct key -> 201" 201 "$(status POST /api/admin/session "{\"apiKey\":\"$KEY\"}")"
TOKEN="$(jqv 'd.data.token')"
if [ -z "$TOKEN" ]; then echo "  could not obtain session token, aborting"; exit 1; fi
echo "  obtained session token (${#TOKEN} chars)"

echo ""
echo "Validation"
check "POST missing name -> 422"          422 "$(status POST /api/projects '{"image":"","link":"","description":"a description"}' "$TOKEN")"
check "POST blank description -> 422"     422 "$(status POST /api/projects '{"name":"N","image":"","link":"","description":"   "}' "$TOKEN")"
check "POST bad image url -> 422"         422 "$(status POST /api/projects '{"name":"N","image":"javascript:alert(1)","link":"","description":"a description"}' "$TOKEN")"
check "POST bad link -> 422"              422 "$(status POST /api/projects '{"name":"N","image":"","link":"ftp://x.com","description":"a description"}' "$TOKEN")"

echo ""
echo "CREATE"
check "POST /api/projects -> 201" 201 "$(status POST /api/projects '{"name":"Smoke Test Project","image":"https://example.com/a.png","link":"https://example.com","description":"Created by the automated smoke test."}' "$TOKEN")"
ID="$(jqv 'd.data.id')"
CREATED_AT="$(jqv 'd.data.createdAt')"
NAME="$(jqv 'd.data.name')"
[ -n "$ID" ] && echo "  created project id=$ID name=\"$NAME\" createdAt=$CREATED_AT"

echo ""
echo "READ"
check "GET /api/projects/:id -> 200" 200 "$(status GET "/api/projects/$ID")"
FOUND_NAME="$(jqv 'd.data.name')"
if [ "$FOUND_NAME" = "Smoke Test Project" ]; then
  printf '  \033[32mPASS\033[0m %-58s %s\n' "GET returns the newly created project" "$FOUND_NAME"
  PASS=$((PASS+1))
else
  printf '  \033[31mFAIL\033[0m %-58s got "%s"\n' "GET returns the newly created project" "$FOUND_NAME"
  FAIL=$((FAIL+1))
fi
PERSISTED="$(db_query "SELECT name FROM projects WHERE id = $ID")"
if [ "$PERSISTED" = "Smoke Test Project" ]; then
  printf '  \033[32mPASS\033[0m %-58s %s\n' "row is physically present in PostgreSQL" "$PERSISTED"
  PASS=$((PASS+1))
else
  printf '  \033[31mFAIL\033[0m %-58s got "%s"\n' "row is physically present in PostgreSQL" "$PERSISTED"
  FAIL=$((FAIL+1))
fi

echo ""
echo "UPDATE"
sleep 0.1
check "PUT /api/projects/:id -> 200" 200 "$(status PUT "/api/projects/$ID" '{"name":"Smoke Test Project (edited)","image":"","link":"https://example.com/edited","description":"Updated by the automated smoke test."}' "$TOKEN")"
UPDATED_NAME="$(jqv 'd.data.name')"
UPDATED_AT="$(jqv 'd.data.updatedAt')"
DB_UPDATED="$(db_query "SELECT name FROM projects WHERE id = $ID")"
if [ "$DB_UPDATED" = "Smoke Test Project (edited)" ]; then
  printf '  \033[32mPASS\033[0m %-58s %s\n' "UPDATE persisted to PostgreSQL" "$DB_UPDATED"
  PASS=$((PASS+1))
else
  printf '  \033[31mFAIL\033[0m %-58s got "%s"\n' "UPDATE persisted to PostgreSQL" "$DB_UPDATED"
  FAIL=$((FAIL+1))
fi
if [ "$UPDATED_AT" != "$CREATED_AT" ]; then
  printf '  \033[32mPASS\033[0m %-58s %s -> %s\n' "updated_at advanced via trigger" "$CREATED_AT" "$UPDATED_AT"
  PASS=$((PASS+1))
else
  printf '  \033[31mFAIL\033[0m %-58s unchanged at %s\n' "updated_at advanced via trigger" "$UPDATED_AT"
  FAIL=$((FAIL+1))
fi
check "PUT nonexistent -> 404" 404 "$(status PUT /api/projects/999999 '{"name":"N","image":"","link":"","description":"a description"}' "$TOKEN")"

echo ""
echo "DELETE"
check "DELETE /api/projects/:id -> 204" 204 "$(status DELETE "/api/projects/$ID" '' "$TOKEN")"
check "DELETE again -> 404"             404 "$(status DELETE "/api/projects/$ID" '' "$TOKEN")"
check "GET deleted -> 404"              404 "$(status GET "/api/projects/$ID")"
GONE="$(db_query "SELECT COUNT(*) FROM projects WHERE id = $ID")"
if [ "$GONE" = "0" ]; then
  printf '  \033[32mPASS\033[0m %-58s 0 rows remain\n' "row removed from PostgreSQL"
  PASS=$((PASS+1))
else
  printf '  \033[31mFAIL\033[0m %-58s %s rows remain\n' "row removed from PostgreSQL" "$GONE"
  FAIL=$((FAIL+1))
fi

echo ""
echo "Contact endpoint"
check "POST /api/contact valid -> 201"   201 "$(status POST /api/contact '{"name":"Test Sender","email":"test@example.com","subject":"Hello","message":"This is an automated smoke test message."}')"
check "POST /api/contact bad email -> 422" 422 "$(status POST /api/contact '{"name":"Test","email":"not-an-email","message":"This is an automated smoke test message."}')"

echo ""
echo "---------------------------------------------------------------------"
printf "  passed: %s   failed: %s\n\n" "$PASS" "$FAIL"
exit $((FAIL > 0))
