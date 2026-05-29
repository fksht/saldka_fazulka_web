// Supabase Edge Function — emails the baker when a new order is inserted.
//
// Triggered by a Database Webhook on INSERT into public.orders. The webhook
// sends { type, table, record, ... } where `record` is the new row and
// `record.data` is the full order object (see dataService).
//
// Required function secrets (Dashboard → Edge Functions → Manage secrets):
//   RESEND_API_KEY   — from resend.com
//   ORDER_EMAIL_TO   — where to notify (e.g. sladkafazulka@gmail.com)
//   ORDER_EMAIL_FROM — optional; defaults to Resend's shared sender
//   WEBHOOK_SECRET   — optional shared secret; if set, the webhook must send
//                      it in the `x-webhook-secret` header

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const ORDER_EMAIL_TO = Deno.env.get('ORDER_EMAIL_TO') ?? 'sladkafazulka@gmail.com';
const ORDER_EMAIL_FROM = Deno.env.get('ORDER_EMAIL_FROM') ?? 'Sladká fazuľka <onboarding@resend.dev>';
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET') ?? '';

const esc = (value: unknown) =>
  String(value ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string));

type OrderItem = { quantity?: number; productName?: string; variant?: string };
type Order = {
  id?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  pickupDate?: string;
  pickupMode?: string;
  eventType?: string;
  servings?: number;
  note?: string;
  items?: OrderItem[];
  estimatedTotal?: number;
};

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
  const itemsHtml =
    items.map((it) => `<li>${esc(it.quantity)}× ${esc(it.productName)}${it.variant ? ` — ${esc(it.variant)}` : ''}</li>`).join('') ||
    '<li>—</li>';
  const total =
    typeof order.estimatedTotal === 'number' && order.estimatedTotal > 0
      ? `${order.estimatedTotal.toFixed(2)} €`
      : 'po dohode';

  const html = `
    <div style="font-family:Arial,sans-serif;color:#3b2b26;line-height:1.6">
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
      <ul style="margin:0 0 12px">${itemsHtml}</ul>
      <p style="margin:0 0 4px"><strong>Odhad ceny:</strong> ${esc(total)}</p>
      ${order.note ? `<p style="margin:8px 0 0"><strong>Poznámka:</strong> ${esc(order.note)}</p>` : ''}
    </div>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: ORDER_EMAIL_FROM,
      to: [ORDER_EMAIL_TO],
      reply_to: order.customerEmail || undefined,
      subject: `Nová objednávka ${order.id} — ${order.customerName ?? ''}`.trim(),
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Resend error', res.status, text);
    return new Response(`Email failed: ${res.status}`, { status: 502 });
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
});
