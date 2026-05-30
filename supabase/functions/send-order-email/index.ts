// @ts-nocheck — this is a Deno Edge Function (runs on Supabase, not in the Vite
// build). The project's TypeScript config doesn't know the Deno global, so type
// checks here are disabled; it is deployed separately via the Supabase dashboard.
//
// Sends two emails when a new order is inserted:
//   1. a notification to the baker (ORDER_EMAIL_TO)
//   2. a recap to the customer (order.customerEmail)
//
// Triggered by a Database Webhook on INSERT into public.orders, where
// `record.data` is the full order object.
//
// Function secrets (Dashboard → Edge Functions → Manage secrets):
//   RESEND_API_KEY, ORDER_EMAIL_TO, ORDER_EMAIL_FROM, WEBHOOK_SECRET
//   SITE_ORIGIN (optional) — base origin for product/logo image URLs
//   LOGO_URL (optional)    — absolute URL of the logo image

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const ORDER_EMAIL_TO = Deno.env.get('ORDER_EMAIL_TO') ?? 'sladkafazulka@gmail.com';
const ORDER_EMAIL_FROM = Deno.env.get('ORDER_EMAIL_FROM') ?? 'Sladká fazuľka <onboarding@resend.dev>';
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET') ?? '';
const SITE_ORIGIN = (Deno.env.get('SITE_ORIGIN') ?? 'https://fksht.github.io').replace(/\/$/, '');
const LOGO_URL =
  Deno.env.get('LOGO_URL') ?? 'https://fksht.github.io/saldka_fazulka_web/images/sladka-fazulka/logo.png';
const CONTACT_EMAIL = 'sladkafazulka@gmail.com';
const CONTACT_PHONE = '+421 911 410 544';

const esc = (value: unknown) =>
  String(value ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string));

const isEmail = (value: unknown): value is string =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const fmtEur = (n: number) => `${n.toFixed(2).replace('.', ',')} €`;
const isCustomPrice = (pt?: string) => pt === 'from' || pt === 'individual' || pt === 'on_request';

// Order items store a root-relative image path; make it absolute for email.
const absImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return SITE_ORIGIN + url;
  return ''; // data: URLs or unknown — skip
};

// Generic cake image (same folder as the logo), used as a fallback for custom
// cakes whose own image is a base64 preview that can't be shown in email.
const DEFAULT_CAKE_IMAGE = LOGO_URL.replace(/[^/]+$/, 'cake-3tier.jpg');

const formatDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
};

type CakeConfiguration = {
  baseName?: string;
  baseVariant?: string;
  creamNames?: string[];
  sizeName?: string;
  sizePortions?: string;
};
type OrderItem = {
  quantity?: number;
  productName?: string;
  variant?: string;
  unitPrice?: number | null;
  priceType?: string;
  imageUrl?: string;
  kind?: string;
  cakeConfiguration?: CakeConfiguration;
};
type Order = {
  id?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  pickupDate?: string;
  eventType?: string;
  servings?: number;
  note?: string;
  items?: OrderItem[];
  estimatedTotal?: number;
  createdAt?: string;
};

// Short description of a configured custom cake (korpus · krémy · veľkosť).
const cakeDescription = (cfg?: CakeConfiguration) => {
  if (!cfg) return '';
  const parts: string[] = [];
  if (cfg.baseName) parts.push(`Korpus: ${cfg.baseName}${cfg.baseVariant ? ` (${cfg.baseVariant})` : ''}`);
  if (cfg.creamNames && cfg.creamNames.length) parts.push(`Krémy: ${cfg.creamNames.join(', ')}`);
  if (cfg.sizeName) parts.push(`Veľkosť: ${cfg.sizeName}${cfg.sizePortions ? ` — ${cfg.sizePortions}` : ''}`);
  return parts.join(' · ');
};

