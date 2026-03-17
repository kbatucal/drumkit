# Supabase Setup Guide

The beatmaker uses Supabase for authentication and saving beats.

## 1. Create tables in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Open **SQL Editor** and run this:

```sql
-- Beats table (stores saved beats per user)
create table if not exists public.beats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null default 'My Beat',
  hits jsonb not null default '[]',
  created_at timestamptz default now()
);

-- Row Level Security: users can only access their own beats
alter table public.beats enable row level security;

drop policy if exists "Users can manage own beats" on public.beats;
create policy "Users can manage own beats"
  on public.beats for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

## 2. Enable Email auth

1. In Supabase Dashboard → **Authentication** → **Providers**
2. Ensure **Email** is enabled (it is by default)
3. Optionally enable "Confirm email" if you want email verification

## 3. Add your config

1. Open `supabase-config.js`
2. Replace `YOUR_SUPABASE_ANON_KEY` with your **anon public** key
3. Find it at: **Settings** → **API** → **Project API keys** → **anon public** (the long JWT string)

## 4. Test

1. Open the app in your browser
2. Sign up with email/password
3. Record a beat, name it, and click Save
4. Your beat should appear in "My beats"
