# Supabase DB Migration Procedure (Prod → Dev Split)

## Goal

Separate development and production environments by:

- keeping the current Supabase project as PROD
- creating a new DEV Supabase project
- cloning the PROD database schema into DEV
- configuring local app to use DEV
- keeping deployed app connected to PROD

---

# 1. Create a new Supabase project

Go to:

https://supabase.com/dashboard/projects

Create:

- `builderlab-dev`

Save:
- project URL
- anon key
- service role key
- DB password

---

# 2. Install / Use Supabase CLI

Using `npx` (recommended on Windows):

```bash
npx supabase login
```

---

# 3. Link local project to PROD

Inside the project root:

```bash
npx supabase link --project-ref YOUR_PROD_PROJECT_ID
```

Find project ref in:

Supabase Dashboard → Settings → General

---

# 4. Pull the production schema

```bash
npx supabase db pull
```

This creates:

```text
supabase/migrations/
```

containing SQL migrations from the production DB.

---

# 5. Link local project to DEV

```bash
npx supabase link --project-ref YOUR_DEV_PROJECT_ID
```

---

# 6. Push schema into DEV DB

```bash
npx supabase db push
```

This recreates:
- tables
- indexes
- RLS policies
- triggers
- functions
- enums
- extensions

inside the DEV database.

---

# 7. Configure environment variables

## Local Development

File:

```text
.env.local
```

Use DEV credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_DEV_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_DEV_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_DEV_SERVICE_ROLE_KEY
```

---

## Production

File:

```text
.env.production.local
```

Use PROD credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROD_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PROD_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_PROD_SERVICE_ROLE_KEY
```

IMPORTANT:
Hosted platforms (Vercel, Netlify, etc.) must also have production env vars configured in their dashboard.

---

# 8. Configure Auth Redirect URLs

## DEV Supabase Project

Authentication → URL Configuration

### Site URL

```text
http://localhost:3000
```

### Redirect URLs

```text
http://localhost:3000/auth/callback
```

---

## PROD Supabase Project

Authentication → URL Configuration

### Site URL

```text
https://builderlab.ai
```

### Redirect URLs

```text
https://builderlab.ai/auth/callback
```

---

# 9. Verify environment separation

## Local

Run:

```bash
npm run dev
```

Ensure:
- app uses DEV Supabase project
- new users/data appear only in DEV DB

---

## Production

Ensure:
- deployed app still uses PROD project
- production data remains untouched

---

# 10. Recommended future workflow

## Create new migration

```bash
npx supabase migration new migration_name
```

Edit generated SQL migration.

---

## Apply migration to DEV

```bash
npx supabase db push
```

---

## Deploy migration to PROD later

After testing in DEV:

```bash
npx supabase link --project-ref YOUR_PROD_PROJECT_ID
npx supabase db push
```

IMPORTANT:
Always verify which project is linked before pushing.

---

# Notes

## `db pull`

Reads remote DB schema → creates local migrations.

---

## `db push`

Applies local migrations → remote DB.

---

## Auth users are NOT copied

Supabase Auth users do not migrate automatically.

For DEV:
- create fresh test accounts

---

## Storage files are NOT copied

Supabase Storage buckets/files are separate per project.

---

# Final Architecture

| Environment | Supabase Project | Frontend |
|---|---|---|
| Local Dev | builderlab-dev | localhost:3000 |
| Production | builderlab-prod | builderlab.ai |

```