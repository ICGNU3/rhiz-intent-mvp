#!/usr/bin/env bash
set -euo pipefail

echo "=== Rhiz Self-Heal: Node, Package Manager, Install, Seed, Smoke ==="

# --- Detect Node and try to ensure v20 ---
NODEV="$(node -v 2>/dev/null || echo "v0.0.0")"
echo "Node version: ${NODEV}"
if [[ "${NODEV}" != v20* ]]; then
  echo "WARN: Node is not v20. Attempting Homebrew switch to node@20..."
  if command -v brew >/dev/null 2>&1; then
    brew install node@20 || true
    brew unlink node || true
    brew link --overwrite --force node@20 || true
    NODEV="$(node -v 2>/dev/null || echo "v0.0.0")"
    echo "Node version after brew: ${NODEV}"
  else
    echo "WARN: Homebrew not found. Continue with current Node."
  fi
fi

# --- Corepack + pnpm activation ---
if command -v corepack >/dev/null 2>&1; then
  corepack enable || true
  corepack prepare pnpm@9.7.0 --activate || true
fi

# --- Choose manager ---
USE_PNPM=0
if [[ -f "pnpm-lock.yaml" ]]; then USE_PNPM=1; fi

# Force pnpm if workspace dependencies are detected
if grep -r "workspace:\*" . --include="package.json" >/dev/null 2>&1; then
  echo "Workspace dependencies detected, forcing pnpm usage"
  USE_PNPM=1
fi

if [[ "${USE_PNPM}" -eq 1 ]]; then
  echo "Package manager: pnpm"
  pnpm -v || (echo "ERR: pnpm missing"; exit 1)
  pnpm config set registry https://registry.npmjs.org/
  pnpm config set fetch-retries 5
  pnpm config set fetch-timeout 120000
  pnpm config set fetch-retry-maxtimeout 60000
  pnpm store prune || true
  pnpm cache clear --force || true
  rm -rf node_modules
  echo "Installing with pnpm (primary)…"
  if ! pnpm install --fetch-timeout 600000; then
    echo "Primary install failed. Retrying with npmmirror once…"
    pnpm install --registry=https://registry.npmmirror.com --fetch-timeout 600000
    pnpm config set registry https://registry.npmjs.org/
  fi
else
  echo "Package manager: npm"
  npm -v || (echo "ERR: npm missing"; exit 1)
  rm -rf node_modules pnpm-lock.yaml
  echo "Installing with npm…"
  npm install --no-audit --no-fund
fi

# --- Install root dev deps ---
if [[ "${USE_PNPM}" -eq 1 ]]; then
  pnpm add -D -w tsx vitest @playwright/test playwright cross-env eslint prettier typescript @types/node
else
  npm install -D tsx vitest @playwright/test playwright cross-env eslint prettier typescript @types/node
fi

# --- Install app runtime deps ---
pushd apps/web >/dev/null
if [[ "${USE_PNPM}" -eq 1 ]]; then
  pnpm add @clerk/nextjs
else
  npm install @clerk/nextjs
fi
popd >/dev/null

# --- Ensure env file ---
if [[ ! -f ".env.local" ]]; then
  cat > .env.local <<'EOF'
USE_MOCK_AUTH=true
NEXT_PUBLIC_USE_MOCK_AUTH=true
DATABASE_URL=postgresql://user:pass@localhost:5432/rhiz
EOF
  echo "Created .env.local with mock auth and a sample DATABASE_URL."
else
  echo ".env.local exists."
fi

# --- Migrations + seed if scripts exist ---
FAILED_DB=0
if jq -e '.scripts["db:migrate"]' package.json >/dev/null 2>&1; then
  echo "Running db:migrate…"
  if [[ "${USE_PNPM}" -eq 1 ]]; then pnpm db:migrate || FAILED_DB=1; else npm run db:migrate || FAILED_DB=1; fi
fi
if jq -e '.scripts["db:seed"]' package.json >/dev/null 2>&1; then
  echo "Running db:seed…"
  if [[ "${USE_PNPM}" -eq 1 ]]; then pnpm db:seed || FAILED_DB=1; else npm run db:seed || FAILED_DB=1; fi
fi
if [[ "${FAILED_DB}" -eq 1 ]]; then
  echo "WARN: Migrations or seeding failed. Check DATABASE_URL or tsx availability."
fi

# --- Start app with mock auth ---
echo "Starting app with mock auth…"
if [[ "${USE_PNPM}" -eq 1 ]]; then
  pnpm demo:on >/tmp/rhiz_demo.log 2>&1 &
else
  npm run demo:on >/tmp/rhiz_demo.log 2>&1 &
fi

# Wait for port 3000
TRIES=50
until curl -sS http://localhost:3000/api/health >/tmp/rhiz_health.json 2>/dev/null || [[ $TRIES -eq 0 ]]; do
  sleep 0.3
  TRIES=$((TRIES-1))
done

echo "=== Health Check ==="
if [[ -f /tmp/rhiz_health.json ]]; then
  cat /tmp/rhiz_health.json
else
  echo '{"ok":false,"error":"No response from /api/health"}'
fi

# --- Final report ---
echo
echo "=== Final Report ==="
APP_OK=0
if [[ -f /tmp/rhiz_health.json ]]; then
  if grep -q '"ok":true' /tmp/rhiz_health.json && grep -q '"mock":true' /tmp/rhiz_health.json; then
    APP_OK=1
  fi
fi

if [[ "${APP_OK}" -eq 1 ]]; then
  echo "✅ App responded on /api/health with mock auth enabled."
else
  echo "❌ App did not pass health check. See /tmp/rhiz_demo.log for server logs."
fi

if [[ "${FAILED_DB}" -eq 1 ]]; then
  echo "⚠️  DB migration/seed had errors. Verify DATABASE_URL and db scripts."
else
  echo "✅ DB migration/seed phase completed or was skipped."
fi

echo "Log tail:"
tail -n 30 /tmp/rhiz_demo.log || true
