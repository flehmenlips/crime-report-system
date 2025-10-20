import { Resend } from 'resend'

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY)

// Email configuration
export const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'Crime Report System <onboarding@resend.dev>', // Use environment variable or fallback to test domain
  replyTo: process.env.EMAIL_REPLY_TO || 'onboarding@resend.dev',
  companyName: 'Crime Report System',
  websiteUrl: process.env.NEXTAUTH_URL || 'https://www.remise.farm'
}

// Email templates
export const EMAIL_TEMPLATES = {
  // Account verification email
  verification: {
    subject: 'Verify Your Account - Crime Report System',
    template: (name: string, verificationLink: string) => ({
      subject: 'Verify Your Account - Crime Report System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Account</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .footer { background: #f9fafb; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; font-size: 14px; color: #6b7280; }
            .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .button:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3); }
            .security-note { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔐 Verify Your Account</h1>
            <p>Welcome to the Crime Report System</p>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Thank you for registering with the Crime Report System. To complete your account setup and start using our platform, please verify your email address.</p>
            
            <div style="text-align: center;">
              <a href="${verificationLink}" class="button">Verify My Account</a>
            </div>
            
            <div class="security-note">
              <strong>⚠️ Security Note:</strong> This verification link will expire in 24 hours. If you didn't create this account, please ignore this email.
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f3f4f6; padding: 12px; border-radius: 6px; font-family: monospace;">${verificationLink}</p>
          </div>
          <div class="footer">
            <p>© 2024 Crime Report System. All rights reserved.</p>
            <p>This email was sent to verify your account registration.</p>
          </div>
        </body>
        </html>
      `
    })
  },

  // Welcome email after verification
  welcome: {
    subject: 'Welcome to Crime Report System!',
    template: (name: string, role: string) => ({
      subject: 'Welcome to Crime Report System!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Crime Report System</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .footer { background: #f9fafb; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; font-size: 14px; color: #6b7280; }
            .button { display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .feature { background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 16px 0; border-radius: 0 8px 8px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Welcome to Crime Report System!</h1>
            <p>Your account is now active and ready to use</p>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Congratulations! Your account has been successfully verified and activated. You can now access all features of the Crime Report System.</p>
            
            <h3>Your Role: ${role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}</h3>
            
            <div class="feature">
              <strong>📋 Report Stolen Items:</strong> Document and track stolen property with detailed information and evidence.
            </div>
            
            <div class="feature">
              <strong>📸 Upload Evidence:</strong> Add photos, videos, and documents to support your reports.
            </div>
            
            <div class="feature">
              <strong>📊 Generate Reports:</strong> Create professional reports for insurance and law enforcement.
            </div>
            
            <div class="feature">
              <strong>🔍 Advanced Search:</strong> Find items quickly with powerful search and filtering options.
            </div>
            
            <div style="text-align: center;">
              <a href="${EMAIL_CONFIG.websiteUrl}" class="button">Access Your Dashboard</a>
            </div>
            
            <p>Need help getting started? Contact our support team or check out our documentation.</p>
          </div>
          <div class="footer">
            <p>© 2024 Crime Report System. All rights reserved.</p>
            <p>This email was sent to confirm your successful account verification.</p>
          </div>
        </body>
        </html>
      `
    })
  },

  // Password reset email
  passwordReset: {
    subject: 'Reset Your Password - Crime Report System',
    template: (name: string, resetLink: string) => ({
      subject: 'Reset Your Password - Crime Report System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .footer { background: #f9fafb; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; font-size: 14px; color: #6b7280; }
            .button { display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .security-note { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔒 Reset Your Password</h1>
            <p>Secure password reset for Crime Report System</p>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>We received a request to reset your password for your Crime Report System account.</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset My Password</a>
            </div>
            
            <div class="security-note">
              <strong>⚠️ Security Note:</strong> This password reset link will expire in 1 hour for security reasons. If you didn't request this reset, please ignore this email and your password will remain unchanged.
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f3f4f6; padding: 12px; border-radius: 6px; font-family: monospace;">${resetLink}</p>
          </div>
          <div class="footer">
            <p>© 2024 Crime Report System. All rights reserved.</p>
            <p>This email was sent for password reset security purposes.</p>
          </div>
        </body>
        </html>
      `
    })
  },

  // User invitation email
  invitation: {
    subject: 'You\'ve been invited to join Crime Report System',
    template: (inviteeName: string, inviterName: string, tenantName: string, setupPasswordUrl: string, username?: string, password?: string) => ({
      subject: 'You\'ve been invited to join Crime Report System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invitation to Crime Report System</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .footer { background: #f9fafb; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; font-size: 14px; color: #6b7280; }
            .button { display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .invitation-details { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .highlight { background: #ede9fe; border-left: 4px solid #8b5cf6; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0; }
            .security-note { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 You're Invited!</h1>
            <p>Join the Crime Report System</p>
          </div>
          <div class="content">
            <h2>Hello ${inviteeName}!</h2>
            <p><strong>${inviterName}</strong> has invited you to join the Crime Report System for <strong>${tenantName}</strong>.</p>
            
            <div class="invitation-details">
              <h3>📋 What you can do:</h3>
              <ul>
                <li>📊 View and manage stolen item reports</li>
                <li>📸 Upload and organize evidence</li>
                <li>🔍 Search and filter reports</li>
                <li>📈 Generate professional reports</li>
                <li>👥 Collaborate with your team</li>
              </ul>
            </div>
            
            ${username && password ? `
            <div class="highlight" style="background: #f0fdf4; border-color: #22c55e;">
              <strong>🔑 Your Login Credentials:</strong><br>
              <strong>Username:</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${username}</code><br>
              <strong>Temporary Password:</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${password}</code><br>
              <small style="color: #6b7280;">Use these credentials to log in to your account.</small>
            </div>
            ` : ''}
            
            <div class="highlight">
              <strong>🚀 Ready to get started?</strong><br>
              Your account has been created! Follow these steps to get started:
            </div>
            
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h4 style="margin: 0 0 12px 0; color: #1f2937;">📋 Next Steps:</h4>
              <ol style="margin: 0; padding-left: 20px; color: #374151;">
                <li><strong>Log in</strong> using the credentials above</li>
                <li><strong>Set up your password</strong> in your profile settings (recommended for security)</li>
                <li><strong>Explore the system</strong> and start managing your property</li>
              </ol>
            </div>
            
            <div style="text-align: center;">
              <a href="${EMAIL_CONFIG.websiteUrl}/login-simple" class="button">Log In to Your Account</a>
            </div>
            
            <div class="security-note">
              <strong>🔒 Security Note:</strong> This link will expire in 24 hours for security reasons. If you didn't expect this invitation, please ignore this email.
            </div>
            
            <div class="security-note" style="background: #f0f9ff; border-color: #0ea5e9;">
              <strong>📧 Email Tips:</strong> To ensure you receive all REMISE notifications, please add <strong>noreply@accounts.remise.farm</strong> to your email contacts or safe sender list.
            </div>
            
            <p><strong>Need help?</strong> Contact ${inviterName} or our support team if you have any questions about getting started.</p>
          </div>
          <div class="footer">
            <p>© 2024 Crime Report System. All rights reserved.</p>
            <p>This invitation was sent by ${inviterName} for ${tenantName}.</p>
          </div>
        </body>
        </html>
      `
    })
  },

  // New stolen item notification
  itemNotification: {
    subject: 'New Stolen Item Report - Crime Report System',
    template: (adminName: string, itemName: string, reporterName: string, itemValue: string) => ({
      subject: 'New Stolen Item Report - Crime Report System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Stolen Item Report</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .footer { background: #f9fafb; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; font-size: 14px; color: #6b7280; }
            .button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .info-box { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚨 New Stolen Item Report</h1>
            <p>Crime Report System Notification</p>
          </div>
          <div class="content">
            <h2>Hello ${adminName}!</h2>
            <p>A new stolen item has been reported in the Crime Report System.</p>
            
            <div class="info-box">
              <h3>📋 Report Details:</h3>
              <p><strong>Item:</strong> ${itemName}</p>
              <p><strong>Reported by:</strong> ${reporterName}</p>
              <p><strong>Estimated Value:</strong> ${itemValue}</p>
              <p><strong>Report Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${EMAIL_CONFIG.websiteUrl}" class="button">View Report Details</a>
            </div>
            
            <p>Please review this report and take appropriate action as needed.</p>
          </div>
          <div class="footer">
            <p>© 2024 Crime Report System. All rights reserved.</p>
            <p>This email was sent to notify you of a new stolen item report.</p>
          </div>
        </body>
        </html>
      `
    })
  }
}

// Email service functions
export class EmailService {
  // Send account verification email
  static async sendVerificationEmail(email: string, name: string, verificationToken: string) {
    try {
      const verificationLink = `${EMAIL_CONFIG.websiteUrl}/verify-email?token=${verificationToken}`
      const template = EMAIL_TEMPLATES.verification.template(name, verificationLink)
      
      const result = await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to: [email],
        subject: template.subject,
        html: template.html,
      })
      
      console.log('Verification email sent:', result)
      return { success: true, messageId: result.data?.id }
    } catch (error) {
      console.error('Error sending verification email:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Send welcome email after verification
  static async sendWelcomeEmail(email: string, name: string, role: string) {
    try {
      const template = EMAIL_TEMPLATES.welcome.template(name, role)
      
      const result = await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to: [email],
        subject: template.subject,
        html: template.html,
      })
      
      console.log('Welcome email sent:', result)
      return { success: true, messageId: result.data?.id }
    } catch (error) {
      console.error('Error sending welcome email:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Send password reset email
  static async sendPasswordResetEmail(email: string, name: string, resetToken: string) {
    try {
      const resetLink = `${EMAIL_CONFIG.websiteUrl}/reset-password?token=${resetToken}`
      const template = EMAIL_TEMPLATES.passwordReset.template(name, resetLink)
      
      const result = await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to: [email],
        subject: template.subject,
        html: template.html,
      })
      
      console.log('Password reset email sent:', result)
      return { success: true, messageId: result.data?.id }
    } catch (error) {
      console.error('Error sending password reset email:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Send new item notification to admins
  static async sendItemNotification(adminEmails: string[], adminName: string, itemName: string, reporterName: string, itemValue: string) {
    try {
      const template = EMAIL_TEMPLATES.itemNotification.template(adminName, itemName, reporterName, itemValue)
      
      const result = await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to: adminEmails,
        subject: template.subject,
        html: template.html,
      })
      
      console.log('Item notification email sent:', result)
      return { success: true, messageId: result.data?.id }
    } catch (error) {
      console.error('Error sending item notification email:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Send user invitation email
  static async sendInvitationEmail(email: string, inviteeName: string, inviterName: string, tenantName: string, setupPasswordUrl: string, username?: string, password?: string) {
    try {
      const template = EMAIL_TEMPLATES.invitation.template(inviteeName, inviterName, tenantName, setupPasswordUrl, username, password)
      
      const result = await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to: [email],
        subject: template.subject,
        html: template.html,
      })
      
      console.log('Invitation email sent:', result)
      return { success: true, messageId: result.data?.id }
    } catch (error) {
      console.error('Error sending invitation email:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Send custom notification email
  static async sendNotificationEmail(email: string, subject: string, message: string, buttonText?: string, buttonLink?: string) {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .footer { background: #f9fafb; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; font-size: 14px; color: #6b7280; }
            .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📢 System Notification</h1>
            <p>Crime Report System</p>
          </div>
          <div class="content">
            ${message}
            ${buttonText && buttonLink ? `
              <div style="text-align: center;">
                <a href="${buttonLink}" class="button">${buttonText}</a>
              </div>
            ` : ''}
          </div>
          <div class="footer">
            <p>© 2024 Crime Report System. All rights reserved.</p>
            <p>This email was sent from the Crime Report System.</p>
          </div>
        </body>
        </html>
      `
      
      const result = await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to: [email],
        subject: subject,
        html: html,
      })
      
      console.log('Notification email sent:', result)
      return { success: true, messageId: result.data?.id }
    } catch (error) {
      console.error('Error sending notification email:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

export default EmailService
