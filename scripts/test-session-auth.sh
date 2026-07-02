#!/usr/bin/env bash
# TC-AUTH-03/04/05/06 — Session-mode auth smoke tests (§3.17)
# Requires: backend on :9000, storefront on :3000
# Usage: bash scripts/test-session-auth.sh

set -uo pipefail

BACKEND="http://localhost:9000"
STOREFRONT="http://localhost:3000"
# Real store customer account
EMAIL="suvidit@gmail.com"
PASSWORD='Suvidit!@12'
PUB_KEY="${NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY:-$(grep NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY .env.local 2>/dev/null | cut -d= -f2 | tr -d '\"' | head -1)}"

PASS=0
FAIL=0

ok()   { echo "  [PASS] $1"; PASS=$((PASS+1)); }
fail() { echo "  [FAIL] $1"; FAIL=$((FAIL+1)); }

echo ""
echo "=== §3.17 Session-mode auth tests ==="
echo ""

# ─── TC-AUTH-03 — Login sets connect.sid, no JWT in response ──────────────────
echo "TC-AUTH-03 — Login sets connect.sid cookie"
LOGIN_RESP=$(curl -s -c /tmp/akiko-cookies.txt -X POST "$BACKEND/auth/customer/emailpass" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  -w "\n%{http_code}")
LOGIN_BODY=$(echo "$LOGIN_RESP" | sed '$d')
LOGIN_CODE=$(echo "$LOGIN_RESP" | tail -n1)

if [[ "$LOGIN_CODE" == "200" ]]; then
  ok "Login returns 200"
else
  fail "Login returned $LOGIN_CODE (expected 200)"
fi

# Exchange JWT for session cookie via POST /auth/session
JWT=$(echo "$LOGIN_BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null || echo "")
if [[ -n "$JWT" ]]; then
  SESSION_RESP=$(curl -s -c /tmp/akiko-cookies.txt -b /tmp/akiko-cookies.txt \
    -X POST "$BACKEND/auth/session" \
    -H "Authorization: Bearer $JWT" \
    -w "\n%{http_code}")
  SESSION_CODE=$(echo "$SESSION_RESP" | tail -n1)
  if [[ "$SESSION_CODE" == "200" ]]; then
    ok "POST /auth/session returns 200"
  else
    fail "POST /auth/session returned $SESSION_CODE (expected 200)"
  fi
else
  fail "No JWT in login response (cannot exchange for session)"
fi

if grep -q "connect.sid" /tmp/akiko-cookies.txt 2>/dev/null; then
  ok "connect.sid cookie set after session exchange"
else
  fail "connect.sid cookie NOT set after session exchange"
fi

echo ""

# ─── TC-AUTH-04 — Wrong password → 401 ────────────────────────────────────────
echo "TC-AUTH-04 — Wrong password → 401"
WRONG_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BACKEND/auth/customer/emailpass" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"wrongpassword\"}")
if [[ "$WRONG_CODE" == "401" ]]; then
  ok "Wrong password returns 401"
else
  fail "Wrong password returned $WRONG_CODE (expected 401)"
fi
echo ""

# ─── TC-AUTH-03b — Session cookie authenticates /store/customers/me ───────────
echo "TC-AUTH-03b — Session cookie authenticates /store/customers/me"
ME_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -b /tmp/akiko-cookies.txt \
  -H "x-publishable-api-key: $PUB_KEY" \
  "$BACKEND/store/customers/me")
if [[ "$ME_CODE" == "200" ]]; then
  ok "/store/customers/me returns 200 with session cookie"
else
  fail "/store/customers/me returned $ME_CODE (expected 200)"
fi

# ─── Without cookie → 401 ─────────────────────────────────────────────────────
NO_COOKIE_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "x-publishable-api-key: $PUB_KEY" \
  "$BACKEND/store/customers/me")
if [[ "$NO_COOKIE_CODE" == "401" ]]; then
  ok "/store/customers/me returns 401 without cookie"
else
  fail "/store/customers/me returned $NO_COOKIE_CODE without cookie (expected 401)"
fi
echo ""

# ─── TC-AUTH-05 — Expired/missing session redirects from /account/* ───────────
echo "TC-AUTH-05 — No cookie → middleware redirects /account to /login"
REDIR=$(curl -s -o /dev/null -w "%{redirect_url}" "$STOREFRONT/account")
if echo "$REDIR" | grep -q "login"; then
  ok "/account redirects to /login when unauthenticated"
else
  fail "/account did NOT redirect to /login (got: $REDIR)"
fi

REDIR_ORDERS=$(curl -s -o /dev/null -w "%{redirect_url}" "$STOREFRONT/account/orders")
if echo "$REDIR_ORDERS" | grep -q "login"; then
  ok "/account/orders redirects to /login when unauthenticated"
else
  fail "/account/orders did NOT redirect to /login (got: $REDIR_ORDERS)"
fi
echo ""

# ─── TC-AUTH-06 — Logout destroys server-side session ─────────────────────────
echo "TC-AUTH-06 — Logout destroys server-side session"
LOGOUT_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -b /tmp/akiko-cookies.txt \
  -c /tmp/akiko-cookies-post-logout.txt \
  -X DELETE "$BACKEND/auth/session")
if [[ "$LOGOUT_CODE" == "200" ]]; then
  ok "DELETE /auth/session returns 200"
else
  fail "DELETE /auth/session returned $LOGOUT_CODE (expected 200)"
fi

# After logout, session cookie should not authenticate
POST_LOGOUT_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -b /tmp/akiko-cookies.txt \
  -H "x-publishable-api-key: $PUB_KEY" \
  "$BACKEND/store/customers/me")
if [[ "$POST_LOGOUT_CODE" == "401" ]]; then
  ok "/store/customers/me returns 401 after logout"
else
  fail "/store/customers/me returned $POST_LOGOUT_CODE after logout (expected 401)"
fi

rm -f /tmp/akiko-cookies.txt /tmp/akiko-cookies-post-logout.txt
echo ""

# ─── Summary ──────────────────────────────────────────────────────────────────
echo "=== Results: $PASS passed, $FAIL failed ==="
[[ $FAIL -eq 0 ]] && exit 0 || exit 1
