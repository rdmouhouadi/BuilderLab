# BuilderLab — Testing Strategy

> This document describes how BuilderLab is tested from V0.6.0 onward: which tool is used for which kind of test, why those tools were chosen, how tests are organized, and the rollout plan for adding coverage to existing code.
>
> If you're a new contributor: read this before writing your first test. It explains the trade-offs that shaped this strategy so you don't have to re-litigate them.

---

## 1. Philosophy

Starting with V0.6.0, **new features and bug fixes follow test-driven development (TDD)**: write a failing test first, then write the minimum code to make it pass, then refactor.

**We are explicitly *not* doing a big-bang backfill of tests for the entire existing app before starting.** The codebase already has ~15 database tables, ~20 components, and multiple API routes built without tests. Writing full coverage for all of that upfront would:

- take days/weeks before any TDD work could begin,
- produce tests for code that may be refactored soon anyway (wasted effort), and
- not actually be where the risk is concentrated — most of the existing code has been manually verified in the browser already.

**The trade-off we chose instead:**

| Approach | Pros | Cons |
|---|---|---|
| **Full backfill first** (rejected) | Complete safety net immediately; no coverage gaps | Large upfront cost, delays TDD adoption, tests may target code about to change |
| **Scoped + incremental** (adopted) | Harness is usable today; effort goes to the highest-risk paths first; legacy code gets covered naturally as it's touched | Temporary coverage gaps in untouched legacy areas |

