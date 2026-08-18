#!/usr/bin/env bash
# One-time bootstrap for a fresh finly devcontainer. Idempotent — safe to re-run by hand.
#
# Fails loudly on any step: a half-provisioned container that looks ready is worse than one
# that refuses to come up, because the failure surfaces later and far from its cause.
set -euo pipefail

echo "▸ Trusting the workspace for git"
# Root + bind mount otherwise trips git's dubious-ownership guard, which breaks the hooks.
git config --global --add safe.directory /workspaces/finly

echo "▸ Installing dependencies"
# Also runs the `prepare` script (lefthook install), which wires the git hooks.
npm install --no-audit --no-fund

echo "▸ Generating the Prisma client"
# Needed before anything typechecks: the generated client is what types every query.
# Reads DATABASE_URL from the process env (set by docker-compose.yml) — deliberately NOT
# from a .env file, so there is exactly one source for it in the container.
npx prisma generate

echo "▸ Syncing the schema to the dev database"
# `db push` rather than `migrate deploy`: this repo carries no migration history yet, and a
# dev database is disposable. Switch to `migrate` once migrations are committed.
npx prisma db push --skip-generate

if [ ! -f .env.local ]; then
  echo "▸ Seeding .env.local from .env.example"
  cp .env.example .env.local
  echo "  ⚠ .env.local has placeholder values — Clerk keys are required before the app boots."
fi

cat <<'BANNER'

  finly is ready.

    npm run dev         → https://localhost:5010
    npm run validate    → typecheck ratchet + lint (what CI gates)
    npm run test        → Playwright E2E (needs Clerk keys + the app running)
    npm run db:studio   → Prisma Studio against the local Postgres

  Postgres is on 5030 (user postgres / db finly_development), published to the host too.

  Before the app boots, fill the Clerk keys in .env.local — everything else is optional.

BANNER
