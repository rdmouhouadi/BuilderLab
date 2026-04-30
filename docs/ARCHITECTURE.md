# BuilderLab — Architecture Documentation

> This document describes the global architecture of BuilderLab — the technical decisions, folder structure, data flow, and component design patterns used throughout the application.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Next.js App Router Structure](#3-nextjs-app-router-structure)
4. [Server vs Client Components](#4-server-vs-client-components)
5. [Supabase Integration](#5-supabase-integration)
6. [Authentication Flow](#6-authentication-flow)
7. [Route Protection](#7-route-protection)
8. [Data Flow](#8-data-flow)
9. [Component Design Patterns](#9-component-design-patterns)
10. [Constants & Theming](#10-constants--theming)
11. [Deployment](#11-deployment)

---

## 1. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | Server Components, file-based routing, edge-ready |
| Language | TypeScript | Type safety, better DX, catches bugs early |
| Styling | Tailwind CSS + inline styles | Utility-first, no CSS files to maintain |
| Animations | Framer Motion | Smooth page transitions and navbar capsule |
| Database | Supabase (PostgreSQL) | Realtime, Auth, RLS — all in one |
| Auth | Supabase Auth (JWT) | Email/password, session management via cookies |
| Deployment | Vercel | Zero-config Next.js deployment, edge network |

---

## 2. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         Browser                              │
│                                                              │
│   React Client Components (interactivity, forms, modals)    │
└─────────────────────────┬────────────────────────────────────┘
                          │ HTTP / RSC Payload
┌─────────────────────────▼────────────────────────────────────┐
│                      Vercel Edge                             │
│                                                              │
│   Next.js App Router                                         │
│   ├── Server Components  → fetch data, render HTML           │
│   ├── API Routes         → auth callback                     │
│   └── Proxy (middleware) → route protection                  │
└─────────────────────────┬────────────────────────────────────┘
                          │ Supabase Client (@supabase/ssr)
┌─────────────────────────▼────────────────────────────────────┐
│                       Supabase                               │
│                                                              │
│   ┌──────────────┐   ┌────────────┐   ┌──────────────────┐  │
│   │  PostgreSQL  │   │    Auth    │   │  Row Level       │  │
│   │              │   │  (JWT +    │   │  Security        │  │
│   │  7 tables    │   │  cookies)  │   │  (per-table      │  │
│   │  3 triggers  │   │            │   │   policies)      │  │
│   └──────────────┘   └────────────┘   └──────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Next.js App Router Structure

BuilderLab uses the **Next.js 14 App Router** with file-based routing.

```
app/
├── layout.tsx                  # Root layout — wraps all pages
│                               # Contains: <Navbar />, global styles
│
├── page.tsx                    # / — Project feed (Server Component)
│
├── login/
│   └── page.tsx                # /login — Auth page (Client Component)
│
├── post/
│   └── page.tsx                # /post — Post a project (Client Component)
│                               # Protected by proxy.ts
│
├── profile/
│   └── page.tsx                # /profile — User profile (Server Component)
│                               # Protected by proxy.ts
│
├── connections/
│   └── page.tsx                # /connections — Connection requests
│                               # Protected by proxy.ts
│
├── projects/
│   └── [id]/
│       └── page.tsx            # /projects/:id — Project detail
│                               # Dynamic route — [id] = project UUID
│
└── auth/
    └── callback/
        └── route.ts            # /auth/callback — Supabase auth handler
                                # Exchanges code for session cookies
```

---

## 4. Server vs Client Components

This is the most important architectural decision in BuilderLab.

### The rule

```
Default → Server Component
Exception → Client Component (only when needed)
```

### When we use Server Components

- Fetching data from Supabase
- Pages that need SEO
- Any component that does not need browser APIs or interactivity

```tsx
// app/page.tsx — Server Component
// Data is fetched on the server before the page is sent to the browser
export default async function HomePage() {
  const supabase = await createClient()
  const { data: projects } = await supabase.from('projects').select('*')
  return <Feed projects={projects} />
}
```

### When we use Client Components

- Forms and user input
- useState, useEffect, useRouter
- Browser events (onClick, onChange)
- Framer Motion animations

```tsx
// components/Feed.tsx — Client Component
// Manages filter state and user interactions
'use client'
export default function Feed({ projects }) {
  const [search, setSearch] = useState('')
  // ...
}
```

### The pattern: Server fetches, Client displays

```
app/page.tsx (Server)
    │ fetches data from Supabase
    │ passes data as props
    ▼
components/Feed.tsx (Client)
    │ receives data as props
    │ manages filter state
    │ handles user interactions
    ▼
components/ProjectCard.tsx (Client)
    │ displays one project
    │ handles "I'm interested" click
```

This pattern means:
- Data is always fresh (fetched server-side on each request)
- Interactivity is handled client-side without extra network calls
- No loading spinners for initial data — it's in the HTML

---

## 5. Supabase Integration

BuilderLab uses **two separate Supabase clients** — one for the server, one for the browser. This is required by `@supabase/ssr`.

### Server Client — `lib/supabase.ts`

Used in Server Components and API routes. Reads and writes cookies to maintain the session.

```
Server Component / API Route
        │
        ▼
lib/supabase.ts (createServerClient)
        │
        ▼
Supabase PostgreSQL
```

### Browser Client — `lib/supabase-browser.ts`

Used in Client Components. Manages auth state changes in real time.

```
Client Component (form, button)
        │
        ▼
lib/supabase-browser.ts (createBrowserClient)
        │
        ▼
Supabase Auth / PostgreSQL
```

### Why two clients?

| | Server Client | Browser Client |
|---|---|---|
| Runs on | Server (Node.js) | Browser |
| Cookie access | Via `next/headers` | Via `document.cookie` |
| Used for | Data fetching, auth callback | Forms, auth state, mutations |
| File | `lib/supabase.ts` | `lib/supabase-browser.ts` |

---

## 6. Authentication Flow

BuilderLab uses **Supabase Auth with email/password** and cookie-based sessions.

### Sign Up Flow

```
1. User fills sign up form on /login
        │
        ▼
2. Supabase sends confirmation email
        │
        ▼
3. User clicks link in email
        │
        ▼
4. Supabase redirects to /auth/callback?code=xxx
        │
        ▼
5. app/auth/callback/route.ts exchanges code for session
        │
        ▼
6. Session stored in cookies
        │
        ▼
7. User redirected to / (feed)
        │
        ▼
8. Supabase trigger creates profile in profiles table
   automatically (handle_new_user function)
```

### Sign In Flow

```
1. User fills sign in form on /login
        │
        ▼
2. Supabase validates credentials
        │
        ▼
3. Session stored in cookies
        │
        ▼
4. User redirected to / (feed)
```

### Session Persistence

Sessions are stored in **HTTP-only cookies** managed by Supabase. The proxy refreshes the session token on every request to keep it alive.

---

## 7. Route Protection

Route protection is handled by **`proxy.ts`** (Next.js proxy, previously called middleware).

```
Every HTTP request
        │
        ▼
proxy.ts intercepts the request
        │
        ├── Is this a protected route? (/post, /profile, /connections)
        │       │
        │       ├── User is NOT authenticated → redirect to /login
        │       │
        │       └── User IS authenticated → allow request
        │
        └── Is this /login and user IS authenticated?
                │
                └── Redirect to / (no need to log in again)
```

**Protected routes:**
```ts
const protectedPaths = ['/post', '/profile', '/connections']
```

---

## 8. Data Flow

### Reading data (Server Component)

```
Browser requests /
        │
        ▼
Next.js runs app/page.tsx on the server
        │
        ▼
createClient() creates server Supabase client
        │
        ▼
supabase.from('projects').select('*') runs SQL query
        │
        ▼
Supabase checks RLS policies — is this user allowed?
        │
        ▼
Data returned to Server Component
        │
        ▼
HTML rendered on server with data already inside
        │
        ▼
Browser receives complete HTML — no loading spinner
```

### Writing data (Client Component)

```
User clicks "I'm interested"
        │
        ▼
handleInterest() runs in ProjectCard.tsx
        │
        ▼
createBrowserSupabaseClient() creates browser client
        │
        ▼
supabase.from('connections').insert({...})
        │
        ▼
Supabase checks RLS policies — is this user allowed?
        │
        ▼
Row inserted in database
        │
        ▼
Button state updated locally (optimistic UI)
        no page reload needed
```

---

## 9. Component Design Patterns

### Pattern 1 — Server Page + Client Component

Used for all main pages. The page fetches data server-side and passes it to a client component that handles interactivity.

```
app/page.tsx (Server)          → fetches projects
    └── components/Feed.tsx (Client)    → handles filters, search

app/profile/page.tsx (Server)  → fetches profile + projects
    └── components/ProfileClient.tsx (Client) → handles edit mode

app/connections/page.tsx (Server) → fetches connections
    └── components/ConnectionsClient.tsx (Client) → handles accept/reject
```

### Pattern 2 — Optimistic Updates

When a user performs an action (check milestone, delete item), the UI updates immediately without waiting for the database response. If the database call fails, the UI can be rolled back.

```tsx
// Toggle milestone — optimistic update
async function toggleMilestone(milestone) {
  // 1. Update UI immediately
  setMilestones(prev =>
    prev.map(m => m.id === milestone.id
      ? { ...m, completed: !m.completed }
      : m
    )
  )
  // 2. Then update the database
  await supabase.from('milestones').update(...).eq('id', milestone.id)
  // If step 2 fails, the UI is already updated
  // In a future version, we would rollback on error
}
```

### Pattern 3 — Centralized Constants

All skills, domains, colors, and contact types are defined once in `lib/constants.ts` and imported wherever needed. This ensures visual consistency and makes updates trivial.

```
lib/constants.ts
    │
    ├── imported by components/Feed.tsx (filter options)
    ├── imported by app/post/page.tsx (skill selector)
    ├── imported by components/ProjectCard.tsx (skill colors)
    ├── imported by components/ProjectDetailClient.tsx (skill colors)
    └── imported by components/ProfileClient.tsx (contact types)
```

---

## 10. Constants & Theming

BuilderLab uses a **dark theme** with a teal accent color. All colors are defined as inline styles using a consistent palette.

### Color Palette

| Name | Hex | Usage |
|---|---|---|
| Background primary | `#0F1117` | Page background |
| Background secondary | `#161B28` | Cards, panels |
| Background tertiary | `#0C1120` | Inputs, code blocks |
| Border primary | `#1E2840` | Card borders |
| Text primary | `#F1F5F9` | Headings, important text |
| Text secondary | `#94A3B8` | Labels, subtitles |
| Text muted | `#475569` | Placeholder, metadata |
| Accent teal | `#0D9488` | Primary actions, active states |
| Accent teal hover | `#0F766E` | Button hover |
| Accent teal light | `#5EEAD4` | Tags, active text |

### Skill Color Mapping

Each skill category has a unique color for visual identification:

| Skill Category | Background | Text |
|---|---|---|
| Software Engineer / Developer | teal | `#5EEAD4` |
| Data Scientist / Analyst / Engineer | indigo | `#A5B4FC` |
| UI/UX Designer | sky blue | `#7DD3FC` |
| Business Analyst / Product Manager | amber | `#FCD34D` |
| Marketing / SEO | pink | `#F9A8D4` |
| Cybersecurity Engineer | red | `#FCA5A5` |

---

## 11. Deployment

BuilderLab is deployed on **Vercel** with automatic CI/CD from GitHub.

### Deployment Pipeline

```
Developer pushes to main branch on GitHub
        │
        ▼
Vercel detects push → triggers build
        │
        ▼
Next.js build runs (npm run build)
        │
        ▼
Static assets generated → deployed to Vercel Edge Network
        │
        ▼
Production URL updated: builderlab.vercel.app
```

### Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + `.env.local` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + `.env.local` | Supabase public key |
| `NEXT_PUBLIC_SITE_URL` | Vercel + `.env.local` | Base URL for auth redirects |

### Important

- **Never commit `.env.local`** — it is in `.gitignore`
- The `NEXT_PUBLIC_` prefix makes variables accessible in the browser
- The Supabase `anon` key is safe to expose because **RLS protects all data**
- The Supabase `service_role` key must **never** be used on the frontend

---

*Last updated: BuilderLab v0.1.0*