So: the test harness (Vitest, Playwright, mocks) is set up now, a **thin slice of high-value tests** is written for the riskiest/most-used paths (see [§7 Rollout Plan](#7-rollout-plan)), and everything else gets a test the next time it's modified — written *before* the change, per TDD.

---

## 2. Test categories & tooling

| Category | Tool | What it covers |
|---|---|---|
| Unit tests | **Vitest** | Pure functions and helpers in `lib/` (e.g. `lib/timeLabel.ts`, `lib/docs-content.ts`, `lib/constants.ts`) |
| Component tests | **Vitest + React Testing Library** | Individual React components in `components/` — rendering, props, user interaction, conditional UI (e.g. auth-aware `Navbar`) |
| API / integration tests | **Vitest** | Route handlers in `app/api/**/route.ts` — request validation, Supabase calls, error handling — with Supabase and Resend mocked |
| End-to-end / functional tests | **Playwright** | Full user journeys through the running app (signup, post a project, contact form, connections) against the **DEV** Supabase project |

### 2.1 Unit tests — Vitest

Target: small, pure, synchronous logic with no React and no I/O.

Examples in this codebase:
- `lib/timeLabel.ts` — formats timestamps into "2h ago" style strings
- `lib/docs-content.ts` — `getSearchIndex()` and content parsing for docs search
- `lib/constants.ts` — any derived constants/lookups

### 2.2 Component tests — Vitest + React Testing Library

Target: components that have meaningful conditional rendering, state, or user interaction. Server Components that are `async` are **not** unit-tested here (see note in §3) — they're covered by E2E instead.

Examples in this codebase:
- `components/Navbar.tsx` / `components/marketing/MktNavbar.tsx` — renders different states for logged-in vs logged-out users
- `components/ProjectCard.tsx` — renders project data correctly, handles missing/optional fields
- `components/InterestModal.tsx`, `components/RatingModal.tsx`, `components/LeaveProjectModal.tsx` — form validation, required fields, submit/cancel behavior
- `components/marketing/DocsSearchBox.tsx` — search input, keyboard shortcuts (⌘K/Ctrl+K), result rendering

### 2.3 API / integration tests — Vitest

Target: the `POST`/`GET`/etc. exports of `app/api/**/route.ts` files, called directly as functions with a constructed `NextRequest`. Supabase clients (`lib/supabase-admin.ts`, `lib/supabase.ts`) and `resend` are mocked via `vi.mock()` so no real network/DB calls happen.

Examples in this codebase:
- `app/api/contact/route.ts` — missing-field validation, `contact_messages` insert, Resend email send, error paths (DB insert fails but email still sent, email fails returns 500)
- `app/api/notify/interest/route.ts` / `app/api/notify/accepted/route.ts` — connection lookups, notification inserts, email sends

### 2.4 End-to-end / functional tests — Playwright

Target: real user flows through the actual running app (`next dev` or a built app), exercising the real UI, real routing, and a **real DEV Supabase project** (never production — see §6).

Examples of flows to cover:
- Sign up → land on `/feed` (auth redirect behavior from middleware)
- Submit the `/contact` form → success state shown, row appears in `contact_messages` (DEV DB)
- Post a project → appears in `/feed` → another user sends a connection request → owner accepts → notification appears
- Docs search (`/docs`) → search returns expected article and navigates to it

---

## 3. Why these tools

### Vitest over Jest
Both are documented and supported for this Next.js version (`node_modules/next/dist/docs/01-app/02-guides/testing/`). Vitest was chosen because:
- Native ESM/TypeScript support with no transform config, which matches this project's `"module": "esnext"` / `"moduleResolution": "bundler"` `tsconfig.json` setup
- Significantly faster watch-mode re-runs, which matters for TDD's tight red-green-refactor loop
- Shares config/mental-model with Vite-based tooling if the project ever moves that direction

**Trade-off accepted:** like Jest, Vitest cannot render `async` Server Components. Any component that is an `async function` (most files under `app/`) is exercised via Playwright E2E instead of a component test — see §2.2.

### Playwright over Cypress
- First-class TypeScript support and a single API across Chromium/Firefox/WebKit
- Better suited to testing flows that span the Next.js middleware (auth redirects) and Supabase Auth UI widget, both of which are awkward to mock in a component test
- Officially documented for the App Router in this Next.js version

**Trade-off accepted:** E2E tests are slower and flakier than unit tests, so they're reserved for *flows*, not used as a substitute for component/unit coverage.

---

## 4. Directory structure & naming conventions

```
lib/timeLabel.ts
lib/__tests__/timeLabel.test.ts          # unit test, in a __tests__ subfolder

components/ProjectCard.tsx
components/__tests__/ProjectCard.test.tsx # component test

app/api/contact/route.ts
app/api/contact/__tests__/route.test.ts   # API/integration test

e2e/
  contact-form.spec.ts
  auth-flow.spec.ts
  project-connection-flow.spec.ts

vitest.config.mts
playwright.config.ts
```

- **Unit, component, and API tests live in a `__tests__/` subfolder inside the directory they test** (`*.test.ts` / `*.test.tsx`), one level below their source file. This keeps tests close to the code for discoverability and consistent renaming, while keeping each directory's top-level listing focused on source files. Vitest's default glob picks up `__tests__/**` automatically.
- **E2E specs live in a top-level `e2e/` directory**, organized by user journey rather than by file, since a single flow touches many files (`*.spec.ts`, Playwright convention).

---

## 5. Mocking strategy

Most of this codebase's logic talks to Supabase or Resend. For unit/component/integration tests (everything except Playwright E2E), these are mocked:

- **`lib/supabase-admin.ts`** (`supabaseAdmin`) — mocked via `vi.mock('@/lib/supabase-admin')`, returning a chainable mock (`.from().insert()`, `.from().select().eq().single()`, etc.) so route handlers can be tested without a real DB.
- **`lib/supabase.ts`** / **`lib/supabase-browser.ts`** — mocked similarly for components/pages that read the session or query data client-side.
- **`resend`** — mocked via `vi.mock('resend')` so `Resend.emails.send()` never sends a real email; tests assert it was *called* with the right payload.

Playwright E2E tests are the **only** layer allowed to hit real Supabase — and only the DEV project (§6).

---

## 6. Environments

Per `docs/sql/db_migration_DEV_to_Prod_procedure.md`, BuilderLab has separate **DEV** and **PROD** Supabase projects. Testing rules:

- Unit/component/integration tests (Vitest): **no real backend** — Supabase and Resend are always mocked. These can run anywhere, including CI, with no secrets.
- E2E tests (Playwright): run against the **DEV** Supabase project only (`.env.local` / `.env.test` credentials), using disposable test accounts. **Never run E2E against production credentials.**

---

## 7. Rollout plan

### Phase 1 — Harness + high-value slice (now)
1. Install and configure Vitest, React Testing Library, and Playwright.
2. Add `npm run test` (Vitest), `npm run test:watch`, and `npm run test:e2e` (Playwright) scripts.
3. Write the first tests for the highest-risk/most-recently-changed areas:
   - `app/api/contact/route.ts` (validation, DB insert, email send — just built, no coverage yet)
   - `app/api/notify/interest/route.ts`, `app/api/notify/accepted/route.ts`
   - `components/Navbar.tsx` / `MktNavbar.tsx` (auth-aware rendering — easy to silently break)
   - One Playwright smoke flow: contact form submission end-to-end

### Phase 2 — Backfill as touched (ongoing)
For every subsequent PR, regardless of size:
- If it touches a file with no test, **add a test for the part being changed** before changing it (TDD).
- If it's a new feature, write the test(s) first per §2, then implement.

Over time this naturally covers the highest-churn parts of the app first, without a dedicated backfill effort.

---

## 8. Running tests

```bash
npm run test        # Vitest — unit, component, and API tests (single run)
npm run test:watch  # Vitest — watch mode for TDD
npm run test:e2e    # Playwright — E2E flows (requires dev server + DEV Supabase env)
```

---

## 9. CI

Not yet configured. Once added, `npm run test` (Vitest, fully mocked, no secrets needed) should run on every PR. `npm run test:e2e` requires DEV Supabase secrets and a running app, so it can be added once the secret management for CI is in place — tracked as a follow-up, not a blocker for adopting TDD locally.

---

*Last updated: BuilderLab v0.6.0*
