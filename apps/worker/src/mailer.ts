export interface EmailMessage {
  to: string;
  from?: string;
  subject: string;
  text: string;
  html?: string;
  metadata?: Record<string, unknown>;
}

export interface MailerService {
  sendEmail(msg: EmailMessage): Promise<{ id: string; success: boolean }>;
}

export class LocalMailpitMailer implements MailerService {
  private baseUrl: string;

  constructor(baseUrl = process.env.MAILPIT_API_URL || "http://127.0.0.1:55324") {
    this.baseUrl = baseUrl;
  }

  public async sendEmail(msg: EmailMessage): Promise<{ id: string; success: boolean }> {
    const fromAddress = msg.from || "alerts@scrappy.io";
    const payload = {
      From: {
        Email: fromAddress,
        Name: "SCRAPPY Price Intelligence",
      },
      To: [
        {
          Email: msg.to,
        },
      ],
      Subject: msg.subject,
      Text: msg.text,
      HTML: msg.html || `<p>${msg.text}</p>`,
    };

    try {
      const res = await fetch(`${this.baseUrl}/api/v1/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Mailpit send failed (${res.status}): ${text}`);
      }

      const data = (await res.json()) as { ID?: string };
      return { id: data.ID || `mail-${Date.now()}`, success: true };
    } catch (err) {
      console.warn(`[LocalMailpitMailer] Failed to send email via ${this.baseUrl}:`, err);
      // In local testing, do not crash if mailpit is temporarily restarting
      return { id: `mock-${Date.now()}`, success: false };
    }
  }
}

export const defaultMailer: MailerService = new LocalMailpitMailer();
