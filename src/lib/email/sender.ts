// Mock implementation of Cloudflare Email Worker sending logic
// In production, this would use the `send_email` binding or a service like Resend/SendGrid

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  icsContent?: string
) {
  console.log(`
  📧 [MOCK EMAIL SENT]
  To: ${to}
  Subject: ${subject}
  Body: ${text}
  Has ICS: ${!!icsContent}
  `);

  if (icsContent) {
    console.log('ICS Content Preview:', icsContent.substring(0, 100) + '...');
  }

  // In a real Cloudflare Worker with Email Routing or MailChannels:
  // await fetch('https://api.mailchannels.net/tx/v1/send', ...);
  // or use `env.EMAIL.send(...)` if using Cloudflare Queues/Email workers differently.

  return true;
}
