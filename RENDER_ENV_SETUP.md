# Render.com Environment Variables Setup

## Required Environment Variables

Add these environment variables to your Render.com web service:

### 1. Database Configuration
```
DATABASE_URL=postgresql://crime_report_user:CrimeReport2024!@dpg-d32do4umcj7s739gjdqg-a.oregon-postgres.render.com/crime_report_db
```

### 2. Resend Email Service
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
```
**Get this from:** [https://resend.com/api-keys](https://resend.com/api-keys)

### 3. Email Configuration
```
EMAIL_FROM=Crime Report System <noreply@yourdomain.com>
EMAIL_REPLY_TO=support@yourdomain.com
```
**Important:** Replace `yourdomain.com` with your actual verified domain from Resend

### 4. Application URLs
```
NEXTAUTH_URL=https://remise-rov8.onrender.com
```

## How to Add Environment Variables in Render.com

1. **Go to your Render Dashboard**
2. **Select your web service** (remise-rov8)
3. **Click on "Environment" tab**
4. **Add each variable** by clicking "Add Environment Variable"
5. **Enter the Key and Value** for each variable above
6. **Click "Save Changes"**
7. **Redeploy your service** for changes to take effect

## Domain Verification for Email

### Option 1: Use Resend's Test Domain (Quick Setup)
For immediate testing, you can use Resend's test domain:
```
EMAIL_FROM=Crime Report System <onboarding@resend.dev>
EMAIL_REPLY_TO=onboarding@resend.dev
```

### Option 2: Use Your Own Domain (Recommended for Production)
1. **Add your domain** in Resend dashboard (e.g., `yourdomain.com`)
2. **Add the required DNS records** to verify ownership
3. **Update EMAIL_FROM** to use your verified domain:
   ```
   EMAIL_FROM=Crime Report System <noreply@yourdomain.com>
   EMAIL_REPLY_TO=support@yourdomain.com
   ```

## Testing the Email System

After setting up the environment variables:

1. **Register a new account** → Should receive verification email
2. **Click verification link** → Account activated + welcome email
3. **Try "Forgot Password"** → Should receive reset email
4. **Complete password reset** → Should be able to login

## Troubleshooting

### Email Not Sending
- Check that `RESEND_API_KEY` is correct
- Verify domain is properly configured in Resend
- Check Render logs for email service errors

### Build Errors
- Ensure all environment variables are set correctly
- Check that the domain in `EMAIL_FROM` matches your Resend verification

### DNS Issues
- Make sure all required DNS records are added
- Wait for DNS propagation (can take up to 24 hours)
- Use Resend's test domain for immediate testing

## Security Notes

- Never commit API keys to your repository
- Use environment variables for all sensitive configuration
- Regularly rotate your Resend API keys
- Monitor email delivery rates in Resend dashboard
