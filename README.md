# AEQUIV

Träning, nutrition och återhämtning i jämvikt. Lokal-först mobilapp byggd med TanStack Start, React och Tailwind.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

Node 24 LTS is pinned in `.nvmrc` (`nvm use`).

### Environment variables

Secrets are not stored in git. Create a `.env.local` file in the project root (it is git-ignored) with these names and your own values:

| Variable | Used by |
| --- | --- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase client in the browser |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | Server-side Supabase access |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin access (keep secret) |
| `GEMINI_API_KEY` | AI features (photo log, text log, coach) |
| `LOVABLE_CRON_SECRET`, `LOVABLE_CRON_SECRET_PREVIOUS` | Cron endpoint authentication |
| `LOVABLE_DB_MIGRATION_URL` | Drizzle migrations (`drizzle.config.ts`) |
