// Supabase Edge Function — sends two emails when a new order is inserted:
//   1. a notification to the baker (ORDER_EMAIL_TO)
//   2. a recap to the customer (order.customerEmail)
//
// Triggered by a Database Webhook on INSERT into public.orders. The webhook
// sends { type, table, record, ... } where `record.data` is the full order.
//
// Required function secrets (Dashboard → Edge Functions → Manage secrets):
//   RESEND_API_KEY   — from resend.com
//   ORDER_EMAIL_TO   — baker notification address (e.g. sladkafazulka@gmail.com)
//   ORDER_EMAIL_FROM — verified sender, e.g. "Sladká fazuľka <objednavky@sladkafazulka.sk>"
//   WEBHOOK_SECRET   — optional shared secret checked against the x-webhook-secret header

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const ORDER_EMAIL_TO = Deno.env.get('ORDER_EMAIL_TO') ?? 'sladkafazulka@gmail.com';
const ORDER_EMAIL_FROM = Deno.env.get('ORDER_EMAIL_FROM') ?? 'Sladká fazuľka <onboarding@resend.dev>';
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET') ?? '';

const esc = (value: unknown) =>
  String(value ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string));

const isEmail = (value: unknown): value is string =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const fmtEur = (n: number) => `${n.toFixed(2).replace('.', ',')} €`;
const isCustomPrice = (pt?: string) => pt === 'from' || pt === 'individual' || pt === 'on_request';

type OrderItem = {
  quantity?: number;
  productName?: string;
  variant?: string;
  unitPrice?: number | null;
  priceType?: string;
  unitLabel?: string;
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

  // Item rows: baker version (compact) and customer version (with line price).
  const bakerItems =
    items.map((it) => `<li>${esc(it.quantity)}× ${esc(it.productName)}${it.variant ? ` — ${esc(it.variant)}` : ''}</li>`).join('') ||
    '<li>—</li>';

  const customerRows =
    items
      .map(
        (it) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #efe7df">
            ${esc(it.quantity)}× ${esc(it.productName)}${it.variant ? ` <span style="color:#9b6a86">— ${esc(it.variant)}</span>` : ''}
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #efe7df;text-align:right;white-space:nowrap">${esc(lineTotalText(it))}</td>
        </tr>`,
      )
      .join('') || '<tr><td>—</td><td></td></tr>';

  // 1) Baker notification
  const bakerHtml = `
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
      <ul style="margin:0 0 12px">${bakerItems}</ul>
      <p style="margin:0 0 4px"><strong>${esc(totalLabel)}:</strong> ${esc(totalValue)}</p>
      ${order.note ? `<p style="margin:8px 0 0"><strong>Poznámka:</strong> ${esc(order.note)}</p>` : ''}
    </div>`;

  // 2) Customer recap
  const customerHtml = `
    <div style="font-family:Arial,sans-serif;color:#3b2b26;line-height:1.6;max-width:560px">
      <h2 style="margin:0 0 6px;font-size:22px">Ďakujeme za vašu objednávku 🤍</h2>
      <p style="margin:0 0 16px;color:#6b5750">
        Toto je rekapitulácia vašej požiadavky <strong>${esc(order.id)}</strong>. Objednávka cez web je
        nezáväzný dopyt — <strong>potvrdená je až po vzájomnej dohode</strong>. Čoskoro sa vám ozvem.
      </p>
      ${order.pickupDate ? `<p style="margin:0 0 4px"><strong>Termín:</strong> ${esc(order.pickupDate)}</p>` : ''}
      <table style="width:100%;border-collapse:collapse;margin:12px 0">
        <tbody>${customerRows}</tbody>
        <tfoot>
          <tr>
            <td style="padding:12px 0 0;font-weight:bold">${esc(totalLabel)}</td>
            <td style="padding:12px 0 0;font-weight:bold;text-align:right">${esc(totalValue)}</td>
          </tr>
        </tfoot>
      </table>
      ${
        hasCustom
          ? `<p style="margin:8px 0 0;font-size:13px;color:#9b6a86">Niektoré položky majú cenu „od" alebo individuálnu — finálnu cenu potvrdíme po dohode.</p>`
          : ''
      }
      ${order.note ? `<p style="margin:12px 0 0"><strong>Vaša poznámka:</strong> ${esc(order.note)}</p>` : ''}
      <p style="margin:20px 0 0;color:#6b5750">S láskou,<br/>Sladká fazuľka</p>
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
        reply_to: ORDER_EMAIL_TO,
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
