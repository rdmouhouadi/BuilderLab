# BuilderLab — Architecture Documentation

> This document describes the global architecture of BuilderLab — technical decisions, folder structure, data flow, and component design patterns.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Next.js App Router Structure](#3-nextjs-app-router-structure)
4. [Marketing Site vs App Site](#4-marketing-site-vs-app-site)
5. [Server vs Client Components](#5-server-vs-client-components)
6. [Supabase Integration](#6-supabase-integration)
7. [Authentication Flow](#7-authentication-flow)
8. [Route Protection](#8-route-protection)
9. [Email & Contact API](#9-email--contact-api)
10. [Data Flow](#10-data-flow)
11. [Component Design Patterns](#11-component-design-patterns)
12. [Design Tokens](#12-design-tokens)
13. [Deployment](#13-deployment)

---

## 1. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Framework | Next.js 16.2.4 (App Router) | Server Components, file-based routing, route groups, edge-ready |
| Language | TypeScript | Type safety, catches bugs early |
| Styling | Tailwind CSS v4 + inline styles | Utility-first, no CSS files to maintain |
| Fonts | next/font/google — Inter + Sora | App uses Inter; marketing headings use Sora |
| Animations | Framer Motion | Page transitions and navbar capsule |
| Scroll reveal | Custom IntersectionObserver | `ScrollReveal` component, gated by `prefers-reduced-motion` |
| Database | Supabase (PostgreSQL) | Realtime, Auth, RLS — all in one |
| Auth | Supabase Auth (JWT) | Email/password, cookie-based sessions |
| Email | Resend | Transactional emails + contact form submissions |
| Deployment | Vercel | Zero-config Next.js deployment |

---

## 2. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         Browser                              │
│   React Client Components (forms, modals, filters, chat)     │
└─────────────────────────┬────────────────────────────────────┘
                          │ HTTP / RSC Payload
┌─────────────────────────▼────────────────────────────────────┐
│                      Vercel Edge                             │
│   Next.js App Router                                         │
│   ├── (marketing)/ — public marketing pages                  │
│   ├── (app)/       — authenticated app pages                 │
│   ├── API Routes   — email notifications + contact form      │
│   └── Proxy        — route protection (proxy.ts)             │
└─────────────────────────┬────────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
┌─────────────▼──────────┐  ┌────────▼────────┐
│       Supabase         │  │     Resend      │
│  PostgreSQL + Auth     │  │  Email service  │
│  RLS + Triggers        │  │                 │
└────────────────────────┘  └─────────────────┘
```

---

## 3. Next.js App Router Structure

```
app/
├── layout.tsx                           # Root shell — html/body/fonts/globals.css only
├── globals.css                          # Tailwind v4 + CSS variables
│
├── (marketing)/                         # Marketing site — public, no app Navbar
│   ├── layout.tsx                       # Marketing layout: Sora font + MktNavbar + Footer + ambients
│   ├── page.tsx                         # / — Landing page
│   ├── vision/page.tsx                  # /vision
│   ├── docs/[[...slug]]/page.tsx        # /docs — /docs/[article-slug]
│   └── contact/page.tsx                 # /contact (Client Component)
│
├── (app)/                               # App — authenticated experience
│   ├── layout.tsx                       # App layout: wraps with Navbar
│   ├── feed/page.tsx                    # /feed — Project feed (Server Component)
│   ├── login/page.tsx                   # /login — Sign in (Client Component)
│   ├── signup/page.tsx                  # /signup — Sign up (Client Component)
│   ├── post/page.tsx                    # /post — Post project (Client)
│   ├── profile/
│   │   ├── page.tsx                     # /profile — Own profile (Server)
│   │   └── [id]/page.tsx               # /profile/[id] — Public profile (Server)
│   ├── connections/page.tsx             # /connections — Requests (Server)
│   ├── projects/[id]/page.tsx          # /projects/:id — Detail (Server)
│   ├── notifications/page.tsx           # /notifications
│   └── hivecheck/page.tsx              # /hivecheck — Peer review
│
├── auth/callback/route.ts               # Supabase auth callback (no layout needed)
└── api/
    ├── contact/route.ts                 # POST — contact form → Resend
    └── notify/
        ├── interest/route.ts            # POST — email on new interest
        └── accepted/route.ts            # POST — email on request accepted
```

---

## 4. Marketing Site vs App Site

The codebase serves two distinct surfaces under one Next.js app, separated by **route groups**:

| Surface | Route group | Layout | Navbar | Auth required |
|---|---|---|---|---|
| Marketing site | `(marketing)` | Sora + MktNavbar + Footer | Auth-aware: Sign in/Sign up when logged out; Projects + avatar when logged in | No |
| App | `(app)` | Inter + App Navbar | App nav (Projects/HiveCheck/Connections) | Some pages |

### Why route groups?

Route groups (`(folder)` syntax) allow different layouts for different sections without affecting URLs. `(marketing)` and `(app)` are invisible in URLs — `/feed`, `/vision`, `/docs` all work as expected.

The root `app/layout.tsx` is a minimal shell (html/body/fonts only). Each group adds its own chrome.

### Key URL changes (v0.6.0)

| Before | After | Reason |
|---|---|---|
| `/` | `/feed` | `/` is now the marketing landing page |
| n/a | `/vision` | New marketing page |
| n/a | `/docs/[slug]` | New docs with real routes |
| n/a | `/contact` | New contact form |

---

## 5. Server vs Client Components

```
Default → Server Component
Exception → Client Component (only when needed)
```

### Server Components — used for:
- Fetching data from Supabase (feed, profiles, project detail)
- Static marketing pages (`/`, `/vision`, `/docs/[slug]`)
- Pages that need SEO

### Client Components — used for:
- Forms and user input (`'use client'`)
- `useState`, `useEffect`, `useRouter`
- Framer Motion animations
- Supabase real-time subscriptions
- Contact form (`/contact`)
- Marketing Navbar (hamburger menu state)
- `ScrollReveal` (IntersectionObserver)

### The pattern: Server fetches, Client displays

```
app/(app)/feed/page.tsx (Server)
    │ fetches projects from Supabase
    ▼
components/Feed.tsx (Client)
    │ manages filters, search, currentUserId
    ▼
components/ProjectCard.tsx (Client)
    │ handles interest button, modal
    ▼
components/InterestModal.tsx (Client)
    │ personalized message + contact pre-fill
```

---

## 6. Supabase Integration

Three separate Supabase clients:

| Client | File | Used for |
|---|---|---|
| Server | `lib/supabase.ts` | Server Components, data fetching |
| Browser | `lib/supabase-browser.ts` | Client Components, auth state |
| Admin | `lib/supabase-admin.ts` | API routes only (service_role key) |

The admin client uses the `service_role` key — **never exposed to the browser**. It is only used in API routes to access `auth.admin.getUserById()`.

---

## 7. Authentication Flow

Sign-in and sign-up are separate pages (`/login` and `/signup`) backed by the same Supabase Auth UI component, pre-set to the relevant view.

```
Sign Up (/signup):
User fills form → Supabase sends confirmation email
→ User clicks link → /auth/callback exchanges code for session
→ Trigger creates profile in profiles table
→ Redirect to /

Sign In (/login):
User fills form → Supabase validates → session stored in cookies
→ Redirect to /feed
```

Sessions are stored in **HTTP-only cookies** managed by Supabase. The proxy refreshes the session token on every request.

---

## 8. Route Protection

`proxy.ts` intercepts every request:

```
Request arrives
    │
    ├── Protected route? (/post, /profile, /connections, /notifications)
    │       ├── Not authenticated → redirect to /login
    │       └── Authenticated → allow
    │
    └── /login or /signup + authenticated → redirect to /feed
```

Marketing pages (`/`, `/vision`, `/docs`, `/contact`) are **public** and require no authentication.

---

## 9. Email & Contact API

### Existing notification routes

| Route | Trigger | Recipient |
|---|---|---|
| `POST /api/notify/interest` | New connection request | Project owner |
| `POST /api/notify/accepted` | Connection accepted | Request sender |

These are fire-and-forget — clients call them with `.catch(console.error)` so a failed email never blocks the user action.

### Contact form route (added v0.6.0)

```
Contact form (/contact)
    │ POST /api/contact
    ▼
api/contact/route.ts
    │ validates required fields (name, email, message)
    │ builds HTML email with subject label + optional role
    ▼
Resend → rd.mouhouadi@gmail.com
    │ replyTo set to submitter's email
```

**Environment variable required:** `RESEND_API_KEY`

---

## 10. Data Flow

### Reading (Server Component)
```
Browser requests page
→ Next.js runs Server Component
→ createClient() → SQL query
→ Supabase checks RLS
→ Data returned → HTML rendered server-side
→ Browser receives complete HTML (no loading spinner)
```

### Writing (Client Component)
```
User clicks button
→ Client handler runs
→ createBrowserSupabaseClient() → insert/update
→ Supabase checks RLS
→ UI updated optimistically (no page reload)
```

### Email notification
```
Client writes to DB
→ fetch('/api/notify/...') — non-blocking
→ API route reads data with supabaseAdmin
→ Resend sends email
→ Response ignored by client
```

---

## 11. Component Design Patterns

### Pattern 1 — Server Page + Client Component
All main app pages fetch server-side and pass data to a client component.

### Pattern 2 — Optimistic Updates
UI updates immediately before the database confirms. Used in milestones, project updates, and connections.

### Pattern 3 — Centralized Design Tokens
All colors, spacing, typography, radii, and shadows defined once in `lib/design-tokens.ts`. No hardcoded hex values in component files.

### Pattern 4 — Non-blocking side effects
Email notifications use `.catch(console.error)` to never block user actions.

### Pattern 5 — Modal outside Link
`InterestModal` is rendered outside the `<Link>` wrapper in `ProjectCard` to prevent click propagation causing navigation.

### Pattern 6 — Route group layouts
Marketing and app surfaces share one Next.js app but have separate root-level layouts via route groups. No conditional rendering needed in the root layout.

### Pattern 7 — Auth-aware client islands in Server Component pages
When a server-rendered page needs to react to auth state (e.g. swapping a CTA label), a small `'use client'` component handles it. The rest of the page stays a Server Component. `getSession()` is called once on mount; the component defaults to the logged-out state to avoid layout shift. See `PrimaryCtaButton` and `MktNavbar`.

---

## 12. Design Tokens

All design values live in `lib/design-tokens.ts` — the single source of truth for both the app and the marketing site.

### App tokens (existing)
| Export | Contents |
|---|---|
| `colors` | bg (base/surface/elevated/hover), border, text, accent (teal+indigo), status |
| `radius` | sm (4px) → full (9999px) — app UI radii |
| `fontSize` | xs (10px) → xxl (22px) — app UI text sizes |
| `styles` | Pre-built style objects: card, tag, btnPrimary, btnTeal, btnIndigo, btnGhost, avatar |

### Marketing tokens (added v0.6.0)
| Export | Contents |
|---|---|
| `colors.bg.mkt*` | `mkt` `mkt2` `mktSurface` `surface2` `surface3` — slightly warmer near-blacks |
| `colors.text.soft/dim` | `soft` (#c2cbd5) and `dim` (#5c6773) — two extra text levels |
| `colors.accent.bright/base/ink` | Primary teal (#14b8a6), deep (#0d9488), text-on-teal (#04201d) |
| `colors.border.accent` | Teal callout border rgba(45,212,191,0.28) |
| `radiusMkt` | xs (6px) → xl (22px) — larger, rounder marketing radii |
| `fontSizeMkt` | eyebrow → hero — named marketing type sizes including clamp() values |
| `fontFamily` | head (Sora), body (Inter), mono (Geist Mono / JetBrains Mono) |
| `shadows` | card, heroShot, btnPrimary, btnPrimaryHover, logoMark |
| `layout` | maxWidth (1200px), wrapPadding (32px/20px), sectionPad, navHeight (64px) |
| `breakpoints` | md (980px), nav (880px), sm (560px) |

**Rule:** Component files never contain literal hex codes, px values, or font names. All values come from these tokens.

---

## 13. Deployment

### Pipeline
```
Push to main → Vercel detects → Next.js build → Deploy to edge
```

### Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + `.env.local` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + `.env.local` | Supabase public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel + `.env.local` | Admin operations (server only) |
| `NEXT_PUBLIC_SITE_URL` | Vercel + `.env.local` | Base URL for auth redirects |
| `RESEND_API_KEY` | Vercel + `.env.local` | Email service (server only) |

### Two database environments
- **Development** — separate Supabase project, `.env.local` points to dev DB
- **Production** — Vercel environment variables point to prod DB

---

*Last updated: BuilderLab v0.6.0-dev — 2026-06-08*