const itemImage = (it: OrderItem) => {
  const img = absImageUrl(it.imageUrl);
  if (img) return img;
  return it.kind === 'custom-cake' ? DEFAULT_CAKE_IMAGE : '';
};

const lineTotalText = (it: OrderItem) => {
  if (it.unitPrice === null || it.unitPrice === undefined) {
    return it.priceType === 'individual' ? 'individuálne' : 'po dohode';
  }
  return `${it.priceType === 'from' ? 'od ' : ''}${fmtEur(it.unitPrice * (it.quantity ?? 1))}`;
};

const sendEmail = (payload: Record<string, unknown>) =>
  fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  if (WEBHOOK_SECRET && req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
    return new Response('Forbidden', { status: 403 });
  }
  if (!RESEND_API_KEY) return new Response('RESEND_API_KEY not set', { status: 500 });

  let body: { record?: { data?: Order }; data?: Order } & Partial<Order>;
  try {
    body = await req.json();
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }

  const order: Order = body?.record?.data ?? body?.data ?? (body as Order);
  if (!order?.id) return new Response('No order in payload', { status: 400 });

  const items = Array.isArray(order.items) ? order.items : [];
  const hasCustom = items.some((it) => isCustomPrice(it.priceType));
  const totalLabel = hasCustom ? 'Predpokladaná suma' : 'Celková suma';
  const totalValue =
    typeof order.estimatedTotal === 'number' && order.estimatedTotal > 0
      ? `${hasCustom ? 'od ' : ''}${fmtEur(order.estimatedTotal)}`
      : 'Cena po dohode';

  const logoHeader = `
    <div style="text-align:center;padding:8px 0 4px">
      <img src="${LOGO_URL}" alt="Sladká fazuľka" width="140" style="max-width:140px;height:auto" />
    </div>`;

  // Baker notification (compact list)
  const bakerItems =
    items.map((it) => `<li>${esc(it.quantity)}× ${esc(it.productName)}${it.variant ? ` — ${esc(it.variant)}` : ''}</li>`).join('') ||
    '<li>—</li>';
  const bakerHtml = `
    <div style="font-family:Arial,sans-serif;color:#3b2b26;line-height:1.6">
      ${logoHeader}
      <h2 style="margin:0 0 8px">Nová objednávka ${esc(order.id)}</h2>
      <p style="margin:0 0 12px">
        <strong>Zákazník:</strong> ${esc(order.customerName)}<br/>
        <strong>Email:</strong> ${esc(order.customerEmail)}<br/>
        <strong>Telefón:</strong> ${esc(order.customerPhone)}
      </p>
      ${order.pickupDate ? `<p style="margin:0 0 4px"><strong>Termín:</strong> ${esc(order.pickupDate)}</p>` : ''}
      ${order.eventType ? `<p style="margin:0 0 4px"><strong>Udalosť:</strong> ${esc(order.eventType)}</p>` : ''}
      ${order.servings ? `<p style="margin:0 0 4px"><strong>Počet porcií:</strong> ${esc(order.servings)}</p>` : ''}
      <p style="margin:12px 0 4px"><strong>Položky:</strong></p>
      <ul style="margin:0 0 12px">${bakerItems}</ul>
      <p style="margin:0 0 4px"><strong>${esc(totalLabel)}:</strong> ${esc(totalValue)}</p>
      ${order.note ? `<p style="margin:8px 0 0"><strong>Poznámka:</strong> ${esc(order.note)}</p>` : ''}
    </div>`;

  // Customer recap (with product thumbnails)
  const customerRows =
    items
      .map((it) => {
        const img = itemImage(it);
        const thumb = img
          ? `<img src="${img}" alt="" width="48" height="48" style="border-radius:8px;display:block;object-fit:cover" />`
          : '';
        const desc = cakeDescription(it.cakeConfiguration);
        return `
        <tr>
          <td width="56" style="padding:8px 0;border-bottom:1px solid #efe7df;vertical-align:top">${thumb}</td>
          <td style="padding:8px 0;border-bottom:1px solid #efe7df;vertical-align:top">
            ${esc(it.quantity)}× ${esc(it.productName)}${it.variant ? ` <span style="color:#9b6a86">— ${esc(it.variant)}</span>` : ''}
            ${desc ? `<div style="font-size:12px;color:#9a8c84;margin-top:2px">${esc(desc)}</div>` : ''}
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #efe7df;text-align:right;white-space:nowrap;vertical-align:top">${esc(lineTotalText(it))}</td>
        </tr>`;
      })
      .join('') || '<tr><td colspan="3">—</td></tr>';

  const customerHtml = `
    <div style="font-family:Arial,sans-serif;color:#3b2b26;line-height:1.6;max-width:580px;margin:0 auto">
      ${logoHeader}
      <h2 style="margin:0 0 6px;font-size:22px;text-align:center">Ďakujem za vašu objednávku 🤍</h2>
      <p style="margin:0 0 16px;color:#6b5750">
        Toto je rekapitulácia vašej požiadavky <strong>${esc(order.id)}</strong>. Objednávka cez web je
        nezáväzný dopyt — <strong>potvrdená je až po vzájomnej dohode</strong>. Čoskoro sa vám ozvem.
      </p>
      <p style="margin:0 0 4px"><strong>Dátum objednávky:</strong> ${esc(formatDate(order.createdAt))}</p>
      <table style="width:100%;border-collapse:collapse;margin:12px 0">
        <tbody>${customerRows}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:12px 0 0;font-weight:bold">${esc(totalLabel)}</td>
            <td style="padding:12px 0 0;font-weight:bold;text-align:right">${esc(totalValue)}</td>
          </tr>
        </tfoot>
      </table>
      ${
        hasCustom
          ? `<p style="margin:8px 0 0;font-size:13px;color:#9b6a86">Niektoré položky majú cenu „od" alebo individuálnu — finálnu cenu potvrdím po dohode.</p>`
          : ''
      }
      ${order.note ? `<p style="margin:12px 0 0"><strong>Vaša poznámka:</strong> ${esc(order.note)}</p>` : ''}
      <p style="margin:20px 0 0;color:#6b5750">S láskou,<br/>Sladká fazuľka</p>
      <hr style="border:none;border-top:1px solid #efe7df;margin:20px 0 12px" />
      <p style="margin:0;font-size:12px;color:#9a8c84;text-align:center">
        Toto je automaticky generovaný email — prosím, <strong>neodpovedajte naň</strong>.<br/>
        V prípade otázok ma kontaktujte na ${esc(CONTACT_EMAIL)} alebo ${esc(CONTACT_PHONE)}.
      </p>
    </div>`;

  // Baker email is the important one — fail loudly if it doesn't send.
  const bakerRes = await sendEmail({
    from: ORDER_EMAIL_FROM,
    to: [ORDER_EMAIL_TO],
    reply_to: isEmail(order.customerEmail) ? order.customerEmail : undefined,
    subject: `Nová objednávka ${order.id} — ${order.customerName ?? ''}`.trim(),
    html: bakerHtml,
  });
  if (!bakerRes.ok) {
    console.error('Resend baker error', bakerRes.status, await bakerRes.text());
    return new Response(`Baker email failed: ${bakerRes.status}`, { status: 502 });
  }

  // Customer recap is best-effort — never block on a bad/missing address.
  if (isEmail(order.customerEmail)) {
    try {
      const custRes = await sendEmail({
        from: ORDER_EMAIL_FROM,
        to: [order.customerEmail],
        subject: `Vaša objednávka ${order.id} — Sladká fazuľka`,
        html: customerHtml,
      });
      if (!custRes.ok) console.error('Resend customer error', custRes.status, await custRes.text());
    } catch (error) {
      console.error('Customer email exception', error);
    }
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
});
