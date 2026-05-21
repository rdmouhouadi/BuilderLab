# BuilderLab — Architecture Documentation

> This document describes the global architecture of BuilderLab — technical decisions, folder structure, data flow, and component design patterns.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Next.js App Router Structure](#3-nextjs-app-router-structure)
4. [Server vs Client Components](#4-server-vs-client-components)
5. [Supabase Integration](#5-supabase-integration)
6. [Authentication Flow](#6-authentication-flow)
7. [Route Protection](#7-route-protection)
8. [Email Notifications](#8-email-notifications)
9. [Data Flow](#9-data-flow)
10. [Component Design Patterns](#10-component-design-patterns)
11. [Constants & Theming](#11-constants--theming)
12. [Deployment](#12-deployment)

---

## 1. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | Server Components, file-based routing, edge-ready |
| Language | TypeScript | Type safety, catches bugs early |
| Styling | Tailwind CSS + inline styles | Utility-first, no CSS files to maintain |
| Animations | Framer Motion | Page transitions and navbar capsule |
| Database | Supabase (PostgreSQL) | Realtime, Auth, RLS — all in one |
| Auth | Supabase Auth (JWT) | Email/password, cookie-based sessions |
| Email | Resend | Simple transactional emails, Next.js-friendly |
| Deployment | Vercel | Zero-config Next.js deployment |

---

## 2. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         Browser                              │
│   React Client Components (forms, modals, filters, chat)    │
└─────────────────────────┬────────────────────────────────────┘
                          │ HTTP / RSC Payload
┌─────────────────────────▼────────────────────────────────────┐
│                      Vercel Edge                             │
│   Next.js App Router                                         │
│   ├── Server Components  → fetch data, render HTML           │
│   ├── API Routes         → email notifications               │
│   └── Proxy             → route protection                   │
└─────────────────────────┬────────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
┌─────────────▼──────────┐  ┌────────▼────────┐
│       Supabase          │  │     Resend      │
│  PostgreSQL + Auth      │  │  Email service  │
│  RLS + Triggers         │  │                 │
└─────────────────────────┘  └─────────────────┘
```

---

## 3. Next.js App Router Structure

```
app/
├── layout.tsx                          # Root layout — Navbar, global styles
├── page.tsx                            # / — Project feed (Server Component)
├── login/page.tsx                      # /login — Auth (Client Component)
├── post/page.tsx                       # /post — Post project (Client)
├── profile/
│   ├── page.tsx                        # /profile — Own profile (Server)
│   └── [id]/page.tsx                  # /profile/[id] — Public profile (Server)
├── connections/page.tsx                # /connections — Requests (Server)
├── projects/[id]/page.tsx             # /projects/:id — Detail (Server)
├── auth/callback/route.ts              # Supabase auth callback
└── api/
    └── notify/
        ├── interest/route.ts           # POST — email on new interest
        └── accepted/route.ts           # POST — email on request accepted
```

---

## 4. Server vs Client Components

```
Default → Server Component
Exception → Client Component (only when needed)
```

### Server Components — used for:
- Fetching data from Supabase
- Pages that need SEO
- No browser APIs needed

### Client Components — used for:
- Forms and user input (`'use client'`)
- useState, useEffect, useRouter
- Framer Motion animations
- Supabase real-time subscriptions (V0.3.0)

### The pattern: Server fetches, Client displays

```
app/page.tsx (Server)
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

## 5. Supabase Integration

Three separate Supabase clients:

| Client | File | Used for |
|---|---|---|
| Server | `lib/supabase.ts` | Server Components, data fetching |
| Browser | `lib/supabase-browser.ts` | Client Components, auth state |
| Admin | `lib/supabase-admin.ts` | API routes only (service_role key) |

The admin client uses the `service_role` key — **never exposed to the browser**.
It is only used in API routes to access `auth.admin.getUserById()`.

---

## 6. Authentication Flow

```
Sign Up:
User fills form → Supabase sends confirmation email
→ User clicks link → /auth/callback exchanges code for session
→ Trigger creates profile in profiles table
→ Redirect to feed

Sign In:
User fills form → Supabase validates → session stored in cookies
→ Redirect to feed
```

Sessions are stored in **HTTP-only cookies** managed by Supabase.
The proxy refreshes the session token on every request.

---

## 7. Route Protection

`proxy.ts` intercepts every request:

```
Request arrives
    │
    ├── Protected route? (/post, /profile, /connections)
    │       ├── Not authenticated → redirect to /login
    │       └── Authenticated → allow
    │
    └── /login + authenticated → redirect to /
```

---

## 8. Email Notifications *(added in V0.2.0)*

Two API routes handle email notifications via Resend:

### POST /api/notify/interest
Called after a connection request is inserted.
Sends an email to the project owner with the sender's message.

```
ProjectCard → insert connection → fetch /api/notify/interest
    → supabaseAdmin.auth.admin.getUserById(owner_id)
    → resend.emails.send() to owner
```

### POST /api/notify/accepted
Called after a connection is updated to `accepted`.
Sends an email to the sender.

```
ConnectionsClient → update connection → fetch /api/notify/accepted
    → supabaseAdmin.auth.admin.getUserById(sender_id)
    → resend.emails.send() to sender
```

**Important:** Email calls use `fetch(...).catch(console.error)` — they never block the UI. If an email fails, the user action still succeeds.

**Environment variables required:**
- `RESEND_API_KEY` — server-side only, no `NEXT_PUBLIC_` prefix
- `SUPABASE_SERVICE_ROLE_KEY` — server-side only, never expose to browser

---

## 9. Data Flow

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

## 10. Component Design Patterns

### Pattern 1 — Server Page + Client Component
All main pages fetch server-side and pass data to a client component.

### Pattern 2 — Optimistic Updates
UI updates immediately before the database confirms. Used in milestones, project updates, and connections.

### Pattern 3 — Centralized Constants
All skills, domains, colors, contact types defined once in `lib/constants.ts`.

### Pattern 4 — Non-blocking side effects
Email notifications and analytics calls use `.catch(console.error)` to never block user actions.

### Pattern 5 — Modal outside Link
`InterestModal` is rendered outside the `<Link>` wrapper in `ProjectCard` to prevent click propagation causing navigation.

---

## 11. Constants & Theming

### Color Palette

| Name | Hex | Usage |
|---|---|---|
| Background primary | `#0F1117` | Page background |
| Background secondary | `#161B28` | Cards, panels |
| Background tertiary | `#0C1120` | Inputs |
| Border | `#1E2840` | Card borders |
| Text primary | `#F1F5F9` | Headings |
| Text secondary | `#94A3B8` | Labels |
| Text muted | `#475569` | Metadata |
| Accent teal | `#0D9488` | Primary actions |
| Accent teal light | `#5EEAD4` | Active text |

---

## 12. Deployment

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

*Last updated: BuilderLab v0.2.0*