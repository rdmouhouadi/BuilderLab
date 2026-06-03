# Changelog

All notable changes to BuilderLab are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) conventions.
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased] — V0.6.0

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