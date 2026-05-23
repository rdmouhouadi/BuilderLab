# Changelog

All notable changes to BuilderLab are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) conventions.
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased] — V0.3.0

### Planned
- 1:1 conversation tied to connection requests (Supabase Realtime)
- Group chat inside project workspace
- Message visible on project detail page (from connection request)
- Public activity feed (build-in-public global)

---

## [0.2.0] — 2026-05-20

### Added

#### Execution Layer
- **Auto-membership on accept** — When a connection request is accepted, the sender is automatically added to `project_members` via a PostgreSQL trigger (`handle_connection_accepted`). No manual action required from the project owner.
- **Project Updates — Build Log** — Members and owners can post text updates inside each project (progress, blockers, decisions, milestones, demos). Updates are displayed in a chronological feed on the project detail page. Only members and the owner can post. Authors can delete their own updates.
- **Activity signals on project cards** — Cards now display a pulsing green dot with a relative timestamp ("Active today", "Active 3d ago") based on the latest project update. Member count is always displayed to keep cards aligned.

#### Discovery & Navigation
- **Feed filters owned and joined projects** — The project feed no longer shows projects the user owns or has already joined. These are accessible from the profile page instead.
- **"Projects I joined" section in profile** — The profile page now has two sections: "Posted projects" (owned) and "Projects I joined" (member). Each project links to its detail page.
- **Public profile pages** — Every builder now has a public profile at `/profile/[id]` showing their name, bio, school, major, contact, rating, and posted projects.
- **Clickable names** — Builder names in the Connections page, Project Detail (Posted by, Team members) are now clickable and link to their public profile page.

#### Connection Flow
- **Personalized interest message** — Clicking "I'm interested" now opens a modal where the user can write a personalized message before sending the request. The message is pre-filled with the user's preferred contact if set in their profile. A hint is shown if no contact is set.
- **Pending filter in Connections** — The "Received" tab now only shows pending requests. Accepted and rejected requests are removed from the list after action.
- **Connection badge on navbar** — A red pulsing badge on the "Connections" tab shows the number of pending requests in real time.

#### Notifications
- **Email notification on interest** — The project owner receives an email when someone expresses interest, including the sender's message and a link to the project.
- **Email notification on accept** — The sender receives an email when their request is accepted, with a link to the project.

#### Profile & Identity
- **Real navbar initials** — The avatar in the navbar now shows the user's real initials (first + last name) fetched from their profile, not just the first letter of their email.
- **BackButton component** — A reusable `BackButton` component with `router.back()` and a configurable fallback URL, used across project detail and public profile pages.

### Fixed
- **Skills overflow on project cards** — Only the first 2 skills are shown with a `+N more` badge when a project requires more than 2 skills.
- **Spots hidden on small screens** — The spots count is hidden on mobile (`hidden lg:flex`) to prevent the button from wrapping.
- **Member count always visible** — The member count line is always rendered (even at 0) to keep all cards at the same height.
- **Duration filter not applied** — `matchDuration` was calculated but never used in the `useMemo` filter. Now correctly applied.
- **Level constraint updated** — The `projects_level_check` SQL constraint now accepts both English and French level values.
- **Singular/plural on hero banner** — "1 available projects" now correctly reads "1 available project".
- **"New" vs timestamp on cards** — Projects show "New" for the first 24 hours, then a relative timestamp (`1d ago`, `2w ago`, etc.) via `lib/timeLabel.ts`.
- **Mobile responsive filters** — Filters use a 2-column grid on mobile and 3 columns on desktop. Duration spans full width on mobile.
- **Hero banner mobile overflow** — Fixed with `overflow: hidden` and responsive font sizing.

---

## [0.1.1] — 2026-05-14

### Fixed
- **Login redirect** — After signing in, the app now redirects to the feed automatically without requiring a manual page refresh.
- **Skills overflow on project cards** — When a project requires more than 2 skills, only the first 2 are now displayed with a `+N more` badge.
- **Project description overflow** — Long project descriptions no longer break out of their container on the project detail page.
- **Duration filter not applied** — The `matchDuration` filter was calculated but never used in the `useMemo` return condition.
- **`SKILLS_OPTIONS` unused** — The dropdown was using `SKILLS` instead of `SKILL_OPTIONS`, causing "All Skills" to be missing from the list.

### Improved
- **Singular/plural on hero banner** — "1 available projects" now correctly reads "1 available project".
- **"New" vs timestamp on project cards** — Projects less than 24 hours old display "New". Older projects display a relative timestamp.
- **Dev / Production database separation** — A dedicated Supabase project for development is now in place.
- **Mobile responsive filters** — The search bar and filter dropdowns now display correctly on mobile screens.
- **Edit project (inline)** — Project owners can now edit their project directly from the project detail page.
- **Delete project** — Project owners can now delete their project from the project detail page.
- **Error messages humanized** — Database constraint errors are no longer shown raw to users.
- **Level constraint updated** — The `projects_level_check` constraint now accepts both English and French values.

---

## [0.1.0] — 2026-05-01

### Added

#### Core Infrastructure
- Next.js 14 App Router project setup with TypeScript and Tailwind CSS
- Supabase integration with server and browser clients
- Route protection via `proxy.ts`
- Centralized constants in `lib/constants.ts`
- Shared TypeScript types in `types/index.ts`
- Smooth page transitions with Framer Motion

#### Authentication
- Email and password sign up and sign in via Supabase Auth
- Auth callback route at `/auth/callback`
- Automatic profile creation on signup via PostgreSQL trigger
- Sign out with session cleanup

#### Navigation
- Sticky navbar with animated sliding capsule (Framer Motion `layoutId`)
- Responsive hamburger menu for mobile
- Conditional rendering based on auth state

#### Project Feed
- Server-side data fetching with Supabase joins
- Real-time client-side filtering by skill, level, and duration
- Full-text search across project title and description
- Hero banner showing total available projects

#### Project Cards
- Author avatar, name, country, rating, title, description, skill tags, level badge, duration, spots
- Equal height cards in the grid
- "Your project" badge for the owner

#### Project Detail Page
- Full project description, domain and status badges, skills and level tags
- Milestones with progress bar, check/uncheck, add, delete
- Team member list with preferred contact links
- "Mark as completed" button for owner
- Mandatory rating modal on project completion

#### Post a Project
- Form with title, problem, domain, level, duration, spots, required skills
- Validation with human-readable error messages

#### User Profile
- Display and edit: first name, last name, country, bio, school, major, preferred contact
- Stats: average rating and projects posted
- List of posted projects

#### Connection System
- "I'm interested" button sends a connection request
- Connections page with Received and Sent tabs
- Accept and Decline actions
- RLS policies for security

#### Rating System
- Mandatory rating modal on project completion
- 1 to 5 star rating per collaborator with optional comment
- `avg_rating` auto-updated via PostgreSQL trigger

#### Database
- 8 tables with RLS enabled on all
- `ON DELETE CASCADE` on all foreign keys
- 2 PostgreSQL functions and 3 triggers

#### Documentation
- `README.md`, `docs/ARCHITECTURE.md`, `docs/DATABASE.md`

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