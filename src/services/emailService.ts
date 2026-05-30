import { Order } from '../types';
import { formatOrderItemLinePrice, getOrderPricingSummary, formatOrderEstimatedTotal } from '../utils/orderPricing';

type EmailPayload = {
  order: Order;
  customerSubject: string;
  bakerSubject: string;
  customerHtml: string;
  bakerHtml: string;
};

interface EmailAdapter {
  send(payload: EmailPayload): Promise<void>;
}

const escapeHtml = (value: unknown) =>
  String(value ?? '').replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });

const sanitizeSubject = (value: string) => value.replace(/[\r\n]+/g, ' ').trim();

const safeHttpUrl = (value?: string) => {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
};

const formatDate = (value?: string) =>
  value ? escapeHtml(new Date(value).toLocaleDateString('sk-SK')) : 'po dohode';

const renderItemDetails = (item: Order['items'][number]) => {
  if (item.cakeConfiguration) {
    const c = item.cakeConfiguration;
    const inspirationUrl = safeHttpUrl(c.inspirationUrl);
    return `
      <div style="margin-top:6px;font-size:13px;color:#555">
        <div>Korpus: <strong>${escapeHtml(c.baseName)}${c.baseVariant ? ` (${escapeHtml(c.baseVariant)})` : ''}</strong></div>
        <div>Krémy: <strong>${escapeHtml(c.creamNames.join('; '))}</strong></div>
        <div>Veľkosť: <strong>${escapeHtml(c.sizeName)} — ${escapeHtml(c.sizePortions)}</strong></div>
        ${c.note ? `<div>Poznámka: ${escapeHtml(c.note)}</div>` : ''}
        ${inspirationUrl ? `<div>Inšpirácia: <a href="${escapeHtml(inspirationUrl)}">${escapeHtml(inspirationUrl)}</a></div>` : ''}
      </div>
    `;
  }
  return item.note ? `<div style="margin-top:6px;font-size:13px;color:#555">Poznámka: ${escapeHtml(item.note)}</div>` : '';
};

const formatOrderItems = (order: Order) =>
  order.items
    .map((item) => {
      const linePrice = formatOrderItemLinePrice(item);
      return `<li><strong>${escapeHtml(item.quantity)}× ${escapeHtml(item.productName)}</strong> — ${escapeHtml(linePrice)}${renderItemDetails(item)}</li>`;
    })
    .join('');

const pickupModeLabel = (mode: Order['pickupMode']) => {
  if (!mode) return 'po dohode';
  return mode === 'delivery-agreed' ? 'Doručenie / servis (dohodou)' : 'Vyzdvihnutie v Košiciach (po dohode)';
};

const createEmailPayload = (order: Order): EmailPayload => {
  const pricing = { ...getOrderPricingSummary(order.items), estimatedTotal: order.estimatedTotal };
  const estimatedTotal = formatOrderEstimatedTotal(pricing);

  return {
    order,
    customerSubject: sanitizeSubject(`Rekapitulácia objednávky – Sladká fazuľka (${order.id})`),
    bakerSubject: sanitizeSubject(`Nová objednávka – Sladká fazuľka (${order.id})`),
    customerHtml: `
      <h1>Ďakujem za objednávku, ${escapeHtml(order.customerName)}</h1>
      <p>Prijali sme vašu nezáväznú objednávku a nižšie posielam rekapituláciu.</p>
      <ul>${formatOrderItems(order)}</ul>
      <p><strong>Termín:</strong> ${formatDate(order.pickupDate)}</p>
      <p><strong>Spôsob prevzatia:</strong> ${escapeHtml(pickupModeLabel(order.pickupMode))}</p>
      <p><strong>Predpokladaná suma:</strong> ${escapeHtml(estimatedTotal)}</p>
      ${pricing.hasCustomPricing ? '<p>Niektoré položky majú cenu „od" alebo individuálnu. Finálnu cenu potvrdím po vzájomnej dohode.</p>' : ''}
      <p>Objednávka je potvrdená až po vzájomnej dohode.</p>
    `,
    bakerHtml: `
      <h1>Nová objednávka ${escapeHtml(order.id)}</h1>
      <p><strong>Meno:</strong> ${escapeHtml(order.customerName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(order.customerEmail)}</p>
      <p><strong>Telefón:</strong> ${escapeHtml(order.customerPhone)}</p>
      <p><strong>Termín:</strong> ${formatDate(order.pickupDate)}</p>
      <p><strong>Spôsob prevzatia:</strong> ${escapeHtml(pickupModeLabel(order.pickupMode))}</p>
      <p><strong>Typ udalosti:</strong> ${escapeHtml(order.eventType || 'neuvedené')}</p>
      <p><strong>Počet porcií / hostí:</strong> ${escapeHtml(order.servings || 'neuvedené')}</p>
      <p><strong>Preferovaná príchuť:</strong> ${escapeHtml(order.preferredFlavor || 'neuvedené')}</p>
      <p><strong>Inšpirácia:</strong> ${escapeHtml(order.inspirationUrl || 'neuvedené')}</p>
      <ul>${formatOrderItems(order)}</ul>
      <p><strong>Predpokladaná suma:</strong> ${escapeHtml(estimatedTotal)}</p>
      ${pricing.hasCustomPricing ? '<p><em>Niektoré položky vyžadujú dohodu o finálnej cene.</em></p>' : ''}
      <p><strong>Poznámka:</strong> ${escapeHtml(order.note || 'žiadna')}</p>
    `,
  };
};

class MockEmailAdapter implements EmailAdapter {
  async send(payload: EmailPayload): Promise<void> {
    console.group('EMAIL MOCK - Sladká fazuľka');
    console.info('Endpoint nie je nastavený. V produkcii nastavte VITE_EMAIL_ENDPOINT na vlastný serverless endpoint.');
    console.info('Customer subject:', payload.customerSubject);
    console.info('Baker subject:', payload.bakerSubject);
    console.info('Order:', payload.order);
    console.groupEnd();
      await new Promise((resolve) => window.setTimeout(resolve, 500));
  }
}

class EndpointEmailAdapter implements EmailAdapter {
  constructor(private readonly endpoint: string) {}

  async send(payload: EmailPayload): Promise<void> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Emailová služba neodoslala rekapituláciu');
    }
  }
}

const createEmailAdapter = (): EmailAdapter | null => {
  const endpoint = (import.meta.env.VITE_EMAIL_ENDPOINT as string | undefined)?.trim();
  if (endpoint) return new EndpointEmailAdapter(endpoint);
  if (import.meta.env.DEV) return new MockEmailAdapter();
  return null;
};

class EmailService {
  private readonly adapter = createEmailAdapter();

  async sendOrderEmails(order: Order): Promise<boolean> {
    if (!this.adapter) {
      throw new Error('Emailový endpoint nie je nastavený');
    }

    await this.adapter.send(createEmailPayload(order));
    return true;
  }
}

export const emailService = new EmailService();
