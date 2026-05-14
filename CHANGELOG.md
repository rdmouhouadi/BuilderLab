# Changelog

All notable changes to BuilderLab are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) conventions.
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased] — V0.2.0

### Planned
- 1:1 conversation tied to connection requests (Supabase Realtime)
- Auto-membership when a connection request is accepted
- Project updates — build-in-public feed inside each project
- Activity signals on project cards ("last active X hours ago", "N members joined")

---

## [0.1.1] — 2026-05-14

### Fixed
- **Login redirect** — After signing in, the app now redirects to the feed automatically without requiring a manual page refresh. Fixed by listening to `onAuthStateChange` in the login page and using `window.location.href` for a clean redirect.
- **Skills overflow on project cards** — When a project requires more than 2 skills, only the first 2 are now displayed with a `+N more` badge. Prevents cards from becoming cluttered and preserves space for the project description.
- **Project description overflow** — Long project descriptions no longer break out of their container on the project detail page. Fixed with `break-words` and `overflow-hidden`.
- **Duration filter not applied** — The `matchDuration` filter was calculated but never used in the `useMemo` return condition. The feed now correctly filters by duration.
- **`SKILLS_OPTIONS` unused** — The dropdown was using `SKILLS` instead of `SKILL_OPTIONS`, causing "All Skills" to be missing from the list. Fixed by using the correct constant.

### Improved
- **Singular/plural on hero banner** — "1 available projects" now correctly reads "1 available project".
- **"New" vs timestamp on project cards** — Projects less than 24 hours old display "New". Older projects display a relative timestamp (`2d ago`, `1w ago`, `3mo ago`, etc.) via a shared `getTimeLabel` utility in `lib/timeLabel.ts`.
- **Dev / Production database separation** — A dedicated Supabase project for development is now in place. `.env.local` points to the dev database and Vercel uses the production database. This prevents test data from polluting production.
- **Mobile responsive filters** — The search bar and filter dropdowns in the feed now display correctly on mobile screens. Filters use a 2-column grid on mobile and a 3-column grid on desktop. The Duration filter spans full width on mobile.
- **Hero banner mobile overflow** — The hero banner no longer overflows horizontally on small screens. Fixed with `overflow: hidden` and responsive font sizing (`text-2xl md:text-3xl`).
- **Edit project (inline)** — Project owners can now edit their project title, description, level, domain, duration, spots, and required skills directly from the project detail page without leaving the page.
- **Delete project** — Project owners can now delete their project from the project detail page. A confirmation dialog prevents accidental deletion. All associated data (skills, connections, milestones, members) is removed automatically via `ON DELETE CASCADE`.
- **Error messages humanized** — Database constraint errors (e.g. `projects_level_check`) are no longer shown raw to users. Human-readable messages are displayed instead.
- **Level constraint updated** — The `projects_level_check` constraint now accepts both English (`beginner`, `intermediate`, `advanced`) and French (`débutant`, `intermédiaire`, `avancé`) values for backward compatibility.

---

## [0.1.0] — 2026-05-01

### Added

#### Core Infrastructure
- Next.js 14 App Router project setup with TypeScript and Tailwind CSS
- Supabase integration with two separate clients: server (`lib/supabase.ts`) and browser (`lib/supabase-browser.ts`)
- Route protection via `proxy.ts` — unauthenticated users are redirected to `/login` when accessing protected routes (`/post`, `/profile`, `/connections`)
- Centralized constants in `lib/constants.ts` — skills, domains, levels, durations, contact types, and color mappings
- Shared TypeScript types in `types/index.ts` — `Project`, `Profile`, `ProjectSkill`, `Milestone`, `Connection`
- Smooth page transitions with Framer Motion (`components/PageTransition.tsx`)

#### Authentication
- Email and password sign up and sign in via Supabase Auth
- Auth callback route at `/auth/callback` to exchange code for session
- Automatic profile creation in `profiles` table on signup via PostgreSQL trigger (`handle_new_user`)
- Sign out with session cleanup

#### Navigation
- Sticky navbar with BuilderLab logo, navigation links, and user actions
- Animated sliding capsule between Projects and Connections tabs using Framer Motion `layoutId`
- Responsive hamburger menu for mobile
- Conditional rendering based on auth state — unauthenticated users see "Sign in", authenticated users see avatar, "+ Post a project", and "Sign out"

#### Project Feed
- Server-side data fetching with Supabase joins (profiles, project_skills)
- Real-time client-side filtering by skill, level, and duration without refetching
- Full-text search across project title and description
- Hero banner showing total available projects
- Project count display ("Showing N projects") with Most Recent sort indicator
- Empty state when no projects match filters

#### Project Cards
- Display: author avatar with initials, name, country, rating, project title, description (truncated to 3 lines), skill tags, level badge, duration, spots, and "I'm interested" button
- Cards have equal height in the grid regardless of content length
- "Your project" badge shown to the project owner instead of the interest button
- Hover effect on card border

#### Project Detail Page
- Full project description without truncation
- Domain and status badges
- Skills and level tags
- Project milestones with progress bar, check/uncheck, add, and delete
- Team member list with preferred contact links
- Owner card with contact link
- Project details panel (duration, spots, posted date)
- "I'm interested" button with states: idle, loading, sent, error
- "You're on this team" badge for existing members
- "Mark as completed" button for project owner
- Mandatory rating modal triggered when project is marked completed

#### Post a Project
- Form with title, problem description, domain, level, duration, spots, and required skills
- Multi-select skill picker
- Validation with human-readable error messages
- Redirects to feed on success

#### User Profile
- Display and edit: first name, last name, country, bio, school, major, preferred contact
- Avatar with initials
- Stats: average rating and number of projects posted
- List of posted projects with links to detail pages
- "Post your first project" CTA when no projects exist

#### Connection System
- "I'm interested" button sends a connection request to the project owner
- Connections page with two tabs: Received and Sent
- Accept and Decline actions for received requests
- Status badges: pending, accepted, rejected
- RLS policies ensure only relevant parties can see and act on requests

#### Rating System
- Rating modal displayed to all project members when a project is marked completed
- 1 to 5 star rating per collaborator with optional comment
- Rating submission is mandatory before the banner is dismissed
- `avg_rating` and `ratings_count` on profiles are updated automatically via PostgreSQL trigger (`update_avg_rating`)
- Users cannot rate themselves
- Duplicate ratings blocked by unique constraint

#### Database
- 8 tables: `profiles`, `user_skills`, `projects`, `project_skills`, `connections`, `project_members`, `ratings`, `milestones`
- Row Level Security enabled on all tables with granular policies
- `ON DELETE CASCADE` on all foreign keys for automatic cleanup
- 2 PostgreSQL functions and 3 triggers

#### Documentation
- `README.md` — project overview, vision, architecture summary, current status, roadmap, quickstart, project structure, contributing guide, license
- `docs/ARCHITECTURE.md` — detailed technical architecture, data flow, component patterns, deployment pipeline
- `docs/DATABASE.md` — full schema documentation, RLS policies, triggers and functions, design decisions

#### Deployment
- Deployed on Vercel with automatic CI/CD from GitHub main branch
- Separate Supabase projects for development and production environments
- Environment variables managed via `.env.local` (dev) and Vercel dashboard (prod)

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