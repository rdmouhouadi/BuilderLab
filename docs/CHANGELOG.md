# Changelog

All notable changes to BuilderLab are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) conventions.
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased] — V0.5.0

### Planned
- HiveCheck — structured peer review system
- Project submission for review (GitHub link, demo, description)
- Anonymous feedback from senior builders (3+ years experience)
- Public project leaderboard by domain and skill
- Reviewer reputation score

---

## [0.4.0] — 2026-05-24

### Added

#### Follow System
- **Follow button on project cards** — Any builder can follow a project directly from the feed. Button styled as a capsule, turns white on hover. Optimistic update.
- **Follow button on project detail page** — Visible in the sidebar for non-members and non-owners. Shows follower count.
- **"Projects I follow" section in profile** — Third section added to the profile page, after "Posted projects" and "Projects I joined".
- **Follower count on project detail** — Displayed in the Details card alongside duration, spots, and posted date.

#### Privacy Settings
- **Per-section privacy toggles** — Project owners can now control visibility of Build Log, Team Chat, Milestones, and Team members independently.
- **Members + followers access** — Private sections are visible to project members and followers. Public visitors see a "Follow to see" message.
- **Privacy panel in sidebar** — Owner-only panel showing toggle buttons for each section (Public / Private).
- **New columns on `projects` table** — `show_build_log`, `show_chat`, `show_milestones`, `show_team` (all default `true`).

#### Project Archive
- **`/archive` page** — Public page listing all completed and public projects. Searchable. Accessible to all users including non-authenticated visitors.
- **Archive link in navbar** — Added to both desktop capsule and mobile menu.
- **`is_public` column on `projects`** — Boolean flag (`true` by default) controlling whether a completed project appears in the archive.

#### Completion Modal
- **Celebratory completion modal** — Replaces the direct "Mark as completed" action. Shows a 🎉 modal with project title, build-in-public message, and opt-out checkbox.
- **Public by default** — Completed projects are published to the archive automatically. Owners can opt out by checking "Keep it private."
- **`is_public` updated on completion** — Set to `true` or `false` depending on the owner's choice in the modal.

#### Community Feedback
- **`project_comments` table** — New table for lightweight community feedback on projects. RLS enabled.
- **Community Feedback section** — New section on project detail pages. Any authenticated builder can post a comment. Authors can delete their own comments.
- **Commenter profile links** — Avatar and name link to the commenter's public profile.
- **Character limit** — 500 characters per comment with a live counter.

### Fixed
- **Chat auto-scroll on polling** — The group chat was scrolling to the bottom every 5 seconds due to the polling interval triggering the scroll `useEffect`. Fixed by tracking message count with a `useRef` and only scrolling when new messages actually arrive.

---

## [0.3.0] — 2026-05-22

### Added

#### Conversation Layer
- **Group chat with polling** — Each project now has a team chat accessible from the project detail page. Messages are fetched every 5 seconds. Only members and the owner can send messages. All visitors can read.
- **Connection message visible in team section** — The personalized message sent with a connection request is now displayed under the member's name in the Team section, but only after the request is accepted. Helps the owner remember why each member joined.
- **`project_messages` table** — New table for group chat messages. RLS enabled — members and owners can post, authors can delete.

#### In-App Notifications
- **Notification bell in navbar** — Bell icon with a red badge showing the unread count. Clicking opens a dropdown with the 5 most recent notifications. Clicking outside closes the dropdown. Marks all as read on open.
- **`/notifications` page** — Full notifications history, split into "New" and "Earlier" sections. Protected route — requires authentication.
- **`notifications` table** — New table storing all in-app notifications. Fields: `user_id`, `type`, `title`, `body`, `link`, `read`. RLS enabled — users see only their own notifications.
- **Notification types implemented:**
  - `connection_request` — triggered when someone sends an interest request
  - `connection_accepted` — triggered when a request is accepted
- **Notification creation in API routes** — Both `/api/notify/interest` and `/api/notify/accepted` now create in-app notifications in addition to sending emails.
- **`/notifications` added to protected routes** in `proxy.ts`.

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
- **Clickable names** — Builder names in the Connections page and Project Detail (Posted by, Team members) are now clickable and link to their public profile page.

#### Connection Flow
- **Personalized interest message** — Clicking "I'm interested" now opens a modal where the user can write a personalized message before sending the request. The message is pre-filled with the user's preferred contact if set in their profile. A hint is shown if no contact is set.
- **Pending filter in Connections** — The "Received" tab now only shows pending requests. Accepted and rejected requests are removed from the list after action.
- **Connection badge on navbar** — A red pulsing badge on the "Connections" tab shows the number of pending requests in real time.

#### Notifications
- **Email notification on interest** — The project owner receives an email when someone expresses interest, including the sender's message and a link to the project.
- **Email notification on accept** — The sender receives an email when their request is accepted, with a link to the project.

#### Profile & Identity
- **Real navbar initials** — The avatar in the navbar now shows the user's real initials (first + last name) fetched from their profile.
- **BackButton component** — A reusable `BackButton` component with `router.back()` and a configurable fallback URL.

### Fixed
- **Skills overflow on project cards** — Only the first 2 skills are shown with a `+N more` badge.
- **Spots hidden on small screens** — Hidden on mobile to prevent button wrapping.
- **Member count always visible** — Always rendered (even at 0) to keep cards aligned.
- **Duration filter not applied** — `matchDuration` was calculated but never used in the filter.
- **Level constraint updated** — SQL constraint now accepts both English and French level values.
- **Singular/plural on hero banner** — "1 available projects" now reads "1 available project".
- **"New" vs timestamp on cards** — Projects show "New" for 24h, then relative timestamp via `lib/timeLabel.ts`.
- **Mobile responsive filters** — 2-column grid on mobile, 3 columns on desktop.
- **Hero banner mobile overflow** — Fixed with `overflow: hidden` and responsive font sizing.

---

## [0.1.1] — 2026-05-14

### Fixed
- **Login redirect** — After signing in, the app now redirects to the feed automatically.
- **Skills overflow on project cards** — First 2 skills shown with `+N more` badge.
- **Project description overflow** — Long descriptions no longer break out of their container.
- **Duration filter not applied** — Fixed in `useMemo` return condition.
- **`SKILLS_OPTIONS` unused** — "All Skills" option was missing from the dropdown.

### Improved
- **Dev / Production database separation** — Dedicated Supabase project for development.
- **Edit project (inline)** — Owners can edit directly from the project detail page.
- **Delete project** — Owners can delete their project with a confirmation dialog.
- **Error messages humanized** — Database constraint errors are no longer shown raw.

---

## [0.1.0] — 2026-05-01

### Added

#### Core Infrastructure
- Next.js 14 App Router with TypeScript and Tailwind CSS
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