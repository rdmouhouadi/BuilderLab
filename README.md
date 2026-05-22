# BuilderLab

> *"Better to have one strong, solid project than several small tutorials."*

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Version](https://img.shields.io/badge/version-0.2.0-teal.svg)]()
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black.svg)](https://nextjs.org)
[![Powered by Supabase](https://img.shields.io/badge/Powered%20by-Supabase-green.svg)](https://supabase.com)

---

## What is BuilderLab?

Student are expected to showcase personal projects in portfolios to stand out during job searches. However, it is often difficult to come up with solid project ideas that address real technical or business problems — projects that are truly portfolio-worthy.

Working alone, this can be challenging. But in teams of two, three, or more, it becomes much more achievable, and a project can even evolve into a product.

**BuilderLab is the space where student builders swarm around meaningful projects, collaborate, and ship things for real.**

**A typical use case:**
- A Data Science student posts: *"I'd like to work on a concrete project in healthcare"*
- A Software Engineer replies: *"Sounds interesting, want to collaborate?"*
- A UI/UX Designer joins in: *"Is there room for one more?"*
- Together, they build something real — for their portfolios, and sometimes... for the world 🚀

**The app is live at:** [builderlab-tau.vercel.app](https://builderlab-tau.vercel.app)

---

## Vision — The Student Builder Ecosystem

BuilderLab is more than a project matching platform. It is being built as an end-to-end ecosystem for student builders:

```
Find your team        →     Validate your project     →     Build together
(BuilderLab Core)                (HiveCheck)                   (HiveOS)
```

Each layer builds on the previous one, serving the same community of student builders at every stage of their journey.

### Build in Public — The Core Philosophy

BuilderLab is built around the **build in public** spirit. Projects, feedback, and team journeys are meant to be shared — not hidden away until they are "perfect."

On platforms like LinkedIn, students are often afraid to share work in progress. The fear of judgment from recruiters or seniors creates a culture of silence. BuilderLab is different: **everyone here is a student, everyone is learning, and that shared context makes it safe to be transparent.**

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
│  │  9 tables   │  │  (JWT)   │  │  Security     │   │
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

## Current Status — v0.2.0

| Feature | Status |
|---|---|
| User authentication (sign up, sign in, sign out) | ✅ Live |
| User profile (name, bio, school, major, preferred contact) | ✅ Live |
| Public profile pages `/profile/[id]` | ✅ Live |
| Post a project (title, problem, skills, level, duration, spots) | ✅ Live |
| Edit and delete a project | ✅ Live |
| Project feed with search and filters (skill, level, duration) | ✅ Live |
| Feed filters out owned and joined projects | ✅ Live |
| Project detail page | ✅ Live |
| Express interest with personalized message + contact pre-fill | ✅ Live |
| Connection requests (accept / decline) | ✅ Live |
| Auto-membership on accept | ✅ Live |
| Pending filter + badge on navbar | ✅ Live |
| Project milestones with progress bar | ✅ Live |
| Project Updates — Build Log | ✅ Live |
| Activity signals on project cards | ✅ Live |
| Team contact links (Discord, WhatsApp, Slack, etc.) | ✅ Live |
| Clickable builder names → public profiles | ✅ Live |
| Mandatory rating system at project completion | ✅ Live |
| Email notifications (interest received + request accepted) | ✅ Live |
| Animated navbar with Framer Motion sliding capsule | ✅ Live |
| Smooth page transitions | ✅ Live |
| Separate dev / production databases | ✅ Live |

---

## Roadmap

### V0.3.0 — Conversation Layer
*Turning "I'm interested" into "we are building together."*

The current MVP enables discovery and intent expression. V0.3.0 adds the conversation layer that makes real collaboration decisions possible.

- [ ] 1:1 chat tied to connection requests (Supabase Realtime)
- [ ] Connection request message visible on project detail page
- [ ] Group chat inside project workspace
- [ ] In-app notification system

### V0.4.0 — Build in Public & Privacy 🌐
*Giving builders control over what they share — and making going public feel like an achievement.*

BuilderLab's build in public philosophy requires a thoughtful privacy model. Transparency is encouraged, never forced. Builders choose what to share, and the platform prompts them at the right moment.

**Privacy defaults by content type:**

| Content | Default | Can change to |
|---|---|---|
| Project title, problem, domain | Public | Private |
| Team members & skills | Public | Private |
| Milestone progress | Public | Private (opt-out) |
| Peer reviews received | Private | Public (opt-in) |
| Reviewer identities | Always anonymous | — |
| Team meeting notes (HiveOS) | Private | Public per note |
| Weekly digest (HiveOS) | Private | Public (opt-in) |
| Project journey page | Private | Public (opt-in) |

**Going public UX — three trigger moments:**
- 🎉 **Project completion** — a celebratory modal: *"You shipped it. Want to share your journey so other builders can learn from it?"*
- 📬 **After receiving reviews** — a quiet nudge: *"Your project received 4 reviews. The community learns a lot from public feedback — want to share yours?"*
- 📋 **Weekly digest (HiveOS)** — a single toggle: *"This digest is private. Share it with the community?"*

**Features:**
- [ ] Per-project privacy settings
- [ ] Project completion modal with granular share options
- [ ] Post-review nudge to publish feedback publicly
- [ ] Global privacy dashboard in user settings
- [ ] Project archive — completed projects history

### V0.5.0 — HiveCheck ⭐
*Helping builders validate their work and grow through peer feedback.*

Builders submit their projects for structured peer review. The community rates projects on technical depth, problem clarity, and real-world relevance. A curated leaderboard surfaces the strongest projects by domain.

Public feedback threads mean anyone can read the reviews a project received — not just the submitter. Builders learn what makes a strong project by reading critiques of others. Reviews become content that builds itself over time.

- [ ] Project submission for peer review (GitHub link, demo, description)
- [ ] Structured review form (technical depth, clarity, relevance, overall score)
- [ ] Anonymous feedback — reviewers always anonymous to submitters
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

### V0.7.0 — BuilderLab Pro 💎
*For builders who want more visibility and a stronger signal.*

| Feature | Free | Pro |
|---|---|---|
| Project posting & team matching | ✅ | ✅ |
| HiveCheck peer reviews & leaderboard | ✅ | ✅ |
| HiveOS team workspace | ✅ | ✅ |
| Custom public project page (shareable outside BuilderLab) | ❌ | ✅ |
| Portfolio embed (personal site or LinkedIn) | ❌ | ✅ |
| Feedback analytics (how your scores compare by domain) | ❌ | ✅ |
| Full build-in-public archive (beautifully formatted journey) | ❌ | ✅ |
| Priority listing in the feed | ❌ | ✅ |

### V1.0.0 — 🐝 Rebranding to BNest

*When the product is complete and the community is established, BuilderLab becomes BNest.*

The rebrand is a deliberate launch moment — not just a name change, but a public statement that the platform has matured.

**What changes:**
- Name: BuilderLab → **BNest**
- Tagline: → **"Where builders swarm."**
- Domain: → **bnest.io** (or equivalent)
- Visual identity: hexagonal motifs, amber + teal palette
- Logo: hexagonal bee-inspired mark

**Vocabulary update:**

| Current | BNest |
|---|---|
| Project | Build |
| Project feed | The Hive |
| Team | Colony |
| Express interest | Join the swarm |
| Top-rated builder | Queen Bee 🐝 |
| HiveCheck | HiveCheck (unchanged) |
| HiveOS | HiveOS (unchanged) |
| Weekly digest | Hive Report |
| Going public | Flying from the hive |

**Why wait for V1.0.0?**
Beta testers know BuilderLab. Rebranding mid-beta creates confusion. The rename becomes a public launch moment worth celebrating — a signal to the community that something real has been built.

### Future
- [ ] University email verification
- [ ] Mobile app (React Native)
- [ ] Recruiter portal — access to top-rated projects and builder profiles (B2B monetization)


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

BuilderLab is open source under the AGPL v3 license. Contributions are very welcome — this project is itself a learning experience, and collaborating on it is exactly the spirit of BuilderLab.

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

All feedback, suggestions, and PRs are welcome.

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
