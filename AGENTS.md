# finly — Working Agreement for AI Agents

Personal-finance app for Brazilian users: multi-tenant accounts, transactions, budgets on the
50/30/20 model, statement import and AI categorisation. **Next.js 15** (App Router) · **React 19**
· **TypeScript** · **Tailwind** · **Prisma/PostgreSQL** · **Clerk** (auth + organizations) ·
deployed to **Vercel**.

This document is written in the same spirit as `fourmdg/CLAUDE.md` and
`product-metrics/AGENTS.md`, adapted for finly. Where `fourmdg` enforces team process (Jira cards,
two-major branch topology, human-signs-the-PR), this one keeps only the parts that make a small
team faster and safer.

---

## SYSTEM PERSONA

You are a **careful engineer working on an app that handles other people's money.** Be direct. If
a request is risky or the code is doing something surprising, say so before you write a line. A
finance app that shows the *wrong balance* is worse than one that shows an error.

## PRIME DIRECTIVE

**Small, reversible, verified.** Prefer the smallest change that solves the problem. Before you
claim something works, you must have exercised it — `npm run validate`, the running app, or a
concrete check. "It compiles" and "it should work" are not evidence. In this repo especially:
**"it compiles" is not even available yet** — see the ledger below.

## THE INVARIANT OF THIS CODEBASE — every query is scoped to the organization

finly is multi-tenant through Clerk organizations. `orgId` comes from `auth()` and **every single
Prisma query must be scoped by `organizationId`**. A `findMany` that forgets it does not return
"slightly wrong data" — it returns *another customer's financial records*.

- Route Handlers under `/api/*` are **not** protected by `middleware.ts` alone: the middleware
  redirects unauthenticated *page* traffic, but a Route Handler must read `auth()` itself and
  refuse (401) when `userId` or `orgId` is missing. Every existing route does this — keep it that
  way.
- `findFirst`/`update`/`delete` by `id` must **also** carry `organizationId` in the `where`.
  Filtering by id alone lets one org mutate another's rows by guessing a cuid.
- Server Components query Prisma directly too (`app/(dashboard)/**`). Same rule, no exceptions.

## FAIL FAST AND LOUD — no silent fallbacks

The single biggest source of bugs that "work for reasons nobody understands, then break far from
the cause." A `|| default`, a `catch` that returns a safe value, an `x?.y` where `y` is required —
each papers over a broken invariant.

- **Never ADD one:** a fallback/default/catch that masks *missing or malformed internal data* or a
  violated invariant. If a row is required and it's missing, that's a bug — surface it, don't
  `?? {}` it away.
- **Do fail at the point the invariant breaks** — `throw`, let the route 500, let the error
  boundary catch it. A loud failure at the cause beats a wrong balance silently rendered.
- **This is NOT a ban on handling EXPECTED conditions** — an unauthenticated request, invalid user
  input, a genuinely-down external API. Handle those *explicitly and loudly* (a real error state on
  screen, a 4xx/5xx), never swallowed into a fake-success default.
- **Removing an existing fallback** is a deliberate, tested change — not a blind sweep. When you
  spot one you're not removing, note it in the ledger.

## MONEY IS ALWAYS IN CENTS

`amountCents` is `BigInt`, always. Never store or compute a monetary value as a float — `0.1 + 0.2`
is not `0.3`, and a rounding drift in a balance is a bug users will find before you do. Convert at
the edges only: parse to cents on input, format to currency on render.

**Gotcha:** `BigInt` has no `JSON.stringify` representation — `NextResponse.json()` throws
`TypeError: Do not know how to serialize a BigInt` on any payload containing one. Convert at the
serialization boundary (`Number(cents)` is safe well past any realistic balance; `.toString()` when
you want exactness). This is a live bug today — see the ledger.

## THE CODE IS THE SSOT — comment policy

Comments are English, and a comment is a liability until it earns its place: allowed only when it
says something the code *cannot* — the WHY behind a non-obvious choice, an invariant, a real
gotcha, a reference. Delete on sight (never "update"): restating what the code shows, a value that
already lives in code duplicated in prose, history/storytelling ("was X before", "renamed from…"),
decorative banners, commented-out code. Prefer fixing the *name* over adding a comment.
AI-generated narration is the #1 source of this debt — kill it.

The existing tree is full of it (`/** GET /api/accounts — Listar todas as contas */` above a
function literally named `GET`). Clean what you touch; a repo-wide purge is its own change.

## READ THE PATH BEFORE YOU EDIT — VERIFY BEFORE YOU CLAIM DONE

- **Trace how it actually flows** before changing it: `middleware.ts` → the Route Handler → the
  Prisma query → the schema. Check `prisma/schema.prisma` before assuming a field exists — the app
  code currently references several that do not (see the ledger).
- **Verify with the real thing.** Run `npm run validate`. For anything a person sees on screen,
  open it. There is no component unit-test runner here; the Playwright suite is the only automated
  proof, and it is a local gate (it needs live Clerk credentials).

## TWO PATHS for a non-trivial change

For any change that isn't obviously small, don't silently pick an approach. State two — **the
correct fix** (even if bigger) and **the pragmatic/surgical one** (with the debt it leaves) — give
your recommendation, and let the developer choose. Trivial, obviously-safe edits skip this.

---

## SECURITY

1. **Secrets never live in code or git.** They go in `.env.local` (gitignored) or Vercel env vars —
   never a literal in source, never a commit. If a secret ever reaches git history, **revoke and
   reissue it**; deleting the line does not remove it from history.
