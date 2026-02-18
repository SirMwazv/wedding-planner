# Supabase Setup Guide — Roora

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a project
2. Note your **Project URL** and **anon key** from Settings → API

## 2. Configure Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Run the Database Schema

In Supabase SQL Editor, run the contents of `schema.sql` (in the project root).

This creates:
- `couples` — wedding couple profiles
- `couple_users` — user-to-couple mapping (partner1/partner2 roles)  
- `events` — ceremonies (lobola, white wedding, etc.)
- `suppliers` — vendors/service providers
- `quotes` — supplier quotes with deposit tracking
- `payments` — payment records
- `tasks` — planning checklist items

All tables have Row Level Security (RLS) policies.

## 4. Enable Auth

In Supabase Dashboard → Authentication → Providers:
- Enable **Email** provider (on by default)
- Set redirect URL to: `http://localhost:3000/auth/callback`

For production, add your domain's callback URL.

## 5. Enable Realtime (optional)

In Supabase Dashboard → Database → Replication:
- Enable realtime for tables: `tasks`, `suppliers`, `quotes`, `payments`

This enables the live-update hooks in the application.

## 6. Start the App

```bash
npm install
npm run dev
```

Navigate to `http://localhost:3000` → Sign up → Create your wedding profile.

## Troubleshooting

| Issue | Fix |
|---|---|
| "Invalid API key" | Check `.env.local` values match Supabase dashboard |
| "Too many redirects" | Ensure callback URL is set in Supabase Auth settings |
| Tables not found | Run `schema.sql` in Supabase SQL Editor |
| RLS blocking queries | Check that `couple_users` has an entry for your user |
