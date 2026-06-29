# BuilderLab

> *"For anyone who learns by building."*

[![License: Source Available](https://img.shields.io/badge/License-Source%20Available-orange.svg)]()
[![Version](https://img.shields.io/badge/version-0.6.0-teal.svg)]()
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2016-black.svg)](https://nextjs.org)
[![Powered by Supabase](https://img.shields.io/badge/Powered%20by-Supabase-green.svg)](https://supabase.com)

---

> ⚖️ **Licensing Notice**
>
> BuilderLab is source-available.
>
> The source code is publicly visible for learning, transparency, and collaboration, but commercial use, hosted competition, and production redistribution are restricted.
>
> See the [LICENSE](./LICENSE) file for details.

---

## What is BuilderLab?

Nowadays, breaking into tech requires real projects — not tutorials, not toy apps, but portfolio-worthy projects that solve actual technical or business problems. That is hard to do alone, and even harder when you are not sure where to start.

BuilderLab is for **anyone who learns by building**: university students, bootcamp graduates, self-taught developers, career switchers, and online learners. If you are building skills and want to ship something real alongside people who are doing the same — this is your platform.

**builders are not defined by where they studied. They are defined by what they ship.**

**A typical use case:**
- A self-taught Data Science builder posts: *"I'd like to work on a concrete project in healthcare"*
- A bootcamp Software Engineer replies: *"Sounds interesting, want to collaborate?"*
- A UI/UX Designer learning online joins in: *"Is there room for one more?"*
- Together, they build something real — for their portfolios, and sometimes... for the world 🚀

**The app is live at:** [builderlab-tau.vercel.app](https://builderlab-tau.vercel.app)

---

## Vision — The Builder Ecosystem

BuilderLab is more than a project matching platform. It is being built as an end-to-end ecosystem for builders:

```
Find your team        →       Build together  →   Validate your project
(BuilderLab Core)                (HiveOS)              (HiveCheck)
```

Each layer builds on the previous one, serving the same community of builders at every stage of their journey.

### Build in Public — The Core Philosophy

BuilderLab is built around the **build in public** spirit. Projects, feedback, and team journeys are meant to be shared — not hidden away until they are "perfect."

On platforms like LinkedIn, students are often afraid to share work in progress. The fear of judgment from seniors or recruiters creates a culture of silence. BuilderLab is different: **everyone here is a builder, everyone is learning, and that shared context makes it safe to be transparent.**

Seeing how another builder received tough feedback and improved their project is often more valuable than any tutorial. The projects in the platform are not just deliverables — they are learning resources for the whole community.

> *A builder should never be embarrassed by something BuilderLab made public without their clear intent.* Transparency is encouraged, never forced.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                     Frontend                        │
│         Next.js 16 (App Router) + TypeScript        │
│         Tailwind CSS v4 + Framer Motion + Resend    │
└─────────────────────┬───────────────────────────────┘
                      │
                      │ Supabase Client (@supabase/ssr)
                      │
┌─────────────────────▼───────────────────────────────┐
│                    Backend                          │
│                    Supabase                         │
│                                                     │
│  ┌─────────────┐  ┌──────────┐  ┌───────────────┐   │
│  │  PostgreSQL │  │   Auth   │  │  Row Level    │   │
│  │  14 tables  │  │  (JWT)   │  │  Security     │   │
│  └─────────────┘  └──────────┘  └───────────────┘   │
└─────────────────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│                    Vercel                           │
│            Edge Network + CI/CD                     │
└─────────────────────────────────────────────────────┘
```

**Key architectural decisions:**
- **Route groups** — `(marketing)/` and `(app)/` give each surface its own layout without affecting URLs
- **Server Components by default** — data fetching server-side for performance and SEO
- **Client Components only when needed** — interactive UI (forms, filters, modals)
- **Supabase RLS** — security enforced at the database level
- **Centralized design tokens** — all colors, spacing, typography defined once in `lib/design-tokens.ts`
- **Component decomposition** — large orchestrator components (project detail page, landing page) are kept under ~350 lines by extracting focused sub-components that receive props rather than owning their own state

---

## Current Status — v0.6.0

### App
| Feature | Status |
|---|---|
| User authentication (sign up, sign in, sign out) | ✅ Live |
| User profile (name, bio, school, major, preferred contact) | ✅ Live |
| Public profile pages `/profile/[id]` | ✅ Live |
| Post a project (title, problem, skills, level, duration, spots) | ✅ Live |
| Edit and delete a project | ✅ Live |
| Project feed with search and filters (`/feed`) | ✅ Live |
| Feed filters out owned and joined projects | ✅ Live |
| Project detail page | ✅ Live |
| Express interest with personalized message + contact pre-fill | ✅ Live |
| Connection requests (accept / decline) | ✅ Live |
| Auto-membership on accept | ✅ Live |
| Pending filter + badge on navbar | ✅ Live |
| Project milestones with progress bar | ✅ Live |
| Project Updates — Build Log | ✅ Live |
| Activity signals on project cards | ✅ Live |
| Group chat (polling) inside project workspace | ✅ Live |
| Connection message visible in team section | ✅ Live |
| In-app notifications (bell + dropdown + `/notifications`) | ✅ Live |
| Follow system (cards + project detail) | ✅ Live |
| "Projects I follow" section in profile | ✅ Live |
| Per-section privacy settings (Build Log, Chat, Milestones, Team) | ✅ Live |
| Project archive / HiveCheck leaderboard | ✅ Live |
| Completion modal (opt-out, public by default) | ✅ Live |
| Community feedback section on project pages | ✅ Live |
| Team contact links (Discord, WhatsApp, Slack, etc.) | ✅ Live |
| Clickable builder names → public profiles | ✅ Live |
| Mandatory rating system at project completion | ✅ Live |
| Email notifications (interest received + request accepted) | ✅ Live |
| Animated navbar with Framer Motion sliding capsule | ✅ Live |
| Smooth page transitions | ✅ Live |
| HiveOS Task Management | ✅ Live |
| Leave / remove member, with mandatory reason | ✅ Live |

### Marketing site
| Feature | Status |
|---|---|
| Landing page `/` — hero, problem, how it works, ecosystem, build in public, CTA | ✅ Built |
| Auth-aware landing page CTA — "Start building" / "Continue building" | ✅ Built |
| Vision page `/vision` — mission, pillars, roadmap timeline | ✅ Built |
| Docs `/docs/[slug]` — 10 articles, sidebar, prev/next routing | ✅ Built |
| Docs live search — client-side full-text search with ⌘K shortcut | ✅ Built |
| Contact `/contact` — subject chips, conditional role field, success state | ✅ Built |
| Contact form API `POST /api/contact` → Resend + persisted to `contact_messages` | ✅ Built |
| Auth-aware marketing navbar — Projects + avatar when logged in | ✅ Built |
| Separate Sign in (`/login`) and Sign up (`/signup`) pages | ✅ Built |
| Footer (4-col, responsive) | ✅ Built |
| Scroll-reveal animations (`prefers-reduced-motion` safe) | ✅ Built |

### Engineering
| Item | Status |
|---|---|
| Test harness — Vitest + React Testing Library + Playwright | ✅ Live (25 unit/integration tests + 1 E2E flow) |
| CI — lint + test on every push/PR to `dev` and `main` | ✅ Live |
| ESLint — zero errors | ✅ Live |
| Docker dev environment (`docker-compose up`) | ✅ Live |
| Production image build + GHCR publish on version tags | ✅ Live |

---

## Roadmap

### V0.7.0 — HiveCheck ⭐
*Helping builders validate their work and grow through peer feedback.*

Builders submit their projects for structured peer review. The community rates projects on technical depth, problem clarity, and real-world relevance. A curated leaderboard surfaces the strongest projects by domain.

Public feedback threads mean anyone can read the reviews a project received — not just the submitter. Builders learn what makes a strong project by reading critiques of others. Reviews become content that builds itself over time.

- [ ] Project submission for peer review (GitHub link, demo, description)
- [ ] Structured review form (technical depth, clarity, relevance, overall score)
- [ ] Anonymous feedback — reviewers always anonymous to submitters
- [ ] Reviewer eligibility (3+ years experience, verified)
- [ ] Public project leaderboard by domain and skill
- [ ] "Top Project" badge on builder profiles
- [ ] Reviewer reputation score
- [ ] Public feedback threads — opt-in per project

> **Why this matters:** A project that has been reviewed and ranked by peers is far more credible in a portfolio than one that has not. HiveCheck turns BuilderLab into a quality signal, not just a matching platform.

---

## Quickstart

There are two ways to run BuilderLab locally: directly with `npm`, or inside Docker. Both connect to the same Supabase DEV cloud project — neither runs a local Postgres instance.

### Prerequisites
- A [Supabase](https://supabase.com) account
- A [Resend](https://resend.com) account (for email notifications)
- A [Vercel](https://vercel.com) account (for deployment) — not needed for the Docker path
- **Option A:** Node.js 22+
- **Option B:** Docker + Docker Compose

### 1. Clone the repository

```bash
git clone https://github.com/rdmouhouadi/builderlab.git
cd builderlab
```

### 2. Set up Supabase

Create a new project on [supabase.com](https://supabase.com), then run the SQL scripts in `/docs/sql/` in this order:

```
1. schema.sql        — creates all tables
2. rls.sql           — enables Row Level Security and policies
3. triggers.sql      — sets up automatic functions
4. seed.sql          — optional test data
```

### 3. Configure environment variables

Create a `.env.local` file at the root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RESEND_API_KEY=re_your-resend-key
```

### 4. Configure Supabase Auth

In **Supabase → Authentication → URL Configuration**:

```
Site URL: http://localhost:3000
Redirect URLs: http://localhost:3000/auth/callback
```

### 5. Run the app

**Option A — npm**

```bash
npm install
npm run dev
```

**Option B — Docker**

```bash
docker compose up --build
```

First run builds the image (a couple of minutes); subsequent runs are fast thanks to Docker's layer cache. Source code is mounted as a volume, so changes hot-reload exactly like `npm run dev` — there is no rebuild step for day-to-day development.

Either way, open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Environment variables — build-time vs. runtime

This distinction matters once you move beyond local development, particularly when building the Docker production image.

| Variable | When it's read | Where it lives |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **Build time** — inlined into the JS bundle | `.env.local` (local) / Docker `--build-arg` (prod image) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Build time** — inlined into the JS bundle | `.env.local` (local) / Docker `--build-arg` (prod image) |
| `NEXT_PUBLIC_SITE_URL` | **Build time** — inlined into the JS bundle | `.env.local` (local) / Docker `--build-arg` (prod image) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Runtime only** — read server-side on each request | `.env.local` (local) / `--env-file` or `docker-compose`'s `env_file` (prod) |
| `RESEND_API_KEY` | **Runtime only** — read server-side on each request | `.env.local` (local) / `--env-file` or `docker-compose`'s `env_file` (prod) |

Any variable prefixed `NEXT_PUBLIC_` is a Next.js convention meaning "safe to expose to the browser" — and as a consequence, Next.js bakes its value directly into the compiled JavaScript at `next build` time. It cannot be changed afterward without rebuilding. This is a framework constraint, not a BuilderLab-specific choice.

This is why the production Docker image is **rebuilt per environment** rather than configured at container startup — see [Building the production image](#building-the-production-image) below.

---

## Building the production image

The `Dockerfile`'s `runner` stage produces a minimal, self-contained image suitable for self-hosting outside of Vercel. It uses Next.js's [standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output) so the final image only ships the compiled server and its runtime dependencies — no source code, no dev tooling, no full `node_modules`.

### Build locally

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key \
  --build-arg NEXT_PUBLIC_SITE_URL=https://your-domain.com \
  -t builderlab:prod .
```

### Run it

Server-only secrets are passed at `docker run`, not baked into the image:

```bash
docker run -p 3000:3000 --env-file .env.production.local builderlab:prod
```

Where `.env.production.local` contains:
```bash
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key
RESEND_API_KEY=re_your-resend-key
```

### Automated builds via CI

`.github/workflows/docker-publish.yml` builds and pushes this image to **GitHub Container Registry (GHCR)** automatically whenever a version tag is pushed:

```bash
git tag v0.7.0
git push origin v0.7.0
```

The resulting image is published at:
```
ghcr.io/rdmouhouadi/builderlab:0.7.0
ghcr.io/rdmouhouadi/builderlab:latest
```

This requires three repository secrets to be set under **Settings → Secrets and variables → Actions** before the workflow can build successfully — `PROD_NEXT_PUBLIC_SUPABASE_URL`, `PROD_NEXT_PUBLIC_SUPABASE_ANON_KEY`, `PROD_NEXT_PUBLIC_SITE_URL` — using values from the **production** Supabase project, since this image is the one intended for actual deployment.

### Self-hosting

On a server with Docker installed:

```bash
docker pull ghcr.io/rdmouhouadi/builderlab:0.7.0
docker run -d -p 3000:3000 --env-file .env.production.local ghcr.io/rdmouhouadi/builderlab:0.7.0
```

A reverse proxy (Caddy, Nginx, or Traefik) is still needed in front of the container to handle HTTPS and a custom domain — Docker alone does not provide this.

By default, GHCR packages are private even on a public repository. To allow `docker pull` without authentication on the self-hosting server, either make the package public from its GitHub settings page, or run `docker login ghcr.io` on the server first.

---

## Testing

BuilderLab follows test-driven development. See [docs/Testing_strategy.md](docs/Testing_strategy.md) for the full strategy, tooling rationale, and rollout plan.

```bash
npm run test        # Vitest — unit, component, and API tests (single run)
npm run test:watch  # Vitest — watch mode for TDD
npm run test:e2e    # Playwright — E2E flows (requires dev server + DEV Supabase env)
```

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs `npm run lint` and `npm run test` on every push and pull request targeting `dev` or `main`. No secrets are required — Supabase and Resend are fully mocked at this layer.

---

## Project Structure

```
builderlab/
│
├── .github/
│   └── workflows/
│       ├── ci.yml                       # lint + test on push/PR to dev and main
│       └── docker-publish.yml           # build + push prod image to GHCR on version tags
│
├── Dockerfile                            # multi-stage: deps, dev, builder, runner
├── docker-compose.yml                    # local dev — connects to Supabase DEV cloud
├── .dockerignore
│
├── app/
│   ├── layout.tsx                       # Root shell — html/body/fonts/globals.css
│   ├── globals.css                      # Tailwind v4 + CSS variables
│   │
│   ├── (marketing)/                     # Marketing site — no app Navbar
│   │   ├── layout.tsx                   # Sora font + MktNavbar + Footer + ambients
│   │   ├── page.tsx                     # / — Landing page (assembles section components)
│   │   ├── vision/page.tsx              # /vision
│   │   ├── docs/[[...slug]]/page.tsx    # /docs — /docs/[article-slug]
│   │   └── contact/page.tsx             # /contact (Client Component)
│   │
│   ├── (app)/                           # App — has Navbar
│   │   ├── layout.tsx                   # Wraps children with Navbar
│   │   ├── feed/page.tsx                # /feed — Project feed (Server)
│   │   ├── login/page.tsx               # /login — Sign in (Client)
│   │   ├── signup/page.tsx              # /signup — Sign up (Client)
│   │   ├── post/page.tsx                # /post — Post project (Client)
│   │   ├── profile/
│   │   │   ├── page.tsx                 # /profile — Own profile (Server)
│   │   │   └── [id]/page.tsx           # /profile/[id] — Public profile (Server)
│   │   ├── connections/page.tsx         # /connections
│   │   ├── projects/[id]/page.tsx      # /projects/:id — Detail
│   │   ├── notifications/page.tsx       # /notifications
│   │   └── hivecheck/page.tsx           # /hivecheck
│   │
│   ├── auth/callback/route.ts           # Supabase auth callback
│   └── api/
│       ├── contact/route.ts             # POST — contact form → Resend + contact_messages
│       └── notify/
│           ├── interest/route.ts        # POST — email: new interest
│           └── accepted/route.ts        # POST — email: request accepted
│
├── components/
│   ├── marketing/
│   │   ├── home/                        # Landing page sections (one file each)
│   │   │   ├── shared.tsx               # Wrap, BtnPrimary, BtnSoft, SectionHead
│   │   │   ├── Hero.tsx                 # Hero + WindowChrome
│   │   │   ├── Strip.tsx
│   │   │   ├── Problem.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── Ecosystem.tsx
│   │   │   └── BuildInPublic.tsx
│   │   ├── MktNavbar.tsx                # Auth-aware marketing nav
│   │   ├── PrimaryCtaButton.tsx         # "Start / Continue building" CTA
│   │   ├── DocsSearchBox.tsx            # Live docs search with ⌘K
│   │   ├── Footer.tsx                   # 4-column footer
│   │   ├── ScrollReveal.tsx             # IntersectionObserver fade-in
│   │   └── Eyebrow.tsx                  # Teal pill label with dot
│   │
│   ├── ProjectDetail/                    # Project detail page sub-components
│   │   ├── shared.tsx                   # Card styles, Member/Connection types, name helpers
│   │   ├── ProjectMilestonesCard.tsx    # Milestones + Build Log + Team Chat
│   │   └── sidebar/
│   │       ├── OwnerCard.tsx
│   │       ├── TeamCard.tsx
│   │       ├── DetailsCard.tsx
│   │       ├── PrivacyCard.tsx
│   │       └── ProjectActions.tsx       # Mark completed, delete, rating, follow, HiveOS button
│   │
│   ├── Navbar.tsx                       # App navbar with notifications bell
│   ├── Feed.tsx
│   ├── ProjectCard.tsx
│   ├── ProjectDetailClient.tsx          # Orchestrator — state + Supabase mutations only
│   ├── ProjectUpdates.tsx               # Build Log
│   ├── ProjectChat.tsx                  # Group chat
│   ├── ProjectComments.tsx              # Community feedback
│   ├── ProfileClient.tsx
│   ├── ConnectionsClient.tsx
│   ├── NotificationsClient.tsx
│   ├── HiveCheckClient.tsx
│   ├── HiveOSPanel.tsx
│   ├── InterestModal.tsx
│   ├── LeaveProjectModal.tsx
│   ├── CompletionModal.tsx
│   ├── RatingModal.tsx
│   ├── BackButton.tsx
│   └── PageTransition.tsx
│
├── lib/
│   ├── design-tokens.ts                 # Single source of truth for all design values
│   ├── docs-content.ts                  # Docs article registry + search index (10 articles)
│   ├── supabase.ts                      # Server client
│   ├── supabase-browser.ts              # Browser client
│   ├── supabase-admin.ts                # Admin client (service_role)
│   ├── email.ts                         # Resend email functions
│   ├── constants.ts                     # Skills, domains, contact types
│   └── timeLabel.ts                     # Relative timestamps
│
├── types/index.ts
├── proxy.ts                             # Route protection (middleware)
├── public/images/                       # Hero screenshots for landing page
│
├── e2e/                                  # Playwright E2E specs (*.spec.ts)
├── vitest.config.mts
├── vitest.setup.ts
├── playwright.config.ts
│
└── docs/                                 # Private by default — see .gitignore
    ├── ARCHITECTURE.md                  # Tracked
    ├── DATABASE.md                      # Tracked
    ├── CHANGELOG.md                     # Tracked
    └── Testing_strategy.md              # Tracked
```

---

## Contributing

BuilderLab is developed in public under a source-available license.

The goal is to make the platform transparent, educational, and collaborative while protecting the long-term sustainability of the ecosystem.

Feedback, discussions, bug reports, and carefully scoped contributions are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m "feat: your feature description"`
4. Push and open a Pull Request

**Commit conventions:**

| Prefix | Use for |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `chore:` | Maintenance |
| `docs:` | Documentation |
| `refactor:` | Code restructuring |
| `test:` | Adding or updating tests |

---

## LICENSE

BuilderLab is licensed under a custom **Source Available License**.

You may view, fork, and modify the code for personal, educational, and non-commercial purposes.

Commercial usage, hosted competition, and production redistribution are prohibited without explicit written permission.

See the [LICENSE](./LICENSE) file for details.

> Historical note: Versions prior to v0.3.0 were released under AGPLv3. Starting with v0.3.0, BuilderLab transitioned to a custom source-available license.

---

<div align="center">
  <p>Built by Richie Mouhouadi</p>
  <p>
    <a href="https://builderlab-tau.vercel.app">Live App</a> ·
    <a href="./docs/ARCHITECTURE.md">Architecture</a> ·
    <a href="./docs/DATABASE.md">Database</a> ·
    <a href="./docs/CHANGELOG.md">Changelog</a>
  </p>
</div>