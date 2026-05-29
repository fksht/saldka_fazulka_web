# Supabase backend — setup guide

This turns the site from a browser-only demo into a real app: shared database,
secure admin login, image storage, and (optionally) order-notification emails.

The frontend automatically uses Supabase **only when** `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` are set. Without them it falls back to the localStorage
demo, so nothing breaks while you set this up.

---

## 1. Create the project (free)

1. Go to https://supabase.com → sign up (GitHub login is easiest).
2. **New project**. Pick a name (e.g. `sladka-fazulka`), a strong database
   password (save it), and the region closest to you (e.g. *Central EU*).
3. Wait ~2 minutes for it to provision.

> Free tier: 500 MB database, 1 GB storage, 50k logins/month. A free project
> pauses only after 7 days of **zero** traffic — just click *Restore* if so.

## 2. Create the database tables + security

1. In the project: **SQL Editor → New query**.
2. Open `supabase/schema.sql` from this repo, copy everything, paste, **Run**.
3. You should see "Success". This creates the `products`, `orders`,
   `gallery_images`, `candy_bar_packages` tables, the security rules, and the
   `images` storage bucket.

## 3. Create your admin login

1. **Authentication → Users → Add user → Create new user**.
2. Enter Zuzka's email + a password. ✅ Tick **Auto Confirm User**.
3. This is the login you'll use on `/admin` (replaces the bundled password).

## 4. Get your API keys

1. **Project Settings → API**.
2. Copy:
   - **Project URL** → this is `VITE_SUPABASE_URL`
   - **anon public** key → this is `VITE_SUPABASE_ANON_KEY`

   (The anon key is meant to be public — it is safe in the frontend and is
   governed by the security rules from step 2. Do **not** copy the
   `service_role` key into the app.)

## 5. Add the keys

**For local development** — add to your `.env` file:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key...
```

**For the live site** — add them as GitHub Actions secrets at
https://github.com/fksht/saldka_fazulka_web/settings/secrets/actions
(New repository secret), with the exact names:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

(The deploy workflow already reads these.)

## 6. Seed the catalog

After logging into `/admin` for the first time with an empty database, use the
**“Importovať aktuálnu ponuku”** button (added in the admin) to push the current
catalog (products, gallery, candy bar packages) into Supabase. One click, done.

---

## What's NOT in Supabase (stays in code, on purpose)

Cake configurator options (korpus/krém/veľkosť), wedding boxes, the tasting box,
the About page text, and contact info are static content edited in the catalog
file — they don't need a database.

## Optional: order emails

To have Zuzka emailed on every order, deploy the serverless function in
`api/send-order-email.example.ts` (e.g. on Vercel/Netlify with a Resend API key)
and add its URL as the `VITE_EMAIL_ENDPOINT` secret. This is independent of the
database and can be done later.
