/**
 * Example serverless endpoint for Vercel/Netlify-style runtimes.
 *
 * Keep this code server-side. EMAIL_API_KEY must never be sent to the browser.
 * Replace the mocked response with Resend, SendGrid, Postmark, or another provider.
 */
type EmailPayload = {
  customerSubject: string;
  bakerSubject: string;
  customerHtml: string;
  bakerHtml: string;
  order: {
    customerEmail: string;
  };
};

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const payload = (await request.json()) as EmailPayload;
  const apiKey = process.env.EMAIL_API_KEY;
  const from = process.env.EMAIL_FROM;
  const to = process.env.EMAIL_TO;

  if (!apiKey || !from || !to) {
    return Response.json({ error: 'Email service is not configured' }, { status: 500 });
  }

  // TODO: Connect a provider here, for example:
  // await resend.emails.send({ from, to, subject: payload.bakerSubject, html: payload.bakerHtml });
  // await resend.emails.send({ from, to: payload.order.customerEmail, subject: payload.customerSubject, html: payload.customerHtml });
  console.info('Email payload ready for provider', {
    customer: payload.order.customerEmail,
    baker: to,
    customerSubject: payload.customerSubject,
    bakerSubject: payload.bakerSubject,
  });

  return Response.json({ ok: true });
}
