import nodemailer, { type Transporter } from "nodemailer";
import { env, isProd } from "@/config/env.js";
import { Notification } from "@/models/index.js";

let transporter: Transporter | null = null;
if (env.SMTP_HOST && env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
}

export interface SendEmailOptions {
  userId: number;
  to: string;
  type: string;
  subject: string;
  title: string;
  body: string;
  html: string;
  relatedType?: string;
  relatedId?: number;
}

/**
 * Fire-and-forget email with retry (docs/07 §6) — callers never await delivery.
 * Without SMTP config, delivery falls back to a console log so every flow stays
 * fully exercisable in development; each send is recorded in `notifications`.
 */
export function sendEmailAsync(opts: SendEmailOptions): void {
  setImmediate(async () => {
    let sentAt: Date | null = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        if (transporter) {
          await transporter.sendMail({
            from: env.MAIL_FROM,
            to: opts.to,
            subject: opts.subject,
            html: opts.html,
            text: opts.body,
          });
        } else {
          console.log(`[email:console] to=${opts.to} subject="${opts.subject}" :: ${opts.body}`);
        }
        sentAt = new Date();
        break;
      } catch (err) {
        if (attempt === 3) console.error(`[email] failed after 3 attempts to=${opts.to}:`, err);
        else await new Promise((r) => setTimeout(r, attempt * 2000));
      }
    }

    try {
      await Notification.create({
        userId: opts.userId,
        type: opts.type,
        title: opts.title,
        body: opts.body,
        channel: "email",
        sentAt,
        relatedType: opts.relatedType ?? null,
        relatedId: opts.relatedId ?? null,
      });
    } catch (err) {
      if (!isProd) console.error("[email] failed to record notification:", err);
    }
  });
}

/** In-app notification (Phase-2 feed) — no email delivery. */
export async function notifyInApp(
  userId: number,
  type: string,
  title: string,
  body: string,
  related?: { type: string; id: number },
): Promise<void> {
  await Notification.create({
    userId,
    type,
    title,
    body,
    channel: "in_app",
    sentAt: new Date(),
    relatedType: related?.type ?? null,
    relatedId: related?.id ?? null,
  });
}
