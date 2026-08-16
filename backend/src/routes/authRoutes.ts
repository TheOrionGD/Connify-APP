import type { FastifyPluginAsync } from 'fastify';
import { env } from '../config/env';

// In-memory or database OTP cache for verification
const otpStore: Map<string, { otp: string; expiresAt: number }> = new Map();

async function sendOtpEmailHelper(toEmail: string, otp: string): Promise<boolean> {
  const brevoApiKey = env.BREVO_API_KEY;
  const smtpUser = env.SMTP_USER || 'godfrey.cs23@krct.ac.in';

  const subject = '🔒 [CONNIFY] Emergency Security Verification OTP Code';
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Connify Security Verification</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800&family=Plus+Jakarta+Sans:wght@400;600;700&family=Space+Grotesk:wght@500;700&display=swap');
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #090a0f; color: #ffffff; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; -webkit-font-smoothing: antialiased;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #090a0f; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width: 580px; background: #161926; border: 1px solid rgba(225, 29, 72, 0.3); border-radius: 16px; box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7); overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
              
              <!-- Header Bar -->
              <tr>
                <td style="background: linear-gradient(135deg, #161926 0%, #0f111a 100%); padding: 24px 32px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                  <table width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="left">
                        <div style="font-family: 'Orbitron', sans-serif; font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: 2px;">
                          <span style="color: #e11d48;">CONNIFY</span> <span style="font-size: 11px; color: #06b6d4; font-family: 'Space Grotesk', sans-serif; border: 1px solid #06b6d4; padding: 2px 8px; border-radius: 4px; vertical-align: middle; margin-left: 6px;">SAFETY MESH</span>
                        </div>
                      </td>
                      <td align="right">
                        <span style="font-family: 'Space Grotesk', sans-serif; font-size: 10px; font-weight: 700; color: #10b981; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">
                          ● ZERO-TRUST SECURE
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Hero & Main Content -->
              <tr>
                <td style="padding: 32px;">
                  <h1 style="font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0; letter-spacing: 0.5px;">
                    Authentication OTP Code
                  </h1>
                  <p style="font-size: 14px; line-height: 22px; color: #94a3b8; margin: 0 0 24px 0;">
                    You are completing emergency profile verification on the <strong style="color: #ffffff;">Connify Offline Mesh Network</strong>. Use the 7-digit One-Time Password below to complete your authentication.
                  </p>

                  <!-- High Impact OTP Box -->
                  <div style="background: linear-gradient(135deg, rgba(30, 35, 52, 0.9) 0%, rgba(15, 17, 26, 0.95) 100%); border: 2px solid #e11d48; border-radius: 14px; padding: 24px; text-align: center; margin: 0 0 28px 0; box-shadow: 0 0 25px rgba(225, 29, 72, 0.25);">
                    <div style="font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #94a3b8; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">
                      YOUR 7-DIGIT OTP CODE
                    </div>
                    <div style="font-family: 'Orbitron', monospace; font-size: 38px; font-weight: 900; color: #06b6d4; letter-spacing: 10px; text-shadow: 0 0 15px rgba(6, 182, 212, 0.5); padding: 8px 0;">
                      ${otp}
                    </div>
                    <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; color: #10b981; margin-top: 6px; font-weight: 600;">
                      ⏱️ Valid for 10 minutes from dispatch
                    </div>
                  </div>

                  <!-- Security Guidelines Grid -->
                  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                    <tr>
                      <td width="50%" style="padding-right: 8px; vertical-align: top;">
                        <div style="background: rgba(15, 17, 26, 0.6); border: 1px solid rgba(255,255,255,0.08); padding: 12px 14px; border-radius: 10px;">
                          <div style="font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #e11d48; margin-bottom: 4px;">
                            🛡️ DO NOT SHARE
                          </div>
                          <div style="font-size: 11px; color: #94a3b8; line-height: 16px;">
                            Connify staff will never request this OTP code via phone call or SMS.
                          </div>
                        </div>
                      </td>
                      <td width="50%" style="padding-left: 8px; vertical-align: top;">
                        <div style="background: rgba(15, 17, 26, 0.6); border: 1px solid rgba(255,255,255,0.08); padding: 12px 14px; border-radius: 10px;">
                          <div style="font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #06b6d4; margin-bottom: 4px;">
                            📍 GPS INTEGRITY
                          </div>
                          <div style="font-size: 11px; color: #94a3b8; line-height: 16px;">
                            Verification secures your local emergency beacon radius & offline key.
                          </div>
                        </div>
                      </td>
                    </tr>
                  </table>

                  <p style="font-size: 12px; color: #64748b; margin: 0; line-height: 18px;">
                    If you did not initiate this email verification request, please change your credentials immediately or contact Connify Incident Support.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background: #0f111a; padding: 20px 32px; border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
                  <div style="font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 600; color: #94a3b8; margin-bottom: 6px;">
                    CONNIFY DECENTRALIZED SAFETY & EMERGENCY PROTOCOL
                  </div>
                  <div style="font-size: 10px; color: #475569;">
                    End-to-End Cryptographic Zero-Trust Protocol • Render Cloud Node v2.4
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // 1. Try Brevo HTTP API (HTTPS port 443 - bypasses cloud outbound SMTP port blocking)
  if (brevoApiKey) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': brevoApiKey,
        },
        body: JSON.stringify({
          sender: { name: 'Connify Safety System', email: smtpUser },
          to: [{ email: toEmail }],
          subject: subject,
          htmlContent: htmlContent,
        }),
      });
      if (response.ok) {
        console.log(`[Brevo API] OTP email delivered successfully to ${toEmail}`);
        return true;
      } else {
        const errText = await response.text();
        console.warn(`[Brevo API] Dispatch failed: ${response.status} - ${errText}`);
      }
    } catch (err) {
      console.warn('[Brevo API Error] Exception during dispatch:', err);
    }
  }

  console.log(`[DEV MODE CONSOLE OTP] Email: ${toEmail} | Code: ${otp}`);
  return true;
}

export const authRoutes: FastifyPluginAsync = async (app) => {
  // POST /api/auth/send-email-otp
  app.post('/send-email-otp', async (request, reply) => {
    const { email } = request.body as { email?: string };
    if (!email || !email.includes('@')) {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_EMAIL', message: 'Valid email address is required.' },
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const otp = Math.floor(1000000 + Math.random() * 9000000).toString(); // 7-digit OTP
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(cleanEmail, { otp, expiresAt });

    // Send email asynchronously
    sendOtpEmailHelper(cleanEmail, otp);

    return reply.send({
      success: true,
      message: 'OTP verification code sent to email.',
      devOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  });

  // POST /api/auth/verify-email-otp
  app.post('/verify-email-otp', async (request, reply) => {
    const { email, otp } = request.body as { email?: string; otp?: string };
    if (!email || !otp) {
      return reply.status(400).send({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Email and OTP code are required.' },
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const storedRecord = otpStore.get(cleanEmail);

    if (!storedRecord || storedRecord.otp !== otp.trim()) {
      return reply.status(401).send({
        success: false,
        error: { code: 'INVALID_OTP', message: 'Invalid OTP verification code.' },
      });
    }

    if (Date.now() > storedRecord.expiresAt) {
      otpStore.delete(cleanEmail);
      return reply.status(401).send({
        success: false,
        error: { code: 'EXPIRED_OTP', message: 'OTP verification code has expired.' },
      });
    }

    // OTP Verified! Delete used code
    otpStore.delete(cleanEmail);

    return reply.send({
      success: true,
      message: 'Email OTP verified successfully.',
    });
  });
};
