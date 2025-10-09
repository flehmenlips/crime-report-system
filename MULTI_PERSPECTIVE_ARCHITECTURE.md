# 🎯 Multi-Perspective Architecture Documentation

## Overview

The Crime Report System is designed as a **multi-tenant, multi-perspective platform** that serves different user types with role-specific views and capabilities. Each user role has distinct needs, permissions, and interfaces tailored to their professional requirements.

---

## 👥 User Roles & Perspectives

### **Primary User Categories**

| Role | Access Level | Primary Use Case | Dashboard Type |
|------|-------------|------------------|----------------|
| `property_owner` | `owner` | Document stolen property | Property Owner Portal |
| `law_enforcement` | `stakeholder` | Investigate cases | Stakeholder Dashboard |
| `insurance_agent` | `stakeholder` | Assess claims | Stakeholder Dashboard |
| `broker` | `stakeholder` | Value equipment | Stakeholder Dashboard |
| `banker` | `stakeholder` | Assess collateral | Stakeholder Dashboard |
| `asset_manager` | `stakeholder` | Manage portfolios | Stakeholder Dashboard |
| `assistant` | `staff` | Support operations | Stakeholder Dashboard |
| `secretary` | `staff` | Administrative tasks | Stakeholder Dashboard |
| `manager` | `staff` | Team oversight | Stakeholder Dashboard |
| `executive_assistant` | `staff` | Executive support | Stakeholder Dashboard |
| `super_admin` | `owner` | System administration | Super Admin Dashboard |

### **Access Level Hierarchy**

```
super_admin (System-wide access)
├── owner (Tenant-level full access)
│   └── property_owner
├── staff (Tenant-level limited access)
│   ├── manager
│   ├── assistant
│   ├── secretary
│   └── executive_assistant
└── stakeholder (Cross-tenant read access)
    ├── law_enforcement
    ├── insurance_agent
    ├── broker
    ├── banker
    └── asset_manager
```

---

## 🏗️ Current Architecture

### **Dashboard Routing Logic**

Currently, the system uses a **simplified two-dashboard approach**:

1. **Property Owner Portal** (`property_owner` role only)
   - Focused on personal stolen items
   - Full CRUD operations on own items
   - Evidence upload and management
   - Personal reporting tools

2. **Stakeholder Dashboard** (All other roles)
   - Cross-tenant data access
   - Role-specific permissions
   - Professional tools and reporting
   - Investigation and assessment capabilities

### **Role-Based Configuration**

Each role has specific configuration in `StakeholderDashboard.tsx`:

```typescript
const getRoleConfig = () => {
  switch (user.role) {
    case 'law_enforcement':
      return {
        icon: '🚔',
        title: 'Law Enforcement Portal',
        subtitle: 'Investigation interface for stolen items case',
        canEdit: true,
        canDelete: true,
        canUpload: true
      }
    case 'insurance_agent':
      return {
        icon: '🏢',
        title: 'Insurance Agent Portal',
        subtitle: 'Claims assessment and investigation tools',
        canEdit: false,
        canDelete: false,
        canUpload: false
      }
    // ... other roles
  }
}
```

---

## 🎯 Development Considerations

### **Multi-Perspective Development Principles**

When developing features, always consider:

1. **Role-Based Access Control (RBAC)**
   - What permissions does each role need?
   - What data should each role see?
   - What actions should each role perform?

2. **Tenant Isolation**
   - Property owners only see their tenant's data
   - Stakeholders can see cross-tenant data
   - Super admins see all data

3. **Professional Context**
   - Law enforcement needs investigation tools
   - Insurance agents need claims assessment tools
   - Brokers need valuation tools
   - Bankers need risk assessment tools

4. **Data Sensitivity**
   - Some roles can edit, others can only view
   - Evidence access varies by role
   - Report generation permissions differ

### **Feature Development Checklist**

Before implementing any feature, ask:

- [ ] **Which roles need this feature?**
- [ ] **What permissions are required?**
- [ ] **How does it work across tenants?**
- [ ] **What's the professional context for each role?**
- [ ] **Are there security implications?**
- [ ] **How does it integrate with existing workflows?**

---

## 🔧 Current Implementation Status

### **✅ Implemented**

- **Role-based authentication** with 11 different roles
- **Access level hierarchy** (owner, staff, stakeholder, view_only)
- **Tenant isolation** for property owners
- **Cross-tenant access** for stakeholders
- **Role-specific dashboard configurations**
- **Permission-based UI controls**
- **Multi-tenant user management**

### **⚠️ Partially Implemented**

- **Role-specific workflows** (some roles have limited functionality)
- **Professional tools** (some roles lack specialized features)
- **Advanced reporting** (varies by role)

### **❌ Not Yet Implemented**

- **Role-specific onboarding flows**
- **Advanced permission granularity**
- **Role-specific analytics**
- **Customized workflows per role**
- **Professional integration tools**

---

## 🚀 Development Priorities

### **Phase 1: Role-Specific Features**

1. **Law Enforcement Tools**
   - Investigation workflow
   - Evidence chain of custody
   - Case management features
   - Officer collaboration tools

2. **Insurance Agent Tools**
   - Claims assessment interface
   - Valuation calculators
   - Document verification
   - Claims workflow management

3. **Broker Tools**
   - Equipment valuation
   - Market analysis
   - Inventory management
   - Sales tracking

4. **Banker Tools**
   - Collateral assessment
   - Risk analysis
   - Loan documentation
   - Portfolio management

### **Phase 2: Enhanced Workflows**

1. **Multi-role collaboration**
2. **Advanced reporting by role**
3. **Professional integrations**
4. **Custom dashboards per role**

---

## 📋 Development Workflow

### **When Adding New Features:**

1. **Define Role Requirements**
   ```typescript
   // Example: New evidence tagging feature
   const canTagEvidence = (user: User) => {
     return ['law_enforcement', 'insurance_agent', 'property_owner'].includes(user.role)
   }
   ```

2. **Implement Role Checks**
   ```typescript
   // Example: Role-specific UI rendering
   {canTagEvidence(user) && <EvidenceTaggingInterface />}
   ```

3. **Test Across Roles**
   - Test with different user types
   - Verify permissions work correctly
   - Ensure tenant isolation is maintained

4. **Document Role Impact**
   - Update this documentation
   - Note any permission changes
   - Document new workflows

### **Code Organization**

```
src/
├── components/
│   ├── dashboards/
│   │   ├── PropertyOwnerDashboard.tsx (if created)
│   │   └── StakeholderDashboard.tsx
│   ├── role-specific/
│   │   ├── LawEnforcementTools.tsx
│   │   ├── InsuranceAgentTools.tsx
│   │   └── BrokerTools.tsx
│   └── shared/ (common components)
├── lib/
│   ├── auth.ts (role definitions)
│   ├── permissions.ts (permission logic)
│   └── role-configs.ts (role configurations)
```

---

## 🎯 Next Steps

1. **Review current role implementations**
2. **Identify missing role-specific features**
3. **Prioritize development based on user needs**
4. **Implement role-specific workflows**
5. **Enhance multi-perspective collaboration**

---

*This documentation should be updated whenever new roles are added or existing role permissions are modified.*
