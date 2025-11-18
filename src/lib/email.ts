// lib/email.ts - Resend Email Service Integration
// Install: npm install resend
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Email templates
const EMAIL_FROM = process.env.EMAIL_FROM || 'Bantay Bayan <noreply@yourdomain.com>';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using Resend
 */
async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [to],
      subject,
      html,
      text: text || undefined,
    });

    if (error) {
      console.error('❌ Resend email error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('✅ Email sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
  name: string = ''
) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;
  const firstName = name.split(' ')[0] || 'there';

  // Development mode - log to console
  if (process.env.NODE_ENV === 'development') {
    console.log('\n' + '='.repeat(80));
    console.log('📧 EMAIL VERIFICATION - DEVELOPMENT MODE');
    console.log('='.repeat(80));
    console.log(`User: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Verification URL: ${verificationUrl}`);
    console.log(`Token Expires: ${new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString()}`);
    console.log('='.repeat(80));
    console.log('📋 Copy the Verification URL above and paste it in your browser');
    console.log('='.repeat(80) + '\n');

    // Save to log file
    try {
      const fs = require('fs');
      const path = require('path');
      const logPath = path.join(process.cwd(), 'email-verification-logs.txt');
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] ${name} (${email}) | ${verificationUrl}\n`;
      fs.appendFileSync(logPath, logEntry);
      console.log(`✅ Verification link saved to: ${logPath}\n`);
    } catch (err) {
      console.log('⚠️  Could not save to log file\n');
    }

    // Skip actual email in development if RESEND_API_KEY is not set
    if (!process.env.RESEND_API_KEY) {
      console.log('ℹ️  Skipping actual email send (no RESEND_API_KEY)');
      return { success: true, dev: true };
    }
  }

  // Production or development with API key - send real email
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
          <td align="center">
            <!-- Main Container -->
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Welcome to Bantay Bayan!</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 16px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                    Hi <strong>${firstName}</strong>,
                  </p>
                  
                  <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Thank you for signing up! We're excited to have you on board. To complete your registration and activate your account, please verify your email address by clicking the button below:
                  </p>

                  <!-- Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${verificationUrl}" 
                           style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                          Verify Email Address
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    Or copy and paste this link into your browser:
                  </p>
                  <p style="margin: 8px 0 24px; color: #3b82f6; font-size: 14px; word-break: break-all;">
                    ${verificationUrl}
                  </p>

                  <!-- Info Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px; margin-top: 24px;">
                    <tr>
                      <td style="padding: 16px;">
                        <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                          <strong>⏰ Important:</strong> This verification link will expire in 24 hours for security reasons.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    If you didn't create an account with Bantay Bayan, you can safely ignore this email.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                    Need help? Contact our support team
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    © ${new Date().getFullYear()} Bantay Bayan. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `
    Welcome to Bantay Bayan!

    Hi ${firstName},

    Thank you for signing up! To complete your registration and activate your account, please verify your email address by visiting this link:

    ${verificationUrl}

    This verification link will expire in 24 hours for security reasons.

    If you didn't create an account with Bantay Bayan, you can safely ignore this email.

    Need help? Contact our support team.

    © ${new Date().getFullYear()} Bantay Bayan. All rights reserved.
  `;

  return await sendEmail({
    to: email,
    subject: 'Verify Your Email Address - Bantay Bayan',
    html,
    text,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  name: string = ''
) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  const firstName = name.split(' ')[0] || 'there';

  // Development mode - log to console
  if (process.env.NODE_ENV === 'development') {
    console.log('\n' + '='.repeat(80));
    console.log('🔐 PASSWORD RESET - DEVELOPMENT MODE');
    console.log('='.repeat(80));
    console.log(`User: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`Token Expires: ${new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString()}`);
    console.log('='.repeat(80));
    console.log('📋 Copy the Reset URL above and paste it in your browser');
    console.log('='.repeat(80) + '\n');

    // Save to log file
    try {
      const fs = require('fs');
      const path = require('path');
      const logPath = path.join(process.cwd(), 'password-reset-logs.txt');
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] ${email} | ${resetUrl}\n`;
      fs.appendFileSync(logPath, logEntry);
      console.log(`✅ Reset link saved to: ${logPath}\n`);
    } catch (err) {
      console.log('⚠️  Could not save to log file\n');
    }

    // Skip actual email in development if RESEND_API_KEY is not set
    if (!process.env.RESEND_API_KEY) {
      console.log('ℹ️  Skipping actual email send (no RESEND_API_KEY)');
      return { success: true, dev: true };
    }
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Password Reset Request</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 16px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                    Hi <strong>${firstName}</strong>,
                  </p>
                  
                  <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    We received a request to reset your password for your Bantay Bayan account. Click the button below to create a new password:
                  </p>

                  <!-- Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${resetUrl}" 
                           style="display: inline-block; background-color: #ef4444; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    Or copy and paste this link into your browser:
                  </p>
                  <p style="margin: 8px 0 24px; color: #ef4444; font-size: 14px; word-break: break-all;">
                    ${resetUrl}
                  </p>

                  <!-- Warning Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px; margin-top: 24px;">
                    <tr>
                      <td style="padding: 16px;">
                        <p style="margin: 0 0 8px; color: #991b1b; font-size: 14px; line-height: 1.6;">
                          <strong>⏰ Security Notice:</strong>
                        </p>
                        <ul style="margin: 0; padding-left: 20px; color: #991b1b; font-size: 14px; line-height: 1.6;">
                          <li>This link will expire in 24 hours</li>
                          <li>If you didn't request this, please ignore this email</li>
                          <li>Your password won't change until you create a new one</li>
                        </ul>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    If you didn't request a password reset, please ignore this email or contact support if you have concerns about your account security.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                    Need help? Contact our support team
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    © ${new Date().getFullYear()} Bantay Bayan. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `
    Password Reset Request

    Hi ${firstName},

    We received a request to reset your password for your Bantay Bayan account. Visit this link to create a new password:

    ${resetUrl}

    Security Notice:
    - This link will expire in 24 hours
    - If you didn't request this, please ignore this email
    - Your password won't change until you create a new one

    If you didn't request a password reset, please ignore this email or contact support if you have concerns about your account security.

    Need help? Contact our support team.

    © ${new Date().getFullYear()} Bantay Bayan. All rights reserved.
  `;

  return await sendEmail({
    to: email,
    subject: 'Reset Your Password - Bantay Bayan',
    html,
    text,
  });
}

/**
 * Send welcome email (after verification)
 */
export async function sendWelcomeEmail(email: string, name: string = '') {
  const firstName = name.split(' ')[0] || 'there';
  const dashboardUrl = `${process.env.NEXTAUTH_URL}/users/dashboard`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Bantay Bayan</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🎉 Welcome Aboard!</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 16px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                    Hi <strong>${firstName}</strong>,
                  </p>
                  
                  <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Your email has been verified successfully! You're all set to start your journey with Bantay Bayan.
                  </p>

                  <!-- Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${dashboardUrl}" 
                           style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                          Go to Dashboard
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 24px 0 16px; color: #1f2937; font-size: 16px; font-weight: 600;">
                    What's next?
                  </p>
                  
                  <ul style="margin: 0 0 24px; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
                    <li>Complete your profile</li>
                    <li>Explore learning modules</li>
                    <li>Take quizzes to earn XP</li>
                    <li>Complete daily quests</li>
                    <li>Climb the leaderboard</li>
                  </ul>

                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ecfdf5; border-left: 4px solid #10b981; border-radius: 4px; margin-top: 24px;">
                    <tr>
                      <td style="padding: 16px;">
                        <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 1.6;">
                          <strong>💡 Pro Tip:</strong> Complete your daily quests to earn bonus XP and climb the ranks faster!
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                    Need help getting started? Contact our support team
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    © ${new Date().getFullYear()} Bantay Bayan. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `
    Welcome to Bantay Bayan!

    Hi ${firstName},

    Your email has been verified successfully! You're all set to start your journey with Bantay Bayan.

    Go to your dashboard: ${dashboardUrl}

    What's next?
    - Complete your profile
    - Explore learning modules
    - Take quizzes to earn XP
    - Complete daily quests
    - Climb the leaderboard

    Pro Tip: Complete your daily quests to earn bonus XP and climb the ranks faster!

    Need help getting started? Contact our support team.

    © ${new Date().getFullYear()} Bantay Bayan. All rights reserved.
  `;

  return await sendEmail({
    to: email,
    subject: 'Welcome to Bantay Bayan! 🎉',
    html,
    text,
  });
}

// Export main email functions
export { sendEmail };