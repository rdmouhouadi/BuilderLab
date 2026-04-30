# BuilderLab — Database Documentation

> This document describes the complete database schema of BuilderLab — all tables, columns, relationships, Row Level Security policies, triggers, and functions.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Entity Relationship Diagram](#2-entity-relationship-diagram)
3. [Tables](#3-tables)
   - [profiles](#31-profiles)
   - [user_skills](#32-user_skills)
   - [projects](#33-projects)
   - [project_skills](#34-project_skills)
   - [connections](#35-connections)
   - [project_members](#36-project_members)
   - [ratings](#37-ratings)
   - [milestones](#38-milestones)
4. [Row Level Security Policies](#4-row-level-security-policies)
5. [Triggers & Functions](#5-triggers--functions)
6. [Key Design Decisions](#6-key-design-decisions)

---

## 1. Overview

BuilderLab uses **PostgreSQL** via Supabase. The database has **8 tables**, **Row Level Security enabled on all tables**, **3 triggers**, and **2 functions**.

```
Total tables    : 8
RLS enabled     : Yes (all tables)
Triggers        : 3
Functions       : 2
Auth integration: profiles.id references auth.users.id
```

---

## 2. Entity Relationship Diagram

```
auth.users (Supabase managed)
    │
    │ 1:1 (trigger creates profile on signup)
    ▼
profiles ──────────────────────────────────────────┐
    │                                              │
    │ 1:N                                          │ 1:N
    ▼                                              ▼
user_skills                                    projects ──────────┐
                                                   │              │
                                                   │ 1:N          │ 1:N
                                                   ▼              ▼
                                           project_skills    connections
                                                              (sender → project)
                                                   │
                                                   │ 1:N
                                                   ▼
                                           project_members
                                                   │
                                                   │ 1:N
                                                   ▼
                                               ratings
                                               milestones
```

---

## 3. Tables

### 3.1 profiles

Stores public user profile information. One row per user.
`id` references `auth.users.id` — automatically created by the `handle_new_user` trigger on signup.

```sql
create table profiles (
  id                      uuid references auth.users primary key,
  name                    text,                    -- Full name (kept for compatibility)
  first_name              text,                    -- First name
  last_name               text,                    -- Last name
  country                 text,                    -- Country of residence
  bio                     text,                    -- Short biography
  school                  text,                    -- University or school name
  major                   text,                    -- Field of study / specialty
  avg_rating              float    default 0,      -- Average rating (auto-updated by trigger)
  ratings_count           int      default 0,      -- Total number of ratings received
  preferred_contact_type  text,                    -- 'discord' | 'whatsapp' | 'slack' | 'telegram' | 'email' | 'linkedin'
  preferred_contact_value text,                    -- The actual link or username
  created_at              timestamptz default now()
);
```

**Notes:**
- `avg_rating` and `ratings_count` are automatically updated by the `update_avg_rating` trigger — never update them manually
- `name` is kept for backward compatibility — it is reconstructed as `first_name + last_name` on every profile save
- `preferred_contact_type` must match one of the keys in `lib/constants.ts → CONTACT_TYPES`

---

### 3.2 user_skills

Stores the skills a user declares on their profile. One row per skill per user.
Separated from `profiles` to allow multiple skills per user without array columns.

```sql
create table user_skills (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references profiles(id) on delete cascade,
  skill      text not null                -- Must match a value in lib/constants.ts → SKILLS
);
```

**Notes:**
- `on delete cascade` — if a profile is deleted, all their skills are deleted automatically
- Currently not used in the UI but the table is ready for V0.2.0 (profile skill tags)

---

### 3.3 projects

The core table. Stores all projects posted by users.

```sql
create table projects (
  id         uuid    default gen_random_uuid() primary key,
  owner_id   uuid    references profiles(id) on delete cascade,
  title      text    not null,
  problem    text,                        -- Description of the problem being solved
  level      text    check (level in ('beginner', 'intermediate', 'advanced',
                                      'débutant', 'intermédiaire', 'avancé')),
  domain     text,                        -- Must match a value in lib/constants.ts → DOMAINS
  status     text    default 'open'
                     check (status in ('open', 'in_progress', 'completed')),
  duration   text,                        -- Estimated duration (e.g. '3 months')
  spots      int,                         -- Number of collaborators needed
  created_at timestamptz default now()
);
```

**Status lifecycle:**
```
open → in_progress → completed
         (manual)      (owner clicks "Mark as completed")
```

**Notes:**
- `level` accepts both English and French values for backward compatibility with early test data
- When `status` changes to `completed`, the `rating_required` flag is set to `true` for all `project_members`

---

### 3.4 project_skills

Stores the skills a project is looking for. One row per skill per project.
This is the key table that powers the "filter by skill needed" feature.

```sql
create table project_skills (
  id           uuid default gen_random_uuid() primary key,
  project_id   uuid references projects(id) on delete cascade,
  skill_needed text not null               -- Must match a value in lib/constants.ts → SKILLS
);
```

**Why a separate table?**

A project can need multiple skills (e.g. Data Scientist + Designer + Developer).
Storing them in a separate table allows efficient filtering:

```sql
-- "Show me all projects that need a Designer"
select * from projects p
join project_skills ps on ps.project_id = p.id
where ps.skill_needed = 'UI/UX Designer';
```

---

### 3.5 connections

Stores collaboration requests sent from one user to a project owner.

```sql
create table connections (
  id         uuid    default gen_random_uuid() primary key,
  sender_id  uuid    references profiles(id) on delete cascade,
  project_id uuid    references projects(id) on delete cascade,
  message    text,                         -- Optional message from the sender
  status     text    default 'pending'
                     check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz default now()
);
```

**Status lifecycle:**
```
pending → accepted  (owner clicks "Accept")
        → rejected  (owner clicks "Decline")
```

**Notes:**
- When a connection is `accepted`, a row should be inserted in `project_members` (this is a planned automation for V0.2.0 — currently done manually by the owner)
- The unique constraint `(sender_id, project_id)` prevents duplicate requests

---

### 3.6 project_members

Stores the confirmed members of a project (accepted collaborators).

```sql
create table project_members (
  id              uuid    default gen_random_uuid() primary key,
  project_id      uuid    references projects(id) on delete cascade,
  user_id         uuid    references profiles(id) on delete cascade,
  role            text,                    -- Optional role description (e.g. 'Data Scientist')
  status          text    default 'active'
                          check (status in ('active', 'left')),
  rating_required boolean default false,   -- Set to true when project is marked completed
  joined_at       timestamptz default now(),
  unique(project_id, user_id)              -- A user can only be a member once per project
);
```

**Notes:**
- `rating_required` is set to `true` for all members when the owner marks a project as `completed`
- Once a member submits their ratings, `rating_required` is set back to `false`
- `unique(project_id, user_id)` prevents a user from being added twice to the same project

---

### 3.7 ratings

Stores ratings given between project members at the end of a project.

```sql
create table ratings (
  id                uuid    default gen_random_uuid() primary key,
  project_member_id uuid    references project_members(id) on delete cascade,
  rater_id          uuid    references profiles(id) on delete cascade,  -- Who gives the rating
  rated_id          uuid    references profiles(id) on delete cascade,  -- Who receives the rating
  score             int     check (score >= 0 and score <= 5),          -- 0 to 5 stars
  comment           text,                                                -- Optional comment
  created_at        timestamptz default now(),
  unique(project_member_id, rater_id)    -- One rating per rater per project membership
);
```

**Notes:**
- The `unique(project_member_id, rater_id)` constraint prevents a user from rating the same person twice on the same project
- Inserting a row in `ratings` automatically triggers `update_avg_rating` which recalculates `profiles.avg_rating` and `profiles.ratings_count`
- Users cannot rate themselves (enforced at the application level)

---

### 3.8 milestones

Stores the project milestones defined by the project owner.

```sql
create table milestones (
  id         uuid    default gen_random_uuid() primary key,
  project_id uuid    references projects(id) on delete cascade,
  title      text    not null,
  completed  boolean default false,        -- false = todo, true = done
  position   int     default 0,           -- Display order (0 = first)
  created_at timestamptz default now()
);
```

**Notes:**
- Only the project owner can create, update, or delete milestones (enforced by RLS)
- `position` allows ordering milestones — ordered by `position ASC` in all queries
- The completion percentage is calculated in the frontend: `(completed milestones / total milestones) * 100`

---

## 4. Row Level Security Policies

RLS is **enabled on all 8 tables**. Every policy uses `auth.uid()` to identify the currently authenticated user.

### profiles

| Policy | Operation | Rule |
|---|---|---|
| Profiles visible by all | SELECT | `true` — anyone can read profiles |
| Create own profile | INSERT | `auth.uid() = id` |
| Update own profile | UPDATE | `auth.uid() = id` |

### user_skills

| Policy | Operation | Rule |
|---|---|---|
| Skills visible by all | SELECT | `true` |
| Add own skills | INSERT | `auth.uid() = user_id` |
| Delete own skills | DELETE | `auth.uid() = user_id` |

### projects

| Policy | Operation | Rule |
|---|---|---|
| Projects visible by all | SELECT | `true` |
| Create own project | INSERT | `auth.uid() = owner_id` |
| Update own project | UPDATE | `auth.uid() = owner_id` |
| Delete own project | DELETE | `auth.uid() = owner_id` |

### project_skills

| Policy | Operation | Rule |
|---|---|---|
| Project skills visible by all | SELECT | `true` |
| Owner adds skills | INSERT | `auth.uid() = (select owner_id from projects where id = project_id)` |
| Owner deletes skills | DELETE | `auth.uid() = (select owner_id from projects where id = project_id)` |

### connections

| Policy | Operation | Rule |
|---|---|---|
| See own connections | SELECT | `auth.uid() = sender_id OR auth.uid() = project.owner_id` |
| Send a request | INSERT | `auth.uid() = sender_id` |
| Owner manages requests | UPDATE | `auth.uid() = (select owner_id from projects where id = project_id)` |

### project_members

| Policy | Operation | Rule |
|---|---|---|
| Members visible by all | SELECT | `true` |
| Owner adds members | INSERT | `auth.uid() = (select owner_id from projects where id = project_id)` |
| Update member status | UPDATE | `auth.uid() = user_id OR auth.uid() = project.owner_id` |

### ratings

| Policy | Operation | Rule |
|---|---|---|
| Ratings visible by all | SELECT | `true` |
| Members can rate collaborators | INSERT | `auth.uid() = rater_id AND user is a member of the same project` |

### milestones

| Policy | Operation | Rule |
|---|---|---|
| Milestones visible by all | SELECT | `true` |
| Owner adds milestones | INSERT | `auth.uid() = (select owner_id from projects where id = project_id)` |
| Owner updates milestones | UPDATE | `auth.uid() = (select owner_id from projects where id = project_id)` |
| Owner deletes milestones | DELETE | `auth.uid() = (select owner_id from projects where id = project_id)` |

---

## 5. Triggers & Functions

### Function 1 — handle_new_user

**Purpose:** Automatically creates a `profiles` row when a new user signs up via Supabase Auth.

**Trigger:** `AFTER INSERT ON auth.users`

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    -- Use the name from metadata if provided,
    -- otherwise use the part before @ in the email
    coalesce(
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

**Why `security definer`?**
The function needs to insert into `profiles` on behalf of a user who does not yet have a session. `security definer` allows it to bypass RLS for this one operation.

---

### Function 2 — update_avg_rating

**Purpose:** Automatically recalculates `avg_rating` and `ratings_count` on a profile every time a new rating is inserted.

**Trigger:** `AFTER INSERT ON ratings`

```sql
create or replace function update_avg_rating()
returns trigger as $$
begin
  update profiles
  set
    -- Round to 1 decimal place (e.g. 4.7)
    avg_rating = (
      select round(avg(score)::numeric, 1)
      from ratings
      where rated_id = NEW.rated_id
    ),
    ratings_count = (
      select count(*)
      from ratings
      where rated_id = NEW.rated_id
    )
  where id = NEW.rated_id;
  return NEW;
end;
$$ language plpgsql;

create trigger on_new_rating
  after insert on ratings
  for each row execute function update_avg_rating();
```

**Why store avg_rating on the profile?**
Computing the average on every page load would require a JOIN and aggregation on every request. Storing it directly on the profile makes reads instant — the average is always pre-computed.

---

### Trigger 3 — on_auth_user_created

Already documented above with `handle_new_user`. This is the trigger that attaches the function to `auth.users`.

---

## 6. Key Design Decisions

### Decision 1 — Separate skills tables

Both `user_skills` and `project_skills` are separate tables instead of array columns.

**Why:** Arrays in PostgreSQL cannot be efficiently indexed or joined. Separate tables allow:
- Efficient filtering (`WHERE skill_needed = 'Designer'`)
- Easy addition and removal of individual skills
- Future matching algorithm between `user_skills` and `project_skills`

---

### Decision 2 — avg_rating stored on profile

Instead of computing the average rating at query time, it is stored directly on `profiles` and updated by a trigger.

**Why:** The feed displays many project cards, each showing the owner's rating. Computing averages on the fly would require N extra queries or a complex JOIN. Pre-computing via trigger keeps reads fast.

---

### Decision 3 — Bidirectional ratings

The `ratings` table has both `rater_id` and `rated_id`, and the constraint `unique(project_member_id, rater_id)` prevents double-rating.

**Why:** Trust must flow both ways. A project owner should be ratable by collaborators, and collaborators should be ratable by the owner and each other. This also prevents the system from being gamed.

---

### Decision 4 — rating_required flag

Instead of checking the ratings table to determine if a user needs to submit ratings, a boolean `rating_required` is stored on `project_members`.

**Why:** Simpler and faster. The UI just checks `rating_required = true` for the current user. Once ratings are submitted, it is set to `false`.

---

### Decision 5 — on delete cascade everywhere

All foreign keys use `ON DELETE CASCADE`.

**Why:** If a user deletes their account, all their projects, skills, connections, and ratings should be cleaned up automatically. Without cascade, orphaned rows would accumulate.

---

### Decision 6 — RLS as the security layer

Security is enforced at the **database level** via RLS, not just the application level.

**Why:** Even if someone bypasses the frontend (e.g. using the Supabase API directly with the anon key), they cannot read or write data they are not authorized to access. The anon key is safe to expose in the frontend because RLS blocks unauthorized operations.

---

*Last updated: BuilderLab v0.1.0*