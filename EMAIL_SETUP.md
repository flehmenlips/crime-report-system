# Email Integration Setup Guide

## 1. Resend Account Setup

1. **Sign up for Resend**: Go to [https://resend.com](https://resend.com) and create an account
2. **Verify your domain**: Add and verify your domain in Resend dashboard
3. **Get API Key**: Create an API key in the Resend dashboard

## 2. Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Resend Email Service
RESEND_API_KEY="re_1234567890abcdef"  # Your actual Resend API key

# Email Configuration  
EMAIL_FROM="Crime Report System <noreply@yourdomain.com>"  # Must be verified domain
EMAIL_REPLY_TO="support@yourdomain.com"

# Application URLs
NEXTAUTH_URL="https://remise-rov8.onrender.com"
```

## 3. Domain Verification

In your Resend dashboard:
1. Go to "Domains" section
2. Add your domain (e.g., `yourdomain.com`)
3. Add the required DNS records to verify ownership
4. Update `EMAIL_FROM` to use your verified domain

## 4. Testing

The email system is now ready! Test with:
- Account registration and verification
- Password reset functionality
- Admin notifications for new reports

## 5. Email Templates Included

✅ **Account Verification**: Welcome email with verification link
✅ **Welcome Email**: Post-verification welcome message
✅ **Password Reset**: Secure password reset with time-limited link
✅ **Item Notifications**: Admin alerts for new stolen item reports
✅ **Custom Notifications**: Flexible notification system

All emails are professionally designed with:
- Responsive HTML templates
- Security warnings and notes
- Clear call-to-action buttons
- Branded styling
- Mobile-friendly design
