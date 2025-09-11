# Deployment Checklist

## Pre-Deployment Preparation

### ✅ Environment Setup
- [ ] Generate strong `NEXTAUTH_SECRET` (32+ characters)
- [ ] Set secure `AUTH_USERNAME` and `AUTH_PASSWORD`
- [ ] Configure `NEXTAUTH_URL` for production domain
- [ ] Set up Cloudinary credentials (optional)
- [ ] Ensure all required environment variables are configured

### ✅ Security Configuration
- [ ] Change default admin credentials
- [ ] Verify HTTPS is enabled
- [ ] Confirm security headers are applied
- [ ] Test rate limiting functionality
- [ ] Validate input sanitization

### ✅ Build Verification
- [ ] Run `npm run type-check` - no TypeScript errors
- [ ] Run `npm run lint` - no linting errors
- [ ] Run `npm run build` - successful production build
- [ ] Test health check endpoint: `/api/health`

## Deployment Steps

### For Render.com

1. **Repository Setup**
   - [ ] Push code to GitHub repository
   - [ ] Ensure `.env` files are in `.gitignore`
   - [ ] Verify `render.yaml` is in repository root

2. **Render Configuration**
   - [ ] Create new Web Service
   - [ ] Connect GitHub repository
   - [ ] Set build command: `npm run build`
   - [ ] Set start command: `npm start`

3. **Environment Variables**
   - [ ] `NODE_ENV=production`
   - [ ] `NEXTAUTH_SECRET=<generated-secret>`
   - [ ] `NEXTAUTH_URL=<your-render-url>`
   - [ ] `AUTH_USERNAME=<secure-username>`
   - [ ] `AUTH_PASSWORD=<secure-password>`
   - [ ] `CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>`
   - [ ] `CLOUDINARY_API_KEY=<cloudinary-api-key>`
   - [ ] `CLOUDINARY_API_SECRET=<cloudinary-api-secret>`

4. **Domain Configuration** (Optional)
   - [ ] Add custom domain in Render dashboard
   - [ ] Configure DNS records
   - [ ] Update `NEXTAUTH_URL` with custom domain

### For Vercel

1. **Repository Setup**
   - [ ] Push code to GitHub repository
   - [ ] Ensure `.env.local` is in `.gitignore`

2. **Vercel Configuration**
   - [ ] Install Vercel CLI: `npm i -g vercel`
   - [ ] Run `vercel` in project directory
   - [ ] Follow CLI prompts for configuration

3. **Environment Variables**
   ```bash
   vercel env add NEXTAUTH_SECRET
   vercel env add AUTH_USERNAME
   vercel env add AUTH_PASSWORD
   vercel env add CLOUDINARY_CLOUD_NAME
   vercel env add CLOUDINARY_API_KEY
   vercel env add CLOUDINARY_API_SECRET
   ```

## Post-Deployment Verification

### ✅ Basic Functionality
- [ ] Application loads at deployed URL
- [ ] Login page accessible
- [ ] Authentication works with configured credentials
- [ ] Dashboard displays correctly
- [ ] Item table renders properly

### ✅ Security Verification
- [ ] HTTPS enabled and working
- [ ] Login redirects non-authenticated users
- [ ] Rate limiting prevents brute force attacks
- [ ] Sensitive data not exposed in responses

### ✅ Feature Testing
- [ ] Search functionality works
- [ ] Evidence viewer opens correctly
- [ ] PDF export generates files
- [ ] Mobile responsiveness verified

### ✅ Performance Checks
- [ ] Initial load time acceptable (<3 seconds)
- [ ] Search responses fast (<500ms)
- [ ] PDF generation works within timeout limits
- [ ] Memory usage stable

## Monitoring & Maintenance

### Health Checks
- [ ] Health endpoint accessible: `https://your-domain.com/api/health`
- [ ] Monitor response times
- [ ] Set up alerts for downtime

### Security Monitoring
- [ ] Monitor failed login attempts
- [ ] Review access logs regularly
- [ ] Update dependencies monthly
- [ ] Rotate secrets annually

### Performance Monitoring
- [ ] Track response times
- [ ] Monitor memory usage
- [ ] Set up error tracking
- [ ] Monitor user activity

## Rollback Plan

### If Deployment Fails
1. **Immediate Actions**
   - [ ] Check deployment logs
   - [ ] Verify environment variables
   - [ ] Test health endpoint

2. **Rollback Steps**
   - [ ] Revert to previous deployment
   - [ ] Restore previous environment variables
   - [ ] Test functionality with previous version

3. **Investigation**
   - [ ] Review error logs
   - [ ] Check dependency conflicts
   - [ ] Verify configuration changes

## Emergency Contacts

- **Technical Support**: [support@yourdomain.com]
- **Security Issues**: [security@yourdomain.com]
- **Deployment Issues**: [devops@yourdomain.com]

## Useful Commands

```bash
# Local testing
npm run build
npm run start

# Health checks
curl https://your-domain.com/api/health

# Log checking
# Render: Dashboard → Logs
# Vercel: Dashboard → Functions → Logs

# Environment variable updates
# Render: Dashboard → Environment
# Vercel: Dashboard → Settings → Environment Variables
```

---

**Last Updated**: September 11, 2025
**Version**: 1.0.0
