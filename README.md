# BuilderLab

> *"Better to have one strong, solid project than several small tutorials."*

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Version](https://img.shields.io/badge/version-0.2.0-teal.svg)]()
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black.svg)](https://nextjs.org)
[![Powered by Supabase](https://img.shields.io/badge/Powered%20by-Supabase-green.svg)](https://supabase.com)

---

## What is BuilderLab?

Students are expected to showcase personal projects in portfolios to stand out during job searches. However, it is often difficult to come up with solid project ideas that address real technical or business problems — projects that are truly portfolio-worthy.

Working alone, this can be challenging. But in teams of two, three, or more, it becomes much more achievable, and a project can even evolve into a product.

**BuilderLab is a space where students collaborate, grow together, and build portfolio-worthy projects.**

**A typical use case:**
- A Data Science student posts: *"I'd like to work on a concrete project in healthcare"*
- A Software Engineer replies: *"Sounds interesting, want to collaborate?"*
- A UI/UX Designer joins in: *"Is there room for one more?"*
- Together, they build something real — for their portfolios, and sometimes... for the world 🚀

**The app is live at:** [builderlab.vercel.app](https://builderlab.vercel.app)

---

## Vision

BuilderLab started as a personal learning project — a way to practice SQL, infrastructure, and full-stack development by building something real. But it quickly became something bigger.

The goal is a platform where students worldwide can turn learning intent into real-world projects through collaboration, conversation, and public building.

```
Phase 1 — BuilderLab (now)
Students worldwide collaborate on portfolio projects

        ↓

Phase 2 — AfriBuilders (future, separate product)
African builders solving African problems together
```

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
│  │  9 tables   │  │  (JWT)   │  │  Security     │   │
│  └─────────────┘  └──────────┘  └───────────────┘   │
└─────────────────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│                    Vercel                           │
│            Edge Network + CI/CD                     │
└─────────────────────────────────────────────────────┘
```

---

## Current Status — v0.2.0

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
| Express interest with personalized message | ✅ Live |
| Contact pre-fill in interest message | ✅ Live |
| Connection requests (accept / decline) | ✅ Live |
| Auto-membership on accept | ✅ Live |
| Pending filter + badge on navbar | ✅ Live |
| Project milestones | ✅ Live |
| Project Updates — Build Log | ✅ Live |
| Activity signals on project cards | ✅ Live |
| Team contact links | ✅ Live |
| Clickable builder names → public profiles | ✅ Live |
| Mandatory rating system at project completion | ✅ Live |
| Email notifications (interest + accepted) | ✅ Live |
| Animated navbar with Framer Motion | ✅ Live |
| Smooth page transitions | ✅ Live |
| Separate dev / production databases | ✅ Live |

---

## Roadmap

### V0.3.0 — Conversation Layer
- [ ] 1:1 chat tied to connection requests (Supabase Realtime)
- [ ] Group chat inside project workspace
- [ ] Connection request message visible on project detail page
- [ ] In-app notification badge

### V0.4.0 — Intelligence Layer
- [ ] Soft nudges ("No update in 2 weeks — is the project still active?")
- [ ] Contribution tracking
- [ ] GitHub integration (optional)
- [ ] Project outcome page (portfolio artifact)

### V1.0.0 — Full Platform
- [ ] Build-in-public global feed
- [ ] Ambient mentorship
- [ ] Mobile app (React Native)
- [ ] University email verification

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
│   ├── profile/
│   │   ├── page.tsx                    # Own profile (edit)
│   │   └── [id]/page.tsx              # Public profile (read-only)
│   ├── connections/page.tsx            # Connection requests
│   ├── projects/[id]/page.tsx         # Project detail
│   ├── auth/callback/route.ts          # Supabase auth callback
│   └── api/
│       └── notify/
│           ├── interest/route.ts       # Email: new interest
│           └── accepted/route.ts       # Email: request accepted
│
├── components/
│   ├── Navbar.tsx
│   ├── Feed.tsx
│   ├── ProjectCard.tsx
│   ├── ProjectDetailClient.tsx
│   ├── ProjectUpdates.tsx
│   ├── ProfileClient.tsx
│   ├── ConnectionsClient.tsx
│   ├── InterestModal.tsx
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

BuilderLab is open source under the AGPL v3 license. Contributions are very welcome.

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

Licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

See the [LICENSE](./LICENSE) file for details.

---

<div align="center">
  <p>Built by Richie Mouhouadi</p>
  <p>
    <a href="https://builderlab-tau.vercel.app">Live App</a> ·
    <a href="./docs/ARCHITECTURE.md">Architecture</a> ·
    <a href="./docs/DATABASE.md">Database</a>
  </p>
</div>
