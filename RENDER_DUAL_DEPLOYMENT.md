# 🚀 Render.com Dual Deployment Strategy

## Overview: Production + Development Environments

You can maintain **two separate Render deployments**:
1. **Production** (main branch) - Public, stable release
2. **Development** (develop branch) - Testing and staging

---

## 🎯 Strategy Options

### **Option 1: Separate Web Services (Recommended)**
**Best for:** Full isolation, separate databases, independent scaling

```
Production Service:
  └─ Branch: main
  └─ URL: https://crime-report-system.onrender.com
  └─ Database: crime-report-db (production)
  └─ Auto-deploy: Yes

Development Service:
  └─ Branch: develop
  └─ URL: https://crime-report-system-dev.onrender.com
  └─ Database: crime-report-db-dev (separate)
  └─ Auto-deploy: Yes (or manual)
```

### **Option 2: Preview Environments**
**Best for:** Quick testing, temporary deployments

```
Production Service:
  └─ Branch: main (auto-deploy)

Preview Deployments:
  └─ Automatically created for Pull Requests
  └─ Temporary URLs for testing
  └─ Deleted when PR is closed
```

---

## 🔧 Implementation: Option 1 (Separate Services)

### **Step 1: Keep Your Current Production Service**

Your current service configuration:
- **Service Name:** `crime-report-system` (or `remise-rov8`)
- **Branch:** `main`
- **URL:** `https://remise-rov8.onrender.com`
- **Status:** Keep as-is (production)

### **Step 2: Create Development Service**

#### **A. In Render Dashboard:**

1. **Click "New +" → "Web Service"**
2. **Connect the same GitHub repository**
3. **Configure the development service:**

```
Name: crime-report-system-dev
Branch: develop (← Select develop branch)
Root Directory: (leave empty)
Environment: Node
Build Command: npm install && npx prisma generate && npx prisma db push --accept-data-loss && npm run build
Start Command: npm start
Auto-Deploy: Yes (or No if you want manual control)
```

#### **B. Set Environment Variables:**

Add these to the **development service** (same as production but with dev-specific values):

```bash
# Node Environment
NODE_ENV=development  # ← Different from production

# Database (create separate dev database)
DATABASE_URL=postgresql://user:pass@dev-db-host/crime_report_dev

# Cloudinary (can share or use separate account)
CLOUDINARY_CLOUD_NAME=dhaacekdd
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dhaacekdd

# Authentication
NEXTAUTH_SECRET=your-dev-secret-key
NEXTAUTH_URL=https://crime-report-system-dev.onrender.com  # ← Dev URL

# Email (use test domain or separate config)
RESEND_API_KEY=re_your_key
EMAIL_FROM=Crime Report Dev <onboarding@resend.dev>  # ← Test domain
EMAIL_REPLY_TO=onboarding@resend.dev
```

#### **C. Create Separate Development Database:**

1. **In Render Dashboard:** Click "New +" → "PostgreSQL"
2. **Configure:**
   ```
   Name: crime-report-db-dev
   Database: crime_report_dev
   User: crime_report_dev_user
   Region: (same as production for speed)
   Plan: Free (or Starter for better performance)
   ```
3. **Link to Development Service:**
   - Copy the "Internal Database URL"
   - Add as `DATABASE_URL` environment variable in dev service

### **Step 3: Deploy Development Service**

1. **Click "Manual Deploy" or "Deploy latest commit"**
2. **Monitor the build logs**
3. **Wait for deployment to complete**
4. **Access your dev site:** `https://crime-report-system-dev.onrender.com`

---

## 🔐 Security Best Practices

### **Development Environment:**
- ✅ Use **separate database** (prevents data corruption)
- ✅ Use **test email domain** (prevents sending emails to real users)
- ✅ Use **different auth secrets** (prevents session conflicts)
- ✅ Consider **password protection** (Render supports basic auth)

### **Production Environment:**
- ✅ Keep **auto-deploy enabled** only for `main` branch
- ✅ Use **production database** with backups
- ✅ Use **verified email domain**
- ✅ Monitor **error logs** and performance

---

## 🌐 Access Control Options

### **Option A: Public Development Site**
- Anyone can access the dev URL
- Good for: Demo, stakeholder testing
- Risk: Low (separate database)

