import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInviteEmail({
  to,
  inviteLink,
  role,
  inviterName,
}: {
  to: string;
  inviteLink: string;
  role: string;
  inviterName?: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'AgileClause <onboarding@resend.dev>',
      to: [to],
      subject: "You've been invited to join AgileClause",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 40px 20px;">
            <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #2563eb; font-size: 28px; margin: 0;">AgileClause</h1>
                <p style="color: #64748b; margin-top: 8px;">AI for Contracts & Compliance</p>
              </div>

              <h2 style="color: #1e293b; font-size: 20px; margin-bottom: 16px;">You're Invited!</h2>

              <p style="color: #475569; line-height: 1.6;">
                ${inviterName ? `${inviterName} has` : 'You have been'} invited you to join AgileClause as a <strong style="color: #2563eb;">${role}</strong>.
              </p>

              <p style="color: #475569; line-height: 1.6;">
                Click the button below to create your account and get started.
              </p>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${inviteLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 500;">
                  Accept Invitation
                </a>
              </div>

              <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
                Or copy this link: <br>
                <a href="${inviteLink}" style="color: #2563eb; word-break: break-all;">${inviteLink}</a>
              </p>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">

              <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                This invitation will expire in 7 days.<br>
                If you didn't expect this invitation, you can ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send invite email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send invite email:', error);
    return { success: false, error };
  }
}
