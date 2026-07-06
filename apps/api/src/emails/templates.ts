import { env } from "@/config/env.js";

interface EmailTemplate {
  subject: string;
  title: string;
  body: string;
  html: string;
}

function layout(title: string, contentHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#18181b;font-family:Arial,Helvetica,sans-serif;color:#e4e4e7;">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
      <h2 style="color:#fafafa;margin:0 0 8px;">EventSphere</h2>
      <div style="background:#27272a;border-radius:16px;padding:24px;">
        <h3 style="margin:0 0 12px;color:#fafafa;">${title}</h3>
        ${contentHtml}
      </div>
      <p style="color:#71717a;font-size:12px;margin-top:16px;">
        You received this email because you have an EventSphere account.
      </p>
    </div>
  </body>
</html>`;
}

function button(url: string, label: string): string {
  return `<p style="margin:20px 0;"><a href="${url}" style="background:#fafafa;color:#18181b;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">${label}</a></p>
<p style="color:#a1a1aa;font-size:13px;">Or copy this link: <br/><span style="word-break:break-all;">${url}</span></p>`;
}

export function verificationEmail(name: string, token: string): EmailTemplate {
  const url = `${env.FRONTEND_URL}/verify-email?token=${token}`;
  const title = "Verify your email";
  const body = `Hi ${name}, confirm your email address to activate bookings on your account. Verify here: ${url}`;
  return {
    subject: "Verify your EventSphere email",
    title,
    body,
    html: layout(title, `<p>${body}</p>${button(url, "Verify email")}<p style="color:#a1a1aa;font-size:13px;">This link expires in 24 hours.</p>`),
  };
}

export function passwordResetEmail(name: string, token: string): EmailTemplate {
  const url = `${env.FRONTEND_URL}/reset-password?token=${token}`;
  const title = "Reset your password";
  const body = `Hi ${name}, we received a request to reset your EventSphere password. Reset here: ${url}`;
  return {
    subject: "Reset your EventSphere password",
    title,
    body,
    html: layout(title, `<p>${body}</p>${button(url, "Reset password")}<p style="color:#a1a1aa;font-size:13px;">This link expires in 1 hour. If you did not request this, ignore this email.</p>`),
  };
}

export function organizerDecisionEmail(name: string, approved: boolean, reason?: string): EmailTemplate {
  const title = approved ? "Organizer application approved" : "Organizer application update";
  const body = approved
    ? `Hi ${name}, your organizer application has been approved. You can now create and manage events.`
    : `Hi ${name}, your organizer application was not approved.${reason ? ` Reason: ${reason}` : ""}`;
  return {
    subject: title,
    title,
    body,
    html: layout(title, `<p>${body}</p>${button(`${env.FRONTEND_URL}/organizer`, "Open dashboard")}`),
  };
}

export function eventDecisionEmail(name: string, eventTitle: string, approved: boolean, reason?: string): EmailTemplate {
  const title = approved ? "Event published" : "Event rejected";
  const body = approved
    ? `Hi ${name}, your event "${eventTitle}" was approved and is now live.`
    : `Hi ${name}, your event "${eventTitle}" was rejected.${reason ? ` Reason: ${reason}` : ""}`;
  return { subject: `${title}: ${eventTitle}`, title, body, html: layout(title, `<p>${body}</p>`) };
}

export function bookingConfirmedEmail(name: string, eventTitle: string, bookingNumber: string): EmailTemplate {
  const title = "Booking confirmed";
  const body = `Hi ${name}, your booking ${bookingNumber} for "${eventTitle}" is confirmed. Your QR tickets are available in your account.`;
  return {
    subject: `Booking confirmed — ${eventTitle}`,
    title,
    body,
    html: layout(title, `<p>${body}</p>${button(`${env.FRONTEND_URL}/account/bookings`, "View tickets")}`),
  };
}

export function bookingCancelledEmail(name: string, eventTitle: string, bookingNumber: string): EmailTemplate {
  const title = "Booking cancelled";
  const body = `Hi ${name}, your booking ${bookingNumber} for "${eventTitle}" has been cancelled.`;
  return { subject: `Booking cancelled — ${eventTitle}`, title, body, html: layout(title, `<p>${body}</p>`) };
}

export function eventCancelledEmail(name: string, eventTitle: string): EmailTemplate {
  const title = "Event cancelled";
  const body = `Hi ${name}, the event "${eventTitle}" you booked has been cancelled by the organizer. Refunds are processed per policy.`;
  return { subject: `Event cancelled — ${eventTitle}`, title, body, html: layout(title, `<p>${body}</p>`) };
}

export function eventReminderEmail(name: string, eventTitle: string, when: string): EmailTemplate {
  const title = "Event reminder";
  const body = `Hi ${name}, reminder: "${eventTitle}" starts ${when}. Have your QR ticket ready.`;
  return { subject: `Reminder — ${eventTitle}`, title, body, html: layout(title, `<p>${body}</p>`) };
}
