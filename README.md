# BuilderLab

> *"For anyone who learns by building."*

[![License: Source Available](https://img.shields.io/badge/License-Source%20Available-orange.svg)]()
[![Version](https://img.shields.io/badge/version-0.4.0-teal.svg)]()
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black.svg)](https://nextjs.org)
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
Find your team        →     Validate your project     →     Build together
(BuilderLab Core)                (HiveCheck)                   (HiveOS)
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
│         Next.js 14 (App Router) + TypeScript        │
│         Tailwind CSS + Framer Motion + Resend       │
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
│  │  13 tables  │  │  (JWT)   │  │  Security     │   │
│  └─────────────┘  └──────────┘  └───────────────┘   │
└─────────────────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│                    Vercel                           │
│            Edge Network + CI/CD                     │
└─────────────────────────────────────────────────────┘
```

**Key architectural decisions:**
- **Server Components by default** — data fetching server-side for performance and SEO
- **Client Components only when needed** — interactive UI (forms, filters, modals)
- **Supabase RLS** — security enforced at the database level
- **Centralized constants** — all skills, domains, colors defined once in `lib/constants.ts`

---

## Current Status — v0.4.0

| Feature | Status |
|---|---|
| User authentication (sign up, sign in, sign out) | ✅ Live |
| User profile (name, bio, school, major, preferred contact) | ✅ Live |
| Public profile pages `/profile/[id]` | ✅ Live |
| Post a project (title, problem, skills, level, duration, spots) | ✅ Live |
| Edit and delete a project | ✅ Live |
| Project feed with search and filters | ✅ Live |
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
| Project archive `/archive` | ✅ Live |
| Completion modal (opt-out, public by default) | ✅ Live |
| Community feedback section on project pages | ✅ Live |
| Team contact links (Discord, WhatsApp, Slack, etc.) | ✅ Live |
| Clickable builder names → public profiles | ✅ Live |
| Mandatory rating system at project completion | ✅ Live |
| Email notifications (interest received + request accepted) | ✅ Live |
| Animated navbar with Framer Motion sliding capsule | ✅ Live |
| Smooth page transitions | ✅ Live |
| Separate dev / production databases | ✅ Live |

---

## Roadmap

### V0.5.0 — HiveCheck ⭐
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

### V0.6.0 — HiveOS 🧠
*A minimal shared workspace for project teams.*

Once teams form on BuilderLab, they need a lightweight place to coordinate without switching to external tools. HiveOS is that workspace, built natively so everything stays in one place.

Teams that choose to build in public can optionally share their meeting notes, weekly digests, and task boards with the community — turning their process into a learning resource.

- [ ] Shared task board (To Do / In Progress / Done) per project
- [ ] Team meeting notes — shared, timestamped, editable by all members
- [ ] Milestone tracker (integrated with existing milestone system)
- [ ] Weekly digest — auto-generated summary of what the team accomplished
- [ ] Project completion report — exportable summary for portfolios and CVs
- [ ] Per-note public toggle

> **Why this matters:** Teams that stay organized ship. HiveOS removes the friction of "which tool do we use?" so builders can focus on building.

---

## Quickstart

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account
- A [Resend](https://resend.com) account (for email notifications)
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

Create a new project on [supabase.com](https://supabase.com), then run the SQL scripts in `/docs/sql/` in this order:

```
1. schema.sql        — creates all tables
2. rls.sql           — enables Row Level Security and policies
3. triggers.sql      — sets up automatic functions
4. seed.sql          — optional test data
```

### 4. Configure environment variables

Create a `.env.local` file at the root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RESEND_API_KEY=re_your-resend-key
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
├── app/
│   ├── page.tsx                        # Home — project feed
│   ├── login/page.tsx                  # Authentication
│   ├── post/page.tsx                   # Post a new project
│   ├── archive/page.tsx               # Completed projects archive
│   ├── notifications/page.tsx          # All notifications
│   ├── profile/
│   │   ├── page.tsx                    # Own profile (edit)
│   │   └── [id]/page.tsx              # Public profile (read-only)
│   ├── connections/page.tsx            # Connection requests
│   ├── projects/[id]/page.tsx         # Project detail
│   ├── auth/callback/route.ts          # Supabase auth callback
│   └── api/
│       └── notify/
│           ├── interest/route.ts       # Email + notif: new interest
│           └── accepted/route.ts       # Email + notif: request accepted
│
├── components/
│   ├── Navbar.tsx                      # Navbar with notifications bell
│   ├── Feed.tsx
│   ├── ProjectCard.tsx
│   ├── ProjectDetailClient.tsx
│   ├── ProjectUpdates.tsx              # Build Log
│   ├── ProjectChat.tsx                 # Group chat
│   ├── ProjectComments.tsx             # Community feedback
│   ├── ProfileClient.tsx
│   ├── ConnectionsClient.tsx
│   ├── NotificationsClient.tsx
│   ├── ArchiveClient.tsx
│   ├── InterestModal.tsx
│   ├── CompletionModal.tsx             # Celebratory completion modal
│   ├── RatingModal.tsx
│   ├── BackButton.tsx
│   └── PageTransition.tsx
│
├── lib/
│   ├── supabase.ts                     # Server client
│   ├── supabase-browser.ts             # Browser client
│   ├── supabase-admin.ts               # Admin client (service_role)
│   ├── email.ts                        # Resend email functions
│   ├── constants.ts                    # Skills, domains, colors
│   └── timeLabel.ts                    # Relative timestamps
│
├── types/index.ts
├── proxy.ts                            # Route protection
│
└── docs/
    ├── ARCHITECTURE.md
    ├── DATABASE.md
    └── CHANGELOG.md
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
    <a href="./CHANGELOG.md">Changelog</a>
  </p>
</div>