### **Option B: Password-Protected Development**
Render supports basic authentication:

1. **Add to dev service environment variables:**
   ```
   HTTP_AUTH_USERNAME=developer
   HTTP_AUTH_PASSWORD=your-secure-password
   ```

2. **Add middleware to Next.js** (create `src/middleware-auth.ts`):
   ```typescript
   // Simple basic auth middleware
   export function basicAuth(req: Request) {
     const authHeader = req.headers.get('authorization')
     if (!authHeader) return false
     
     const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':')
     return auth[0] === process.env.HTTP_AUTH_USERNAME && 
            auth[1] === process.env.HTTP_AUTH_PASSWORD
   }
   ```

### **Option C: IP Whitelist**
Use Render's IP whitelist feature (paid plans) to restrict access.

---

## 🔄 Workflow with Dual Deployments

### **Daily Development:**
```bash
# Work on develop branch (already checked out)
git add .
git commit -m "Add new feature"
git push origin develop

# Automatically deploys to dev site (if auto-deploy enabled)
# Test at: https://crime-report-system-dev.onrender.com
```

### **Releasing to Production:**
```bash
# After testing on dev, merge to main
git checkout main
git merge develop
git tag -a v2.3.0 -m "Release v2.3.0: New feature"
git push origin main
git push origin v2.3.0

# Automatically deploys to production site
# Live at: https://remise-rov8.onrender.com
```

---

## 📊 Cost Considerations

### **Free Tier Limits:**
- **Web Services:** Spin down after 15 min inactivity (free tier)
- **Database:** 90-day limit, 256 MB storage (free tier)
- **Bandwidth:** 100 GB/month (free tier)

### **Cost-Effective Strategy:**
```
Production (Always On):
  ├─ Web Service: Starter ($7/month) - stays awake
  └─ Database: Starter ($7/month) - persistent

Development (On-Demand):
  ├─ Web Service: Free - spins down when not in use
  └─ Database: Free - for testing only
  
Total Cost: $14/month (just for production)
```

### **Alternative: Single Database Strategy**
Use the same database for both environments with tenant isolation:
```
TENANT_ID=production  # Production service
TENANT_ID=development # Development service
```
- **Pros:** Lower cost, single database
- **Cons:** Risk of data corruption, harder to reset dev data

---

## 🎯 Recommended Setup for Your App

Based on your Crime Report System, I recommend:

### **Production Service (Keep Current):**
```
Name: remise-rov8
Branch: main
Auto-Deploy: Yes
Database: Current production DB
URL: https://remise-rov8.onrender.com
Plan: Paid ($7/month web + $7/month DB)
```

### **Development Service (Create New):**
```
Name: remise-rov8-dev
Branch: develop
Auto-Deploy: Yes (or manual if you prefer)
Database: Separate free dev DB (or shared with tenant isolation)
URL: https://remise-rov8-dev.onrender.com
Plan: Free (spins down after 15 min)
Access: Password-protected (optional)
```

---

## 🚀 Quick Start Checklist

- [ ] Keep current production service on `main` branch
- [ ] Create new web service for `develop` branch
- [ ] Create separate development database (or use tenant isolation)
- [ ] Configure environment variables for dev service
- [ ] Set up password protection for dev site (optional)
- [ ] Test deployment by pushing to `develop` branch
- [ ] Verify both sites are working independently
- [ ] Document the deployment URLs for your team

---

## 📖 Additional Resources

- **Render Docs:** [Multiple Environments](https://render.com/docs/environment-variables)
- **Preview Environments:** [Render Preview Deployments](https://render.com/docs/preview-environments)
- **Database Management:** [Render PostgreSQL](https://render.com/docs/databases)

---

## 🎉 Summary

**You now have:**
1. ✅ Production site on `main` branch (stable, public)
2. ✅ Development site on `develop` branch (testing, isolated)
3. ✅ Independent deployments with separate configurations
4. ✅ Safe experimentation without affecting production

**Workflow:**
- Work on `develop` → Auto-deploys to dev site → Test thoroughly
- Merge to `main` → Auto-deploys to production → Users see stable version

This gives you the best of both worlds: public stable release + safe testing environment! 🚀

