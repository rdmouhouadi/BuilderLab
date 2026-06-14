# Changelog

All notable changes to BuilderLab are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) conventions.
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.6.0] — 2026-06-14

### Added — 2026-06-14

#### Contact message persistence (`app/api/contact/route.ts`)
- Contact form submissions are now saved to a new `contact_messages` table (in addition to the existing Resend email notification)
- New migration: `supabase/migrations/20260614000000_contact_messages.sql` — stores `name`, `email`, `subject`, `role`, `message`, `status` (`new`/`read`/`resolved`), `created_at`
- RLS enabled with no policies — only `supabaseAdmin` (service role) can read/write; entries are triaged via the Supabase Table Editor
- See [docs/DATABASE.md §3.15](DATABASE.md#315-contact_messages)

### Fixed — 2026-06-08

#### Docs search (`components/marketing/DocsSearchBox.tsx`)
- Search box was visual-only; now fully wired with client-side full-text search across all article titles, leads, and body content
- ⌘K / Ctrl+K focuses the input from anywhere on the page; Esc clears and closes
- Results show group label, article title, and a context snippet around the match
- `getSearchIndex()` and `DocSearchItem` type added to `lib/docs-content.ts` — strips HTML tags and exposes a flat, search-ready array

#### Auth pages split (`app/(app)/login/page.tsx`, `app/(app)/signup/page.tsx`)
- "Sign in" and "Sign up" buttons both previously routed to `/login`; now `Sign in → /login`, `Sign up → /signup`
- New `/signup` page pre-opens the Supabase Auth UI in `sign_up` view
- Middleware now redirects authenticated users away from `/signup` as well as `/login`

#### Contact email
- Form submissions now route to `rd.mouhouadi@gmail.com` (was `richiedieuveil@gmail.com`)

### Added — 2026-06-08

#### Auth-aware marketing navbar (`components/marketing/MktNavbar.tsx`)
- Detects Supabase session on mount via `getSession()`; subscribes to `onAuthStateChange` to stay in sync across tabs
- Logged-out state: "Sign in" (→ `/login`) + "Sign up" (→ `/signup`) buttons
- Logged-in state: "Projects" button (→ `/feed`) + circular avatar with user initials (→ `/profile`)
- Initials derived from `profiles.first_name` / `last_name`, falling back to `profiles.name`, then email prefix
- Both desktop and mobile hamburger menu adapt to auth state
- Navbar renders `null` until the session check completes to prevent button flash

#### Auth-aware landing page CTA (`components/marketing/PrimaryCtaButton.tsx`)
- New `'use client'` component replacing both static "Start building → /login" buttons on the landing page
- Shows "Start building → `/login`" for visitors, "Continue building → `/feed`" for logged-in users
- Defaults to the logged-out label on first render (avoids layout shift for the majority of visitors)
- Applied to both the hero CTA and the final CTA section

### Improved — 2026-06-08
- All French-language comments across 16 files translated to English
- All modified and core lib files now carry short beginner-friendly English comments

### Changed - 2026-06-06

#### Design system unification (`lib/design-tokens.ts`)
- **App backgrounds unified with marketing** — `bg.base/surface/elevated/hover` now use the same warm-dark palette as the marketing site (`#0a0d11 / #12181f / #161d27 / #1b232e`). The two halves of the product now share one visual foundation.
- **Accent section reorganized** — Teal tokens now have canonical marketing names (`base/deep/bright/ink/glowRgb`) alongside app aliases (`teal/tealText/tealDim/tealBorder`) with explicit cross-references. Indigo family expanded with `indigoDeep: '#4338CA'` and `indigoInk: '#1e1b4b'` to mirror teal's full three-level structure.
- **Font scale fixed** — `xs: 10px → 11px`, `sm: 11px → 12px` (below-11px text removed from the product). Logical ordering (`xs < sm < md < base < lg < xl < xxl`) now documented inline.

#### Navbar redesign (`components/Navbar.tsx`)
- **Height** — 44px → 64px (matches `layout.navHeight` and marketing navbar).
- **Background** — Opaque surface replaced by `rgba(10,13,17,0.80)` with `backdrop-filter: blur(14px) saturate(140%)`.
- **Layout** — Full-width → `maxWidth: 1200px` centered container with `32px` horizontal padding; logo/nav/actions use `space-between` with absolute-centered nav links.
- **Nav links** — Capsule wrapper (background + border + rounded container around all items) removed. Links are now flat, individual pill-shaped items (`radiusMkt.sm`, `fontSizeMkt.nav/14px`, `text.muted2` inactive → `text.base` active).
- **Buttons** — "Post project" uses the teal gradient + glow shadow matching the marketing primary CTA. "Log out" / "Sign in" use the marketing ghost style (border `mkt2`, `text.soft`).
- **Mobile menu** — Updated to match marketing hamburger menu style (warmer bg, flat link rows).

#### Connections page (`components/ConnectionsClient.tsx`)
- **Page width** — `maxWidth` 672px → 1152px (matches Feed and HiveCheck).
- **Font sizes** — Bumped throughout: page title `xxl/22px`, subtitle `base/14px`, tab labels and sender names `base/14px`, meta text `sm/12px`, action buttons `nav/14px`.
- **Cards** — `1px` borders using `border.mkt`, `radiusMkt.md` radii, `20px` padding, `38px` teal avatar.
- **Tabs** — Marketing-style segmented control (`radiusMkt.sm`, `1px` border, `text.base`/`text.muted2`).
- **Action buttons** — Larger padding (`7px 16px`), `radiusMkt.sm`, marketing ghost/semantic hover states.
- **Links** — Project name in "Interested in" and sent items are now clickable links to the project page.
- **Empty states** — Replaced bare text with emoji + headline + helper sub-text.

#### Profile page (`components/ProfileClient.tsx`)
- **Page width** — `maxWidth` 768px → 1152px (matches Feed and HiveCheck).

### Added - 2026-06-05

#### Hive Trio logo (`components/BuilderLabLogo.tsx`)
- **`BuilderLabMark`** — Reusable SVG icon component. Color variant: three-shade teal (gradient top cell `bright→deep`, mid BL, deep BR). Mono variant: `currentColor` at 1 / 0.8 / 0.6 opacity. Polygons shifted `translate(0,7)` to visually center the mark within its viewBox (hexagons occupy y=16–70 of 100; shift puts the visual center at y=50). `useId()` scopes each gradient ID so multiple logos on one page never collide.
- **`BuilderLabLogo`** — Horizontal lockup: mark + wordmark. Wordmark: Sora 700, `-0.03em` tracking, "Builder" in `text.base`, "Lab" in `accent.bright`. All colors routed through `design-tokens.ts` — no hardcoded hex values.

#### Favicon & browser icons
- **`public/favicon.svg`** — Hive Trio color mark available at `/favicon.svg`.
- **`app/icon.svg`** — Same SVG placed in `app/`; Next.js 13+ auto-serves it as the browser tab favicon, replacing the Vercel default.
- **`app/apple-icon.tsx`** — 180×180 PNG generated at request time via `ImageResponse` (Hive Trio mark as base64-encoded SVG `<img>`). Served at `/apple-touch-icon.png`.

#### Logo deployed site-wide
- **App navbar** — Hand-coded hexagon SVG placeholder replaced with `<BuilderLabLogo markSize={28} />`.
- **Marketing navbar** — `LogoMark` inline component removed; replaced with `<BuilderLabLogo markSize={28} />`.
- **Login page** — Green dot + plain text placeholder replaced with `<BuilderLabLogo markSize={32} />`; hardcoded background/border hex values replaced with design tokens.
- **Root layout** (`app/layout.tsx`) — Sora loaded globally via `next/font/google` (so the wordmark renders on app routes, not only marketing); both Inter and Sora exposed as `--font-inter` / `--font-sora` CSS variables on `<html>`; metadata description updated; `icons` config added.

### Added - 2026-06-03

#### Marketing Site (feat/landing-page)
- **Landing page `/`** — Full marketing home page: hero with two overlapping product screenshots (overlap layout), value strip, Problem/How it works/Ecosystem/Build in public sections, and a final CTA box.
- **Vision page `/vision`** — Mission statement, three-pillar section, build-in-public banner with principles, roadmap timeline, CTA.
- **Docs pages `/docs/[slug]`** — Real routes (not show/hide JS) with sticky sidebar (4 groups, 10 articles), prev/next navigation, breadcrumb, and scoped article typography.
- **Contact page `/contact`** — Client-side form with three subject chips (Suggestion / Bug report / Join the journey), conditional role `<select>` (shown on "Join the journey"), per-field required validation, and a subject-specific success state.
- **`/api/contact` route** — Resend API endpoint that emails `richiedieuveil@gmail.com` with the submitted form data.
- **Marketing Navbar** — Sticky blurred nav with logo, Vision/Docs/Contact links, Sign in / Sign up buttons. Hamburger menu below 880px.
- **Footer** — 4-column grid (brand + 3 link columns) with version badge. Collapses to 2 columns below 880px.
- **`ScrollReveal` component** — `IntersectionObserver`-based fade/translate-up animation gated behind `prefers-reduced-motion: no-preference`.
- **`Eyebrow` component** — Teal pill label with glowing dot.
- **`lib/docs-content.ts`** — Full docs content registry: `DOC_GROUPS`, `getArticle(slug)`, `getDefaultSlug()`, all 10 articles as HTML strings.
- **`lib/design-tokens.ts` extended** — Added `radiusMkt`, `fontSizeMkt`, `fontFamily`, `shadows`, `layout`, `breakpoints`, and new marketing-specific color values (`colors.bg.mkt*`, `colors.text.soft/dim`, `colors.accent.bright/base/ink/indigoBright`, `colors.border.accent`) without breaking existing app tokens.
- **`public/images/`** — Hero screenshots (`shot-projects.png`, `shot-login.png`) copied from design handoff.

#### Route Architecture Refactor
- **Route groups** — App now uses two route groups: `app/(marketing)/` (marketing layout) and `app/(app)/` (app layout with Navbar).
- **Root layout stripped** — `app/layout.tsx` is now a minimal shell (html/body/fonts/globals.css only, no Navbar).
- **Project feed moved** — `app/page.tsx` → `app/(app)/feed/page.tsx`; URL is now `/feed`.
- **All other app pages** moved into `app/(app)/` — URLs unchanged.
- **Proxy fix** — Authenticated `/login` users now redirect to `/feed` instead of `/`.

### Planned
- HiveCheck — structured peer review system
- Project submission for review (GitHub link, demo, description)
- Anonymous feedback from senior builders (3+ years experience)
- Public project leaderboard by domain and skill
- Reviewer reputation score

---

## [0.5.0] — 2026-05-27

### Added

#### HiveOS — Task Management
- **Task board** — Slide panel accessible from the project detail page for members and owner only. Tasks are organized by status: To Do, In Progress, Blocked, Done.
- **Task creation** — Owner and HiveOS manager can create tasks with title, description, assignee, milestone link, priority (none/low/medium/high), and due date.
- **Task status change** — Assignees can move their own tasks. Owner and manager can move any task.
- **Task deletion** — Owner and HiveOS manager can delete tasks.
- **Auto Build Log entry** — When a task moves to `blocked` or `done`, an entry is automatically inserted into the Build Log. Blocked tasks create a `blocker` entry. Done tasks create an `update` entry.
- **HiveOS Manager role** — Owner can assign the manager role to one team member at a time. Manager has full task management rights. Owner can revoke the role at any time and remain the sole manager.
- **`tasks` table** — New table with RLS enabled. Fields: `project_id`, `milestone_id`, `assignee_id`, `created_by`, `title`, `description`, `status`, `priority`, `due_date`, `position`.
- **HiveOS columns on `project_members`** — `is_hiveos_manager`, `leave_reason`, `left_at`.

#### Leave / Remove Member
- **Leave project** — Any active member can leave a project voluntarily. A mandatory reason (10–300 characters) is required before confirming. The member is redirected to the feed after leaving.
- **Remove member** — Owner can remove any member from the project. A mandatory reason is required. The reason is visible to the removed member on the project page.
- **`LeaveProjectModal`** — New modal component handling both leave and remove flows with validation, warning message, and character counter.
- **Removed member notice** — A removed member who visits the project page sees a notice with the reason provided by the owner.

### Changed
- **`/archive` renamed to `/hivecheck`** — The archive of completed projects is now the HiveCheck leaderboard. `ArchiveClient` renamed to `HiveCheckClient`. `sessionStorage` key updated accordingly.
- **Navbar** — Archive tab replaced by HiveCheck tab with indigo beta badge.

---

## [0.4.1] — 2026-05-25

### Added
- **Design system** — `lib/design-tokens.ts` — single source of truth for all colors, spacing, and style objects. No more hardcoded hex values in components.
- **Builder type system** — Profiles now have a `builder_type` field (`student`, `bootcamp`, `self_learner`, `professional`). Institution and program labels adapt dynamically based on the selected type.
- **`website_url` and `github_url` on projects** — Owners can add a demo link and a GitHub repository link when posting or editing a project. Displayed in the Details sidebar.
- **Smart BackButton** — `BackButton` component uses `sessionStorage` to remember the previous page (feed, profile, HiveCheck, archive) and displays a contextual label.

### Changed
- **Full design system refactor** — All components migrated to the new Linear-style design: monochrome tags, 2 accent colors (teal + indigo), border-color-only hover effects, no glow blobs.
- **All comments translated to English** — Codebase now fully in English for better collaboration.
- **Component modularization** — All major components refactored to stay under 150 lines. Sub-components extracted: `NavLogo`, `NavCapsule`, `NavNotifications`, `NavMobileMenu`, `CardAuthor`, `CardTags`, `CardFooter`, `FeedFilters`, `ProjectRow`, `ProjectSection`, `ProfileEditForm`, `ProjectHeader`, `TaskForm`, `TaskCard`.
- **`profiles` table** — Added `builder_type`, `institution`, `program` columns. `school` and `major` kept for backward compatibility.
- **`projects` table** — Added `website_url`, `github_url` columns.

### Security
- **RLS audit** — Removed duplicate policies on `connections`, `project_skills`, `ratings`, `projects`. Fixed `notifications` INSERT policy. Strengthened `project_members` UPDATE policy. Explicit auth check on `project_comments` INSERT.

---

## [0.4.0] — 2026-05-24

### Added

#### Follow System
- **Follow button on project cards** — Any builder can follow a project directly from the feed. Optimistic update.
- **Follow button on project detail page** — Visible in the sidebar for non-members and non-owners. Shows follower count.
- **"Projects I follow" section in profile** — Third section added to the profile page.
- **Follower count on project detail** — Displayed in the Details card.

#### Privacy Settings
- **Per-section privacy toggles** — Project owners can control visibility of Build Log, Team Chat, Milestones, and Team members independently.
- **Members + followers access** — Private sections are visible to project members and followers only.
- **Privacy panel in sidebar** — Owner-only panel with Public/Private toggles.
- **New columns on `projects` table** — `show_build_log`, `show_chat`, `show_milestones`, `show_team` (all default `true`).

#### Project Archive
- **`/archive` page** — Public page listing all completed and public projects. Searchable.
- **`is_public` column on `projects`** — Boolean flag (`true` by default).

#### Completion Modal
- **Celebratory completion modal** — Replaces the direct "Mark as completed" action. Public by default with opt-out checkbox.

#### Community Feedback
- **`project_comments` table** — New table for lightweight community feedback. RLS enabled.
- **Community Feedback section** — Any authenticated builder can post a comment. 500 character limit.

### Fixed
- **Chat auto-scroll on polling** — Fixed by tracking message count with `useRef`.

---

## [0.3.0] — 2026-05-22

### Added

#### Conversation Layer
- **Group chat with polling** — Team chat fetched every 5 seconds. Members and owner can send messages.
- **Connection message in team section** — Shown under the member's name after acceptance.
- **`project_messages` table** — RLS enabled.

#### In-App Notifications
- **Notification bell in navbar** — Dropdown with 5 most recent notifications. Marks all as read on open.
- **`/notifications` page** — Full notifications history.
- **`notifications` table** — RLS enabled. Types: `connection_request`, `connection_accepted`.
- **Notification creation in API routes** — Both `/api/notify/interest` and `/api/notify/accepted` create in-app notifications.

---

## [0.2.0] — 2026-05-20

### Added

#### Execution Layer
- **Auto-membership on accept** — PostgreSQL trigger adds sender to `project_members` on connection accept.
- **Project Updates — Build Log** — Members and owners can post typed updates (update, milestone, blocker, decision, demo).
- **Activity signals on project cards** — Pulsing dot with relative timestamp based on latest update.

#### Discovery & Navigation
- **Feed filters** — Owned and joined projects excluded from feed.
- **"Projects I joined" in profile** — Second section on profile page.
- **Public profile pages** — `/profile/[id]` for every builder.
- **Clickable names** — Links to public profiles throughout the app.

#### Connection Flow
- **Personalized interest message** — Modal with pre-filled contact info.
- **Pending filter in Connections** — Only pending requests shown in Received tab.
- **Connection badge on navbar** — Red badge with pending count.

#### Notifications
- **Email notification on interest** — Sent to project owner.
- **Email notification on accept** — Sent to connection sender.

#### Profile & Identity
- **Real navbar initials** — First + last name initials.
- **BackButton component** — `router.back()` with configurable fallback.

### Fixed
- Skills overflow, spots on mobile, member count visibility, duration filter, level constraint, hero banner plural.

---

## [0.1.1] — 2026-05-14

### Fixed
- Login redirect, skills overflow, description overflow, duration filter, missing "All Skills" option.

### Improved
- Dev/prod database separation, inline project edit, project delete, humanized error messages.

---

## [0.1.0] — 2026-05-01

### Added
- Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase, Framer Motion
- Authentication (sign up, sign in, sign out, auto profile creation)
- Project feed with search and filters
- Project cards, project detail page, post a project form
- User profile (display + edit)
- Connection system (send, accept, decline)
- Mandatory rating system at project completion
- Milestones with progress bar
- 8 tables, RLS on all, 3 triggers

---

## Legend

| Symbol | Meaning |
|---|---|
| **Added** | New feature or file |
| **Fixed** | Bug fix |
| **Improved** | Enhancement to existing feature |
| **Changed** | Breaking or significant behavioral change |
| **Removed** | Feature or file removed |
| **Security** | Security-related fix |