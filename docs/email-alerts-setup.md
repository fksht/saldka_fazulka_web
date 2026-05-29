# Order email alerts — setup

Goal: email the baker (Zuzka) automatically whenever a customer places an order.

How it works: a **Supabase Database Webhook** fires on every new row in `orders`
and calls the **Edge Function** in `supabase/functions/send-order-email`, which
sends the email through **Resend**. This runs entirely server-side, so the alert
is sent even if the customer closes the browser. No GitHub redeploy is involved.

---

## 1. Resend account (free)

1. Sign up at https://resend.com **using sladkafazulka@gmail.com**.
   (This matters: without a verified domain, Resend can send from its shared
   address `onboarding@resend.dev` but only **to the account owner's email** —
   which is exactly where we want the alerts to go.)
2. **API Keys → Create API Key** (full access). Copy it — you'll need it once.

> Later, if you verify your own domain in Resend, you can also send the customer
> a confirmation email and use a branded sender. Not required for alerts.

## 2. Deploy the Edge Function

**Option A — Supabase Dashboard (no tools to install):**
1. Supabase → **Edge Functions → Create a function**.
2. Name it exactly `send-order-email`.
3. Paste the contents of `supabase/functions/send-order-email/index.ts`.
4. **Deploy**.

**Option B — CLI:**
```bash
npm i -g supabase
supabase login
supabase link --project-ref afsbvqtmtywghatzftbd
supabase functions deploy send-order-email
```

## 3. Function secrets

Supabase → **Edge Functions → Manage secrets** (or Project Settings → Functions),
add:

| Name | Value |
|---|---|
| `RESEND_API_KEY` | the key from step 1 |
| `ORDER_EMAIL_TO` | `sladkafazulka@gmail.com` |
| `WEBHOOK_SECRET` | any long random string (used in step 4) |

(`ORDER_EMAIL_FROM` is optional; it defaults to `onboarding@resend.dev`.)

## 4. Database Webhook

Supabase → **Database → Webhooks → Create a new hook**:
- **Table:** `orders`
- **Events:** Insert
- **Type:** *Supabase Edge Functions* → choose `send-order-email`
- **HTTP Headers:** add `x-webhook-secret` = the same value as `WEBHOOK_SECRET`

Save.

## 5. Test

Place a test order on the site, then check sladkafazulka@gmail.com — the alert
should arrive within seconds. Delete the test order afterwards:

```sql
delete from orders where id like 'SF-%';
```

If nothing arrives: Supabase → Edge Functions → `send-order-email` → **Logs**
shows the error (most often a missing secret or a Resend key issue).
