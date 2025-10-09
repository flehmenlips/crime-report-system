# 🌳 Deployment Architecture

## Current Git & Render Setup

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Repository                        │
│                  crime-report-system                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ├─────────────────────┐
                            │                     │
                    ┌───────▼──────┐      ┌──────▼──────┐
                    │              │      │             │
                    │  main branch │      │   develop   │
                    │  (v2.2.0)    │      │   branch    │
                    │              │      │             │
                    └───────┬──────┘      └──────┬──────┘
                            │                     │
                            │                     │
              ┌─────────────▼─────────┐  ┌────────▼────────────┐
              │  Render Production    │  │  Render Development │
              │  Service              │  │  Service            │
              │                       │  │                     │
              │  remise-rov8          │  │  remise-rov8-dev    │
              │  Auto-Deploy: ✅      │  │  Auto-Deploy: ✅    │
              │                       │  │                     │
              │  ┌─────────────────┐ │  │  ┌───────────────┐ │
              │  │ Production DB   │ │  │  │ Development DB│ │
              │  │ (Paid)          │ │  │  │ (Free/Paid)   │ │
              │  └─────────────────┘ │  │  └───────────────┘ │
              │                       │  │                     │
              │  🌐 Public Access     │  │  🔐 Protected      │
              │  users.onrender.com   │  │  dev.onrender.com  │
              └───────────────────────┘  └─────────────────────┘
```

## Development Workflow

```
Developer's Local Machine
         │
         │ 1. Make changes
         ▼
    develop branch
         │
         │ 2. git push origin develop
         ▼
    GitHub (develop)
         │
         │ 3. Auto-deploy trigger
         ▼
  Render Dev Service
         │
         │ 4. Test thoroughly
         ▼
  ✅ Ready for production
         │
         │ 5. git checkout main
         │    git merge develop
         │    git tag v2.3.0
         │    git push origin main
         ▼
    GitHub (main)
         │
         │ 6. Auto-deploy trigger
         ▼
  Render Production Service
         │
         ▼
  🎉 Live to public!
```

## Branch Protection Rules

```
┌─────────────────────────────────────────────┐
│              main (Protected)               │
│                                             │
│  ✅ Production-ready code only              │
│  ✅ Tagged releases (v2.2.0, v2.3.0...)    │
│  ✅ Auto-deploys to production             │
│  ❌ No direct commits (merge only)         │
│                                             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│              develop (Active)               │
│                                             │
│  🔧 Active development                      │
│  🔧 Feature testing                         │
│  🔧 Auto-deploys to dev site                │
│  ✅ Direct commits allowed                  │
│                                             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│         feature/* (Temporary)               │
│                                             │
│  🌿 Specific features                       │
│  🌿 Merges to develop                       │
│  🌿 No auto-deploy                          │
│  🗑️  Delete after merge                     │
│                                             │
└─────────────────────────────────────────────┘
```

## Release Process

```
┌──────────────────────────────────────────────────────┐
│                  Release Cycle                       │
└──────────────────────────────────────────────────────┘

Week 1-2: Development
  ├─ Work on develop branch
  ├─ Create feature branches
  ├─ Test on dev.onrender.com
  └─ Fix bugs

Week 3: Stabilization
  ├─ Code freeze on develop
  ├─ Final testing on dev site
  ├─ Fix critical bugs only
  └─ Prepare release notes

Week 4: Release
  ├─ Merge develop → main
  ├─ Tag version (v2.3.0)
  ├─ Auto-deploy to production
  └─ Monitor for issues

After Release:
  ├─ Start new features on develop
  ├─ Hotfixes go directly to main (then back to develop)
  └─ Continue cycle
```

## Environment Variables Matrix

```
┌────────────────────┬──────────────────────┬──────────────────────┐
│   Variable         │   Production         │   Development        │
├────────────────────┼──────────────────────┼──────────────────────┤
│ NODE_ENV           │ production           │ development          │
│ DATABASE_URL       │ prod-db-url          │ dev-db-url           │
│ NEXTAUTH_URL       │ remise-rov8.com      │ remise-rov8-dev.com  │
│ CLOUDINARY_*       │ production config    │ dev/shared config    │
│ EMAIL_FROM         │ noreply@domain.com   │ test@resend.dev      │
│ RESEND_API_KEY     │ production key       │ test key             │
└────────────────────┴──────────────────────┴──────────────────────┘
```

