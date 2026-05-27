# BuilderLab — Database Documentation

> This document describes the complete database schema of BuilderLab — all tables, columns, relationships, Row Level Security policies, triggers, and functions.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Entity Relationship Diagram](#2-entity-relationship-diagram)
3. [Tables](#3-tables)
   - [3.1 profiles](#31-profiles)
   - [3.2 user_skills](#32-user_skills)
   - [3.3 projects](#33-projects)
   - [3.4 project_skills](#34-project_skills)
   - [3.5 connections](#35-connections)
   - [3.6 project_members](#36-project_members)
   - [3.7 ratings](#37-ratings)
   - [3.8 milestones](#38-milestones)
   - [3.9 project_updates](#39-project_updates)
   - [3.10 project_messages](#310-project_messages)
   - [3.11 notifications](#311-notifications)
   - [3.12 project_followers](#312-project_followers)
   - [3.13 project_comments](#313-project_comments)
   - [3.14 tasks](#314-tasks)
4. [Row Level Security Policies](#4-row-level-security-policies)
5. [Triggers & Functions](#5-triggers--functions)
6. [Key Design Decisions](#6-key-design-decisions)

---

## 1. Overview

```
Total tables    : 14
RLS enabled     : Yes (all tables)
Triggers        : 4
Functions       : 3
Auth integration: profiles.id references auth.users.id
```

---

## 2. Entity Relationship Diagram

```
auth.users (Supabase managed)
    │
    │ 1:1 (trigger creates profile on signup)
    ▼
profiles
    │
    ├── 1:N → user_skills
    ├── 1:N → projects
    │           │
    │           ├── 1:N → project_skills
    │           ├── 1:N → connections (sender → project)
    │           ├── 1:N → project_members
    │           │               └── 1:N → ratings
    │           ├── 1:N → milestones
    │           ├── 1:N → project_updates
    │           ├── 1:N → project_messages
    │           ├── 1:N → project_followers
    │           ├── 1:N → project_comments
    │           └── 1:N → tasks
    └── 1:N → notifications
```

---

## 3. Tables

### 3.1 profiles

```sql
create table profiles (
  id                      uuid references auth.users primary key,
  name                    text,
  first_name              text,
  last_name               text,
  country                 text,
  bio                     text,
  school                  text,                    -- Legacy field
  major                   text,                    -- Legacy field
  builder_type            text default 'student'
                          check (builder_type in (
                            'student', 'bootcamp', 'self_learner', 'professional'
                          )),
  institution             text,                    -- Replaces school
  program                 text,                    -- Replaces major
  avg_rating              float    default 0,
  ratings_count           int      default 0,
  preferred_contact_type  text,
  preferred_contact_value text,
  created_at              timestamptz default now()
);
```

**Notes:**
- `builder_type` determines the adaptive labels for `institution` and `program` in the UI
- `school` and `major` are kept for backward compatibility but superseded by `institution` and `program`

### 3.2 user_skills

```sql
create table user_skills (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references profiles(id) on delete cascade,
  skill      text not null
);
```

### 3.3 projects

```sql
create table projects (
  id              uuid    default gen_random_uuid() primary key,
  owner_id        uuid    references profiles(id) on delete cascade,
  title           text    not null,
  problem         text,
  level           text    check (level in (
                    'beginner', 'intermediate', 'advanced',
                    'débutant', 'intermédiaire', 'avancé'
                  )),
  domain          text,
  status          text    default 'open'
                          check (status in ('open', 'in_progress', 'completed')),
  duration        text,
  spots           int,
  website_url     text,
  github_url      text,
  -- Privacy settings (added in V0.4.0)
  is_public       boolean default true,
  show_build_log  boolean default true,
  show_chat       boolean default true,
  show_milestones boolean default true,
  show_team       boolean default true,
  created_at      timestamptz default now()
);
```

**Privacy columns (added in V0.4.0):**
- `is_public` — controls HiveCheck/archive visibility when completed
- `show_build_log` — controls Build Log visibility
- `show_chat` — controls Team Chat visibility
- `show_milestones` — controls Milestones visibility
- `show_team` — controls Team members visibility

When a section is private (`false`), it is visible only to project members and followers.

### 3.4 project_skills

```sql
create table project_skills (
  id           uuid default gen_random_uuid() primary key,
  project_id   uuid references projects(id) on delete cascade,
  skill_needed text not null
);
```

### 3.5 connections

```sql
create table connections (
  id         uuid    default gen_random_uuid() primary key,
  sender_id  uuid    references profiles(id) on delete cascade,
  project_id uuid    references projects(id) on delete cascade,
  message    text,
  status     text    default 'pending'
                     check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz default now()
);
```

### 3.6 project_members

```sql
create table project_members (
  id                 uuid    default gen_random_uuid() primary key,
  project_id         uuid    references projects(id) on delete cascade,
  user_id            uuid    references profiles(id) on delete cascade,
  role               text,
  status             text    default 'active'
                             check (status in ('active', 'left')),
  rating_required    boolean default false,
  is_hiveos_manager  boolean default false,  -- Added in V0.5.0
  leave_reason       text,                   -- Added in V0.5.0
  left_at            timestamptz,            -- Added in V0.5.0
  joined_at          timestamptz default now(),
  unique(project_id, user_id)
);
```

**HiveOS columns (added in V0.5.0):**
- `is_hiveos_manager` — only one member can hold this role per project at a time
- `leave_reason` — mandatory reason when a member leaves or is removed; visible to owner + concerned member only
- `left_at` — timestamp when the member left or was removed

### 3.7 ratings

```sql
create table ratings (
  id                uuid    default gen_random_uuid() primary key,
  project_member_id uuid    references project_members(id) on delete cascade,
  rater_id          uuid    references profiles(id) on delete cascade,
  rated_id          uuid    references profiles(id) on delete cascade,
  score             int     check (score >= 0 and score <= 5),
  comment           text,
  created_at        timestamptz default now(),
  unique(project_member_id, rater_id)
);
```

### 3.8 milestones

```sql
create table milestones (
  id         uuid    default gen_random_uuid() primary key,
  project_id uuid    references projects(id) on delete cascade,
  title      text    not null,
  completed  boolean default false,
  position   int     default 0,
  created_at timestamptz default now()
);
```

### 3.9 project_updates *(added in V0.2.0)*

```sql
create table project_updates (
  id         uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  author_id  uuid references profiles(id) on delete cascade,
  type       text default 'update'
             check (type in ('update', 'milestone', 'blocker', 'decision', 'demo')),
  content    text not null,
  created_at timestamptz default now()
);
```

**Notes:**
- Only project members and the owner can post updates (enforced by RLS)
- Authors can delete their own updates
- Used to compute the activity signal on project cards
- Auto-populated by HiveOS when a task moves to `blocked` or `done` (added in V0.5.0)

### 3.10 project_messages *(added in V0.3.0)*

```sql
create table project_messages (
  id         uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  author_id  uuid references profiles(id) on delete cascade,
  content    text not null,
  created_at timestamptz default now()
);
```

**Notes:**
- Used for the group chat inside each project workspace
- Fetched with polling every 5 seconds
- Only members and the owner can send messages
- Authors can delete their own messages

### 3.11 notifications *(added in V0.3.0)*

```sql
create table notifications (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references profiles(id) on delete cascade,
  type       text not null check (type in (
               'connection_request',
               'connection_accepted',
               'new_member',
               'new_message',
               'task_assigned'
             )),
  title      text not null,
  body       text,
  link       text,
  read       boolean default false,
  created_at timestamptz default now()
);
```

**Notes:**
- Each user sees only their own notifications (RLS)
- Created by API routes using `supabaseAdmin`
- `read` is set to `true` when the user opens the notifications dropdown or page
- `task_assigned` type added in V0.5.0 for HiveOS task assignment notifications

### 3.12 project_followers *(added in V0.4.0)*

```sql
create table project_followers (
  id         uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(project_id, user_id)
);
```

**Notes:**
- A user can follow a project without being a member
- Followers have access to private sections (Build Log, Chat, Milestones, Team)
- Unique constraint prevents duplicate follows

### 3.13 project_comments *(added in V0.4.0)*

```sql
create table project_comments (
  id         uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  author_id  uuid references profiles(id) on delete cascade,
  content    text not null,
  created_at timestamptz default now()
);
```

**Notes:**
- Distinct from HiveCheck peer reviews — informal, conversational feedback
- Any authenticated builder can comment (not restricted to members or followers)
- Authors can delete their own comments
- Maximum 500 characters (enforced at application level)

### 3.14 tasks *(added in V0.5.0)*

```sql
create table tasks (
  id           uuid default gen_random_uuid() primary key,
  project_id   uuid references projects(id)   on delete cascade,
  milestone_id uuid references milestones(id)  on delete set null,
  assignee_id  uuid references profiles(id)    on delete set null,
  created_by   uuid references profiles(id)    on delete set null,
  title        text not null,
  description  text,
  status       text default 'todo'
               check (status in ('todo', 'in_progress', 'blocked', 'done')),
  priority     text default 'none'
               check (priority in ('none', 'low', 'medium', 'high')),
  due_date     date,
  position     int  default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
```

**Notes:**
- Core table for HiveOS — the task management layer inside each project
- Tasks are visible only to project members and owner (not followers)
- Only the owner or HiveOS manager can create, update, and delete tasks
- Assignees can update the status of their own tasks
- When a task moves to `blocked` or `done`, an entry is automatically inserted into `project_updates` (Build Log)
- `milestone_id` is optional — tasks can be linked to a milestone for better organization

---

## 4. Row Level Security Policies

RLS is **enabled on all 14 tables**.

### profiles
| Policy | Operation | Rule |
|---|---|---|
| Visible by all | SELECT | `true` |
| Create own profile | INSERT | `auth.uid() = id` |
| Update own profile | UPDATE | `auth.uid() = id` |

### projects
| Policy | Operation | Rule |
|---|---|---|
| Visible by all | SELECT | `true` |
| Create own project | INSERT | `auth.uid() = owner_id` |
| Update own project | UPDATE | `auth.uid() = owner_id` |
| Delete own project | DELETE | `auth.uid() = owner_id` |

### connections
| Policy | Operation | Rule |
|---|---|---|
| See own connections | SELECT | `auth.uid() = sender_id OR auth.uid() = project.owner_id` |
| Send a request | INSERT | `auth.uid() = sender_id` |
| Owner manages requests | UPDATE | `auth.uid() = project.owner_id` |

### project_members
| Policy | Operation | Rule |
|---|---|---|
| Visible by all | SELECT | `true` |
| Owner adds members | INSERT | `auth.uid() = project.owner_id` |
| Owner can update members | UPDATE | `auth.uid() = project.owner_id` |
| Member can update own status | UPDATE | `auth.uid() = user_id` |

### ratings
| Policy | Operation | Rule |
|---|---|---|
| Visible by all | SELECT | `true` |
| Members can rate | INSERT | `auth.uid() = rater_id AND user is project member` |

### milestones
| Policy | Operation | Rule |
|---|---|---|
| Visible by all | SELECT | `true` |
| Owner adds | INSERT | `auth.uid() = project.owner_id` |
| Owner updates | UPDATE | `auth.uid() = project.owner_id` |
| Owner deletes | DELETE | `auth.uid() = project.owner_id` |

### project_updates
| Policy | Operation | Rule |
|---|---|---|
| Visible by all | SELECT | `true` |
| Members can post | INSERT | `auth.uid() = author_id AND (is member OR is owner)` |
| Author can delete | DELETE | `auth.uid() = author_id` |

### project_messages
| Policy | Operation | Rule |
|---|---|---|
| Visible by all | SELECT | `true` |
| Members can send | INSERT | `auth.uid() = author_id AND (is member OR is owner)` |
| Author can delete | DELETE | `auth.uid() = author_id` |

### notifications
| Policy | Operation | Rule |
|---|---|---|
| Users see own | SELECT | `auth.uid() = user_id` |
| System can insert | INSERT | `auth.uid() is not null` (via supabaseAdmin) |
| Users can update own | UPDATE | `auth.uid() = user_id` |
| Users can delete own | DELETE | `auth.uid() = user_id` |

### project_followers
| Policy | Operation | Rule |
|---|---|---|
| Visible by all | SELECT | `true` |
| Users can follow | INSERT | `auth.uid() = user_id` |
| Users can unfollow | DELETE | `auth.uid() = user_id` |

### project_comments
| Policy | Operation | Rule |
|---|---|---|
| Visible by all | SELECT | `true` |
| Authenticated users can comment | INSERT | `auth.uid() is not null AND auth.uid() = author_id` |
| Author can delete | DELETE | `auth.uid() = author_id` |

### tasks *(added in V0.5.0)*
| Policy | Operation | Rule |
|---|---|---|
| Members and owner can see tasks | SELECT | `is member OR is owner` |
| Owner or manager can create tasks | INSERT | `auth.uid() = created_by AND (is owner OR is_hiveos_manager)` |
| Owner or manager can update tasks | UPDATE | `is owner OR is_hiveos_manager OR assignee_id = auth.uid()` |
| Owner or manager can delete tasks | DELETE | `is owner OR is_hiveos_manager` |

---

## 5. Triggers & Functions

### Function 1 — handle_new_user
Creates a profile row automatically when a new user signs up.

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### Function 2 — update_avg_rating
Recalculates `avg_rating` and `ratings_count` on a profile after each new rating.

```sql
create or replace function update_avg_rating()
returns trigger as $$
begin
  update profiles
  set
    avg_rating = (
      select round(avg(score)::numeric, 1)
      from ratings where rated_id = NEW.rated_id
    ),
    ratings_count = (
      select count(*) from ratings where rated_id = NEW.rated_id
    )
  where id = NEW.rated_id;
  return NEW;
end;
$$ language plpgsql;

create trigger on_new_rating
  after insert on ratings
  for each row execute function update_avg_rating();
```

### Function 3 — handle_connection_accepted *(added in V0.2.0)*
Automatically adds the sender to `project_members` when a connection is accepted.

```sql
create or replace function handle_connection_accepted()
returns trigger as $$
begin
  if NEW.status = 'accepted' and OLD.status = 'pending' then
    insert into project_members (project_id, user_id, status, rating_required)
    values (NEW.project_id, NEW.sender_id, 'active', false)
    on conflict (project_id, user_id) do nothing;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_connection_accepted
  after update on connections
  for each row execute function handle_connection_accepted();
```

---

## 6. Key Design Decisions

### Separate skills tables
`user_skills` and `project_skills` are separate tables for efficient filtering and future matching algorithm.

### avg_rating stored on profile
Pre-computed via trigger for fast reads across the feed without JOIN overhead.

### Bidirectional ratings
`rater_id` + `rated_id` with `unique(project_member_id, rater_id)` prevents double-rating.

### rating_required flag
Boolean on `project_members` — simpler than querying the ratings table on every page load.

### ON DELETE CASCADE everywhere
Automatic cleanup when a user or project is deleted — no orphaned rows.

### RLS as the security layer
Security enforced at the database level — safe even if the anon key is exposed in the frontend.

### Privacy at the column level
Privacy settings are stored as boolean columns on `projects` rather than a separate settings table. Simpler reads, no joins required for display logic.

### Followers as a trust tier
The `project_followers` table creates a middle trust tier between anonymous visitors and project members. This powers the "follow to see private sections" mechanic without complex role systems.

### project_comments separate from HiveCheck
Community feedback (`project_comments`) is intentionally kept separate from HiveCheck peer reviews. Different purpose, different audience, different constraints — merging them would compromise both.

### HiveOS manager as a column flag
`is_hiveos_manager` is a boolean on `project_members` rather than a separate roles table. Simpler to enforce the "one manager at a time" constraint — just set all to `false` before assigning a new one.

### leave_reason on project_members
Stored directly on the membership row rather than a separate audit table. Keeps the data model simple at this stage. The reason is visible only to the two concerned parties (owner + member) — enforced at the application level.

### tasks linked to milestones optionally
`milestone_id` is nullable — tasks don't need to belong to a milestone. This allows ad-hoc tasks without forcing the team to create milestones first.

---

*Last updated: BuilderLab v0.5.0*