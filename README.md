# BuilderLab

> *"Better to have one strong, solid project than several small tutorials."*

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Version](https://img.shields.io/badge/version-0.1.0-teal.svg)]()
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black.svg)](https://nextjs.org)
[![Powered by Supabase](https://img.shields.io/badge/Powered%20by-Supabase-green.svg)](https://supabase.com)

---

## What is BuilderLab?

As students, we are expected to showcase personal projects in our portfolios to stand out during job searches. However, it is often difficult to come up with solid project ideas that address real technical or business problems — projects that are truly portfolio-worthy.

Working alone, this can be challenging. But in teams of two, three, or more, it becomes much more achievable, and a project can even evolve into a product.

**BuilderLab is a space where students get together and collaborate to build portfolio-worthy projects.**

**A typical use case:**
- A Data Science student posts: *"I'd like to work on a concrete project in healthcare"*
- A Software Engineer replies: *"Sounds interesting, want to collaborate?"*
- A UI/UX Designer joins in: *"Is there room for one more?"*
- Together, they build something real — for their portfolios, and sometimes... for the world 🚀

**The app is live at:** [builderlab.vercel.app](https://builderlab-tau.vercel.app)

---

## Architecture Overview

BuilderLab is a full-stack web application built with modern, production-grade tools.

```
┌─────────────────────────────────────────────────────┐
│                     Frontend                        │
│         Next.js 14 (App Router) + TypeScript        │
│              Tailwind CSS + Framer Motion           │
└─────────────────────┬───────────────────────────────┘
                      │
                      │ Supabase Client (@supabase/ssr)
                      │
┌─────────────────────▼───────────────────────────────┐
│                    Backend                          │
│                   Supabase                          │
│                                                     │
│  ┌─────────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  PostgreSQL  │  │   Auth   │  │  Row Level    │  │
│  │  Database   │  │  (JWT)   │  │  Security     │  │
│  └─────────────┘  └──────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────┘
                      │
                      │ Deployed on
                      │
┌─────────────────────▼───────────────────────────────┐
│                    Vercel                           │
│            Edge Network + CI/CD                     │
└─────────────────────────────────────────────────────┘
```

**Key architectural decisions:**
- **Server Components by default** — data fetching happens server-side for performance and SEO
- **Client Components only when needed** — interactive UI elements (forms, filters, modals)
- **Supabase RLS** — security enforced at the database level, not just the application level
- **Centralized constants** — all skills, domains, colors defined once in `lib/constants.ts`

---

## Current Status — v0.1.0

BuilderLab V1 is live and functional. Here is what is currently available:

| Feature | Status |
|---|---|
| User authentication (sign up, sign in, sign out) | ✅ Live |
| User profile (name, bio, school, major, preferred contact) | ✅ Live |
| Post a project (title, problem, skills, level, duration, spots) | ✅ Live |
| Project feed with search and filters | ✅ Live |
| Project detail page | ✅ Live |
| Express interest in a project ("I'm interested") | ✅ Live |
| Connection requests (accept / decline) | ✅ Live |
| Project milestones | ✅ Live |
| Team contact links (Discord, WhatsApp, Slack, etc.) | ✅ Live |
| Mandatory rating system at project completion | ✅ Live |
| Animated navbar with Framer Motion | ✅ Live |
| Smooth page transitions | ✅ Live |

---

## Roadmap

### V0.2.0 — Trust & Engagement
- [ ] Email notifications when a connection request is received
- [ ] In-app notification badge on the Connections tab
- [ ] Project bookmark / save for later
- [ ] Public user profile pages (view other builders)

### V0.3.0 — Collaboration Tools
- [ ] In-app messaging between project members
- [ ] File and image sharing within a project
- [ ] Project activity feed (who joined, milestone completed, etc.)
- [ ] Project archive — completed projects history

### Future
- [ ] University email verification
- [ ] Mobile app (React Native)
- [ ] MLOps project templates for Data Science students
- [ ] AWS infrastructure integration guides

---

## Quickstart

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account
- A [Vercel](https://vercel.com) account (for deployment)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/builderlab.git
cd builderlab
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

Create a new project on [supabase.com](https://supabase.com), then run the SQL scripts found in `/docs/sql/` in this order:

```
1. schema.sql        — creates all tables
2. rls.sql           — enables Row Level Security and policies
3. triggers.sql      — sets up automatic functions (avg_rating, new user profile)
4. seed.sql          — optional test data
```

### 4. Configure environment variables

Create a `.env.local` file at the root of the project:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Configure Supabase Auth

In **Supabase → Authentication → URL Configuration**:

```
Site URL: http://localhost:3000
Redirect URLs: http://localhost:3000/auth/callback
```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
builderlab/
│
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Home — project feed
│   ├── login/
│   │   └── page.tsx              # Authentication page
│   ├── post/
│   │   └── page.tsx              # Post a new project
│   ├── profile/
│   │   └── page.tsx              # User profile page
│   ├── connections/
│   │   └── page.tsx              # Connection requests
│   ├── projects/
│   │   └── [id]/
│   │       └── page.tsx          # Project detail page
│   └── auth/
│       └── callback/
│           └── route.ts          # Supabase auth callback
│
├── components/                   # Reusable UI components
│   ├── Navbar.tsx                # Navigation bar with animated capsule
│   ├── Feed.tsx                  # Project feed with search and filters
│   ├── ProjectCard.tsx           # Individual project card
│   ├── ProjectDetailClient.tsx   # Project detail (milestones, team, rating)
│   ├── ProfileClient.tsx         # Profile view and edit
│   ├── ConnectionsClient.tsx     # Connection requests management
│   ├── RatingModal.tsx           # End-of-project rating modal
│   └── PageTransition.tsx        # Framer Motion page transitions
│
├── lib/                          # Shared utilities and configuration
│   ├── supabase.ts               # Supabase server client
│   ├── supabase-browser.ts       # Supabase browser client
│   └── constants.ts              # Skills, domains, colors, contact types
│
├── types/                        # TypeScript type definitions
│   └── index.ts                  # Project, Profile, Milestone, etc.
│
├── proxy.ts                      # Next.js proxy (route protection)
│
└── docs/                         # Documentation
    ├── sql/                      # SQL scripts for Supabase setup
    │   ├── schema.sql
    │   ├── rls.sql
    │   ├── triggers.sql
    │   └── seed.sql
    ├── ARCHITECTURE.md           # Detailed architecture documentation
    └── DATABASE.md               # Database schema and RLS documentation
```

---

## Contributing

BuilderLab is open source under the AGPL v3 license. Contributions are very welcome — this project is itself a learning experience, and collaborating on it is exactly the spirit of BuilderLab.

**How to contribute:**

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feat/your-feature-name
```

3. Commit your changes with a clear message

```bash
git commit -m "feat: add your feature description"
```

4. Push and open a Pull Request

```bash
git push origin feat/your-feature-name
```

**Commit conventions:**

| Prefix | Use for |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `chore:` | Maintenance, dependencies |
| `docs:` | Documentation only |
| `refactor:` | Code restructuring without feature change |

All feedback, suggestions, and PRs are welcome — go easy on me, I'm not originally a developer 😄

---

## LICENSE

BuilderLab is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

This means:
- You are free to use, modify, and distribute this software
- If you run a modified version as a network service, you must make your source code available
- All derivative works must also be licensed under AGPL-3.0

See the [LICENSE](./LICENSE) file for the full license text.

---

<div align="center">
  <p>Built with ❤️ and Claude</p>
  <p>
    <a href="https://builderlab-tau.vercel.app">Live App</a> ·
    <a href="./docs/ARCHITECTURE.md">Architecture</a> ·
    <a href="./docs/DATABASE.md">Database</a>
  </p>
</div>