2. **`DATABASE_URL` has exactly one source per environment** — the process env (set by
   `.devcontainer/docker-compose.yml` locally, by Vercel in production). Do not add a second source
   that can drift from it.
3. **Never trust `organizationId` from a request body.** It comes from `auth()`, always. A body
   field named `organizationId` is an attacker asking to write into someone else's org.

---

## RUNNING LOCALLY

Everything is in the devcontainer: **Reopen in Container** and `.devcontainer/post-create.sh`
installs deps, generates the Prisma client, syncs the schema and seeds `.env.local`.

**Port scheme (deterministic): `5` + service.** The 5xxx prefix keeps finly clear of the sister
repos (`fourmdg` on 4xxx, `product-metrics` on 3000) so all three run at once.

| Port | What |
|------|------|
| **5010** | Next.js dev server — http://localhost:5010 |
| **5030** | PostgreSQL (user `postgres`, db `finly_development`), published to the host too |
| **5080** | Playwright HTML report |
| **5090** | Playwright UI mode |

Clerk keys are the one thing the container cannot provide — fill them in `.env.local` before the
app boots. Everything else (OpenAI, Upstash, Blob) is optional for local work.

## VALIDATION — what CI gates, and how to run it

```bash
npm run validate            # the gate: typecheck ratchet (what CI enforces)
npm run lint                # informational
npm run build               # informational — cannot pass yet, see the ledger
npm run test                # Playwright E2E — local only, needs Clerk keys + the app running
```

CI (`.github/workflows/ci.yml`) gates **conventional-commit format** and the **typecheck ratchet**.
`next build` and `eslint` run but are informational, because the tree does not typecheck yet.

**The typecheck ratchet** (`scripts/typecheck-ratchet.mjs`) compares `tsc` output against a
committed per-file baseline (`.typecheck-baseline.json`). A file that gets *worse* fails the build;
a file that gets better lowers the bar. Per-file rather than a single total on purpose — a total
lets you fix one error in A, add one in B, and sail through.

```bash
npm run typecheck            # raw tsc, shows every known error
npm run typecheck:ratchet    # the gate: fails only on NEW errors
npm run typecheck:baseline   # lock in progress after fixing some
```

When the baseline reaches zero: delete the ratchet, gate on `tsc --noEmit`, and promote
`npm run build` to a hard gate in CI and in the pre-push hook.

## GIT / COMMITS / PR

- **Work on a feature branch, never `main`.** The `no-commit-on-main` pre-commit hook enforces it
  locally; `main` is the deploy source for Vercel.
- **Conventional Commits**, in English, one logical change per commit. The `commit-msg` hook
  (commitlint) and CI both check it. The **PR title becomes history**, so it is a conventional
  commit too.
- Hooks are installed by `npm install` (`prepare` → `lefthook install`) and are deliberately
  bypassable with `--no-verify`; CI is the real enforcement.
- **Never mention AI, Claude, or any assistant** in commit messages, PR descriptions, or code
  comments — no `Co-Authored-By`, no "generated with".

---

## TECH-DEBT LEDGER

Debt written down is a decision; debt hidden is a bug waiting to happen. This is the state of the
tree as of the devcontainer/standards change — **none of it was introduced by that change**, it was
surfaced by finally running a typechecker over the repo.

### 1. The app does not compile — 44 type errors in 10 files

`npm run build` fails. The app code was written against a data model that `prisma/schema.prisma`
does not have. Fixing it requires **product decisions**, which is why it was left as an inventory
rather than guessed at:

| Code expects | Schema actually has |
|---|---|
| `Account.balance` | no such column — balance is derived from transactions |
| `Transaction.toAccountId` / `toAccount` | no transfer target, though `TransactionType.TRANSFER` exists |
| `Transaction.amount` | `amountCents: BigInt` |
| `Category.isActive`, `Category.createdBy` | neither exists |
| `CategoryType` = `INCOME`/`EXPENSE` | `ESSENTIAL`/`LIFESTYLE`/`SAVINGS`/`INCOME` (the 50/30/20 model) |

The open questions: are transfers a real feature (schema says half-yes)? Is a category typed by
50/30/20 bucket or by direction — and if both, that is two fields, not one?

### 2. `GET /api/transactions` throws on serialization

It returns raw Prisma rows containing `amountCents: BigInt`, which `NextResponse.json()` cannot
serialize. Any successful fetch 500s.

### 3. `next build` also fails on Next 15 async `params`

`app/(dashboard)/accounts/[id]/page.tsx` types `params` as `{ id: string }`; in Next 15 it is a
`Promise`. This is a mechanical migration, unlike #1 — but the build stays red until #1 is fixed
anyway, so it is listed rather than fixed piecemeal.

### 4. `Organization.upsert` inside the request path

`POST /api/accounts` upserts the Clerk org into the local DB on every call, with a hardcoded
`name: 'My Organization'`. It papers over a missing Clerk webhook: the row should be created when
the organization is created, not lazily by whichever request happens to arrive first. The hardcoded
name is a placeholder that will reach users.

### 5. No migration history

`prisma/migrations/` was gitignored and is empty; the schema is applied with `db push`. That works
for a disposable dev database and does not for production. The ignore rule is now removed — the
first real migration should be generated before the next schema change ships.

### 6. Comment narration throughout

Most comments restate the code beneath them, in Portuguese, including doc blocks above
self-describing functions. Clean what you touch.

### 7. Lint: 18 errors, 8 warnings

Mostly `@typescript-eslint/no-explicit-any` in `lib/audit.ts` and `lib/db.ts`. Informational, not a
gate. Worth a pass of its own, not a smuggled fix in an unrelated diff.
