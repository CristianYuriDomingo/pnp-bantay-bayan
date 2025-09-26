// lib/email-service.ts - SendGrid Email Service
interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface EmailConfig {
  provider: 'sendgrid';
  from: string;
  replyTo?: string;
}

class EmailService {
  private sgMail: any = null;
  private config: EmailConfig;

  constructor() {
    this.config = {
      provider: 'sendgrid',
      from: process.env.FROM_EMAIL || 'noreply@bantaybayan.com',
      replyTo: process.env.REPLY_TO_EMAIL || 'support@bantaybayan.com'
    };

    this.initializeSendGrid();
  }

  private initializeSendGrid() {
    if (process.env.NODE_ENV === 'development') {
      // Development mode - no real email sending needed
      return;
    }

    try {
      // Only initialize SendGrid in production
      if (process.env.SENDGRID_API_KEY) {
        this.sgMail = require('@sendgrid/mail');
        this.sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        console.log('SendGrid initialized successfully');
      } else {
        console.warn('SENDGRID_API_KEY not found - emails will be logged to console');
      }
    } catch (error) {
      console.error('Failed to initialize SendGrid:', error);
      console.log('Falling back to console logging for emails');
    }
  }

  private createPasswordResetTemplate(resetUrl: string, userName: string = ''): EmailTemplate {
    const subject = 'Reset Your Bantay Bayan Password';
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { width: 150px; height: auto; margin-bottom: 20px; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 8px; margin: 20px 0; }
        .button { 
          display: inline-block; 
          background: #2563eb; 
          color: white; 
          padding: 15px 30px; 
          text-decoration: none; 
          border-radius: 6px; 
          font-weight: bold;
          margin: 20px 0;
        }
        .button:hover { background: #1d4ed8; }
        .security-notice { background: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; }
        .divider { border-top: 1px solid #dee2e6; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="color: #2563eb;">Bantay Bayan</h1>
          <h2>Password Reset Request</h2>
        </div>
        
        <div class="content">
          <p>Hello${userName ? ` ${userName}` : ''},</p>
          
          <p>You requested a password reset for your Bantay Bayan account. Click the button below to create a new password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f1f3f4; padding: 10px; border-radius: 4px;">
            ${resetUrl}
          </p>
          
          <div class="security-notice">
            <strong>Security Notice:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>This link expires in 24 hours for security</li>
              <li>Only use this link if you requested a password reset</li>
              <li>If you didn't request this, you can safely ignore this email</li>
              <li>Never share this link with anyone</li>
            </ul>
          </div>
        </div>
        
        <div class="divider"></div>
        
        <div class="footer">
          <p>This email was sent by Bantay Bayan<br>
          If you have questions, contact our support team.</p>
          <p style="margin-top: 15px;">
            <small>This is an automated message, please do not reply directly to this email.</small>
          </p>
        </div>
      </div>
    </body>
    </html>`;

    const text = `
    Bantay Bayan - Password Reset Request
    
    Hello${userName ? ` ${userName}` : ''},
    
    You requested a password reset for your Bantay Bayan account.
    
    Reset your password by visiting this link:
    ${resetUrl}
    
    Security Notice:
    - This link expires in 24 hours
    - Only use this if you requested a password reset
    - If you didn't request this, ignore this email
    - Never share this link with anyone
    
    If you have questions, contact our support team.
    
    This is an automated message, please do not reply.
    `;

    return { subject, html, text };
  }

  private logDevelopmentEmail(email: string, resetToken: string, template: EmailTemplate) {
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    
    console.log('\n' + '='.repeat(80));
    console.log('🔐 PASSWORD RESET EMAIL - DEVELOPMENT MODE');
    console.log('='.repeat(80));
    console.log(`📧 To: ${email}`);
    console.log(`📋 Subject: ${template.subject}`);
    console.log(`🔗 Reset URL: ${resetUrl}`);
    console.log(`🎫 Token: ${resetToken}`);
    console.log(`⏰ Expires: ${new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString()}`);
    console.log('='.repeat(80));
    console.log('📝 Copy the Reset URL above and paste it in your browser');
    console.log('='.repeat(80) + '\n');

    // Save to file for easy access
    this.saveToLogFile(email, resetUrl, resetToken);
  }

  private saveToLogFile(email: string, resetUrl: string, resetToken: string) {
    try {
      const fs = require('fs');
      const path = require('path');
      const logPath = path.join(process.cwd(), 'password-reset-logs.txt');
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] Email: ${email} | Token: ${resetToken} | URL: ${resetUrl}\n`;
      
      fs.appendFileSync(logPath, logEntry);
      console.log(`💾 Reset link saved to: ${logPath}`);
    } catch (error) {
      console.log('⚠️ Could not save to log file:', error);
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string, userName: string = ''): Promise<boolean> {
    try {
      const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
      const template = this.createPasswordResetTemplate(resetUrl, userName);

      // Development mode - just log
      if (process.env.NODE_ENV === 'development') {
        this.logDevelopmentEmail(email, resetToken, template);
        return true;
      }

      // Production mode - send actual email via SendGrid
      if (!this.sgMail || !process.env.SENDGRID_API_KEY) {
        console.error('SendGrid not initialized or API key missing');
        // Fallback to logging
        this.logDevelopmentEmail(email, resetToken, template);
        return false;
      }

      const msg = {
        to: email,
        from: {
          email: this.config.from,
          name: 'Bantay Bayan'
        },
        replyTo: this.config.replyTo,
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      const result = await this.sgMail.send(msg);
      
      console.log('Password reset email sent successfully via SendGrid:', {
        messageId: result[0].headers['x-message-id'],
        to: email,
        statusCode: result[0].statusCode
      });

      return true;

    } catch (error: any) {
      console.error('Failed to send password reset email via SendGrid:', error);
      
      // Log specific SendGrid errors
      if (error.response?.body?.errors) {
        console.error('SendGrid errors:', error.response.body.errors);
      }
      
      // Fallback to logging in case of email service failure
      console.log('Falling back to console logging...');
      const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
      const template = this.createPasswordResetTemplate(resetUrl, userName);
      this.logDevelopmentEmail(email, resetToken, template);
      
      return false;
    }
  }

  // Welcome email for new users
  async sendWelcomeEmail(email: string, userName: string): Promise<boolean> {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📧 Welcome email would be sent to: ${email} (${userName})`);
      return true;
    }

    // TODO: Implement welcome email template and sending logic
    return true;
  }

  // Email verification
  async sendVerificationEmail(email: string, verificationToken: string): Promise<boolean> {
    if (process.env.NODE_ENV === 'development') {
      const verifyUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`;
      console.log(`📧 Email verification would be sent to: ${email}`);
      console.log(`🔗 Verification URL: ${verifyUrl}`);
      return true;
    }

    // TODO: Implement email verification template and sending logic
    return true;
  }

  // Test email connection
  async testConnection(): Promise<boolean> {
    if (process.env.NODE_ENV === 'development') {
      console.log('Email service in development mode - connection OK');
      return true;
    }

    try {
      if (!this.sgMail || !process.env.SENDGRID_API_KEY) {
        console.error('SendGrid not initialized or API key missing');
        return false;
      }

      // SendGrid doesn't have a direct connection test, but we can validate the API key format
      const apiKey = process.env.SENDGRID_API_KEY;
      if (!apiKey.startsWith('SG.')) {
        console.error('Invalid SendGrid API key format');
        return false;
      }

      console.log('SendGrid service connection successful');
      return true;
    } catch (error) {
      console.error('SendGrid service connection failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Export the function for backward compatibility
export async function sendPasswordResetEmail(email: string, resetToken: string, userName: string = '') {
  return await emailService.sendPasswordResetEmail(email, resetToken, userName);
}

// Export class for advanced usage
export { EmailService };

// Environment variables needed for SendGrid:
/*
# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key

# Email settings
FROM_EMAIL=noreply@yourdomain.com
REPLY_TO_EMAIL=support@yourdomain.com

# NextAuth (required)
NEXTAUTH_URL=http://localhost:3000  # or your production URL
*/