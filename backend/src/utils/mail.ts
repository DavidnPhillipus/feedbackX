function fromAddress(): string {
  return process.env.RESEND_FROM || process.env.SMTP_FROM || "feedbackX <onboarding@resend.dev>";
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY || (process.env.SMTP_HOST && process.env.SMTP_USER));
}

function emailShell(title: string, bodyHtml: string, actionUrl: string, actionLabel: string): string {
  return `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111;max-width:520px;margin:0 auto;padding:24px;">
  <h1 style="font-size:1.25rem;margin:0 0 16px;">${title}</h1>
  ${bodyHtml}
  <p style="margin:24px 0;">
    <a href="${actionUrl}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;">${actionLabel}</a>
  </p>
  <p style="font-size:0.875rem;color:#666;word-break:break-all;">Or copy this link: ${actionUrl}</p>
  <p style="font-size:0.75rem;color:#999;margin-top:32px;">If you did not request this, you can ignore this email.</p>
</body>
</html>`;
}

async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromAddress(),
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    });
    if (error) {
      throw new Error(error.message);
    }
    return;
  }

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  if (host && user) {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: fromAddress(),
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    });
    return;
  }

  console.log(`[email] to=${opts.to} subject=${opts.subject}`);
  console.log(opts.text);
}

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  const subject = "Reset your feedbackX password";
  const text = `Reset your password using this link (expires in 1 hour): ${resetUrl}`;
  const html = emailShell(
    "Reset your password",
    "<p>We received a request to reset your feedbackX password. This link expires in 1 hour.</p>",
    resetUrl,
    "Reset password"
  );

  await sendEmail({ to: email, subject, text, html });
}

export async function sendVerificationEmail(email: string, verifyUrl: string): Promise<void> {
  const subject = "Confirm your feedbackX account";
  const text = `Confirm your email to finish signing up (link expires in 24 hours): ${verifyUrl}`;
  const html = emailShell(
    "Confirm your email",
    "<p>Thanks for signing up for feedbackX. Confirm your email address to activate your account.</p>",
    verifyUrl,
    "Confirm email"
  );

  await sendEmail({ to: email, subject, text, html });
}
