import { Order } from '../types';

type EmailPayload = {
  order: Order;
  customerSubject: string;
  bakerSubject: string;
  customerHtml: string;
  bakerHtml: string;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' }).format(value);

const formatOrderItems = (order: Order) =>
  order.items
    .map((item) => {
      const price = item.unitPrice ? formatCurrency(item.unitPrice * item.quantity) : 'cena po dohode';
      return `<li><strong>${item.quantity}x ${item.productName}</strong> - ${price}${item.note ? `<br/>Poznámka: ${item.note}` : ''}</li>`;
    })
    .join('');

const createEmailPayload = (order: Order): EmailPayload => {
  const estimatedTotal =
    order.estimatedTotal > 0 ? formatCurrency(order.estimatedTotal) : 'Cena bude potvrdená po dohode';
  const hasCustomPricing = order.items.some((item) => item.priceType === 'on_request');

  return {
    order,
    customerSubject: `Rekapitulácia objednávky - Sladká fazuľka (${order.id})`,
    bakerSubject: `Nová objednávka - Sladká fazuľka (${order.id})`,
    customerHtml: `
      <h1>Ďakujeme za objednávku, ${order.customerName}</h1>
      <p>Prijali sme vašu nezáväznú objednávku a nižšie posielame rekapituláciu.</p>
      <ul>${formatOrderItems(order)}</ul>
      <p><strong>Termín:</strong> ${new Date(order.pickupDate).toLocaleDateString('sk-SK')}</p>
      <p><strong>Predpokladaná suma:</strong> ${estimatedTotal}</p>
      ${
        hasCustomPricing
          ? '<p>Objednávka obsahuje položku s individuálnou cenou. Finálnu cenu potvrdíme po vzájomnej dohode.</p>'
          : ''
      }
      <p>Objednávka je potvrdená až po vzájomnej dohode.</p>
    `,
    bakerHtml: `
      <h1>Nová objednávka ${order.id}</h1>
      <p><strong>Meno:</strong> ${order.customerName}</p>
      <p><strong>Email:</strong> ${order.customerEmail}</p>
      <p><strong>Telefón:</strong> ${order.customerPhone}</p>
      <p><strong>Termín:</strong> ${new Date(order.pickupDate).toLocaleDateString('sk-SK')}</p>
      <p><strong>Typ udalosti:</strong> ${order.eventType || 'neuvedené'}</p>
      <p><strong>Počet porcií:</strong> ${order.servings || 'neuvedené'}</p>
      <p><strong>Preferovaná príchuť:</strong> ${order.preferredFlavor || 'neuvedené'}</p>
      <p><strong>Inšpirácia:</strong> ${order.inspirationUrl || 'neuvedené'}</p>
      <ul>${formatOrderItems(order)}</ul>
      <p><strong>Predpokladaná suma:</strong> ${estimatedTotal}</p>
      <p><strong>Poznámka:</strong> ${order.note || 'žiadna'}</p>
    `,
  };
};

class EmailService {
  private readonly endpoint = import.meta.env.VITE_EMAIL_ENDPOINT as string | undefined;

  async sendOrderEmails(order: Order): Promise<boolean> {
    const payload = createEmailPayload(order);

    if (!this.endpoint) {
      this.logMockEmail(payload);
      await new Promise((resolve) => window.setTimeout(resolve, 500));
      return true;
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Emailová služba neodoslala rekapituláciu');
    }

    return true;
  }

  private logMockEmail(payload: EmailPayload) {
    console.group('EMAIL MOCK - Sladká fazuľka');
    console.info('Endpoint nie je nastavený. V produkcii nastavte VITE_EMAIL_ENDPOINT na vlastný serverless endpoint.');
    console.info('Customer subject:', payload.customerSubject);
    console.info('Baker subject:', payload.bakerSubject);
    console.info('Order:', payload.order);
    console.groupEnd();
  }
}

export const emailService = new EmailService();
