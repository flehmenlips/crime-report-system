export type Role = 'property_owner' | 'law_enforcement' | 'insurance_agent' | 'broker' | 'banker' | 'asset_manager' | 'assistant' | 'secretary' | 'manager' | 'executive_assistant' | 'super_admin'
export type AccessLevel = 'owner' | 'staff' | 'stakeholder' | 'view_only'

export interface Tenant {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  name: string
  email: string
  username: string
  role: Role
  accessLevel?: AccessLevel
  permissions?: string[]
  
  // Extended profile fields
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  company?: string
  title?: string
  bio?: string
  avatar?: string
  
  // Account settings
  emailVerified?: boolean
  isActive?: boolean
  lastLoginAt?: string
  preferences?: string
  
  // Tenant relationship (temporarily optional during migration)
  tenantId?: string
  tenant?: Tenant
  
  createdAt: string
  updatedAt: string
}

// Tenant database - each property owner gets their own tenant
export const tenants = [
  {
    id: "tenant-1",
    name: "Birkenfeld Farm",
    description: "Original Birkenfeld Farm theft case",
    isActive: true,
    createdAt: "2023-09-01T00:00:00Z",
    updatedAt: "2023-09-19T00:00:00Z"
  }
]

// Enhanced user database with all stakeholder roles
export const users = [
  // Super Admin - has access to all tenants and system management
  {
    id: "0",
    name: "System Administrator",
    email: "admin@system.com",
    username: "superadmin",
    password: "admin123",
    role: "super_admin" as Role,
    accessLevel: "owner" as AccessLevel,
    permissions: ["read:all", "write:all", "admin:users", "admin:system", "admin:tenants", "super:admin"],
    phone: "+1 (555) 000-0000",
    address: "System Admin",
    city: "System",
    state: "System",
    zipCode: "00000",
    country: "United States",
    company: "Crime Report System",
    title: "Super Administrator",
    bio: "System administrator with full access to all tenants and system management.",
    tenantId: "system-tenant",
    tenant: {
      id: "system-tenant",
      name: "System Administration",
      description: "System administration tenant",
      isActive: true,
      createdAt: "2023-09-01T00:00:00Z",
      updatedAt: "2023-09-19T00:00:00Z"
    },
    createdAt: "2023-09-01T00:00:00Z",
    updatedAt: "2023-09-19T00:00:00Z"
  },
  
  // Law Enforcement - has access to all tenants
  {
    id: "1",
    name: "Police Officer",
    email: "officer@police.gov",
    username: "admin",
    password: "password",
    role: "law_enforcement" as Role,
    accessLevel: "stakeholder" as AccessLevel,
    permissions: ["read:all", "write:all", "admin:users", "admin:system"],
    phone: "+1 (555) 911-0000",
    address: "Police Station",
    city: "Birkenfeld",
    state: "Oregon",
    zipCode: "97015",
    country: "United States",
    company: "Birkenfeld Police Department",
    title: "Detective",
    bio: "Lead investigator for the Birkenfeld Farm theft case.",
    tenantId: "tenant-1",
    tenant: tenants[0],
    createdAt: "2023-09-01T00:00:00Z",
    updatedAt: "2023-09-19T00:00:00Z"
  },
  {
    id: "2",
    name: "Detective Smith",
    email: "detective@police.gov", 
    role: "law_enforcement" as Role,
    accessLevel: "stakeholder" as AccessLevel,
    username: "detective",
    password: "password",
    permissions: ["read:all", "write:all", "admin:users"],
    tenantId: "tenant-1",
    tenant: tenants[0],
    createdAt: "2023-09-01T00:00:00Z",
    updatedAt: "2023-09-19T00:00:00Z"
  },
  
  // Property Owners
  {
    id: "3", 
    name: "George Page",
    email: "george@birkenfeldfarm.com",
    username: "george",
    password: "password",
    role: "property_owner" as Role,
    accessLevel: "owner" as AccessLevel,
    permissions: ["read:own", "write:own", "upload:evidence", "generate:reports"],
    phone: "+1 (555) 123-4567",
    address: "123 Farm Road",
    city: "Birkenfeld",
    state: "Oregon",
    zipCode: "97015",
    country: "United States",
    company: "Birkenfeld Farm",
    title: "Property Owner",
    bio: "Owner of Birkenfeld Farm, specializing in organic produce and livestock.",
    tenantId: "tenant-1",
    tenant: tenants[0],
    createdAt: "2023-09-01T00:00:00Z",
    updatedAt: "2023-09-19T00:00:00Z"
  },
  {
    id: "4",
    name: "Farm Owner",
    email: "owner@birkenfeldfarm.com",
    role: "property_owner" as Role,
    username: "owner",
    password: "password",
    permissions: ["read:own", "write:own", "upload:evidence", "generate:reports"]
  },

  // Insurance Agents
  {
    id: "5",
    name: "Insurance Agent",
    email: "agent@farmersinsurance.com",
    role: "insurance_agent" as Role,
    username: "insurance",
    password: "password",
    permissions: ["read:cases", "write:claims", "generate:reports"]
  },

  // Brokers
  {
    id: "6",
    name: "Equipment Broker",
    email: "broker@equipment.com",
    role: "broker" as Role,
    username: "broker",
    password: "password",
    permissions: ["read:cases", "write:appraisals"]
  },

  // Bankers
  {
    id: "7",
    name: "Bank Officer",
    email: "banker@bank.com",
    role: "banker" as Role,
    username: "banker",
    password: "password",
    permissions: ["read:cases", "write:financial"]
  },

  // Asset Managers
  {
    id: "8",
    name: "Asset Manager",
    email: "assets@management.com",
    role: "asset_manager" as Role,
    username: "assets",
    password: "password",
    permissions: ["read:all", "write:assets"]
  },

  // Support Staff
  {
    id: "9",
    name: "Executive Assistant",
    email: "assistant@company.com",
    role: "executive_assistant" as Role,
    username: "assistant",
    password: "password",
    permissions: ["read:cases", "write:notes"]
  },
  {
    id: "10",
    name: "Secretary",
    email: "secretary@company.com",
    role: "secretary" as Role,
    username: "secretary",
    password: "password",
    permissions: ["read:cases", "write:notes"]
  }
]



// RBAC Helper Functions
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user || !user.permissions) return false
  return user.permissions.includes(permission)
}

export function hasRole(user: User | null, role: Role): boolean {
  if (!user) return false
  return user.role === role
}

export function hasAnyRole(user: User | null, roles: Role[]): boolean {
  if (!user) return false
  return roles.includes(user.role)
}

export function canReadAll(user: User | null): boolean {
  return hasPermission(user, 'read:all')
}

export function canWriteAll(user: User | null): boolean {
  return hasPermission(user, 'write:all')
}

export function canManageUsers(user: User | null): boolean {
  return hasPermission(user, 'admin:users')
}

export function canAccessAdmin(user: User | null): boolean {
  return hasPermission(user, 'admin:system')
}

export function canSuperAdmin(user: User | null): boolean {
  return user?.role === 'super_admin'
}

export function canAccessAllTenants(user: User | null): boolean {
  return user?.role === 'super_admin' || user?.role === 'law_enforcement'
}

// Role-based UI access helpers
export function getDashboardTitle(user: User | null): string {
  if (!user) return 'Login Required'
  
  switch (user.role) {
    case 'law_enforcement':
      return 'Law Enforcement Portal'
    case 'property_owner':
      return 'Property Owner Portal'
    case 'insurance_agent':
      return 'Insurance Agent Portal'
    case 'broker':
      return 'Equipment Broker Portal'
    case 'banker':
      return 'Banking Portal'
    case 'asset_manager':
      return 'Asset Management Portal'
    case 'assistant':
    case 'secretary':
      return 'Assistant Portal'
    case 'manager':
      return 'Management Portal'
    case 'executive_assistant':
      return 'Executive Assistant Portal'
    default:
      return 'User Portal'
  }
}

export function getRoleDisplayName(role: Role): string {
  switch (role) {
    case 'property_owner':
      return 'Property Owner'
    case 'law_enforcement':
      return 'Law Enforcement'
    case 'insurance_agent':
      return 'Insurance Agent'
    case 'broker':
      return 'Equipment Broker'
    case 'banker':
      return 'Banker'
    case 'asset_manager':
      return 'Asset Manager'
    case 'assistant':
      return 'Assistant'
    case 'secretary':
      return 'Secretary'
    case 'manager':
      return 'Manager'
    case 'executive_assistant':
      return 'Executive Assistant'
    default:
      return 'User'
  }
}

// Enhanced stakeholder access control functions
export function canGenerateReports(user: User | null): boolean {
  if (!user) return false
  return ['law_enforcement', 'insurance_agent', 'banker', 'asset_manager'].includes(user.role)
}

export function canAddNotes(user: User | null): boolean {
  if (!user) return false
  return ['law_enforcement', 'insurance_agent', 'broker', 'banker', 'asset_manager'].includes(user.role)
}

export function canExportData(user: User | null): boolean {
  if (!user) return false
  return ['law_enforcement', 'insurance_agent', 'banker'].includes(user.role)
}

export function canAccessAnalytics(user: User | null): boolean {
  if (!user) return false
  // All authenticated users can access analytics
  return true
}

export function canViewEvidence(user: User | null): boolean {
  if (!user) return false
  // All authenticated users can view evidence
  return true
}

export function canEditItems(user: User | null): boolean {
  if (!user) return false
  return user.role === 'property_owner' || user.role === 'law_enforcement'
}

export function canDeleteItems(user: User | null): boolean {
  if (!user) return false
  return user.role === 'property_owner' || user.role === 'law_enforcement'
}

export function canUploadEvidence(user: User | null): boolean {
  if (!user) return false
  return user.role === 'property_owner' || user.role === 'law_enforcement'
}

export function isStakeholder(user: User | null): boolean {
  if (!user) return false
  return user.role !== 'property_owner'
}

export function isPropertyOwner(user: User | null): boolean {
  if (!user) return false
  return user.role === 'property_owner'
}

export function getRoleIcon(role: Role): string {
  switch (role) {
    case 'law_enforcement':
      return '🚔'
    case 'property_owner':
      return '🏠'
    case 'insurance_agent':
      return '🏢'
    case 'broker':
      return '🤝'
    case 'banker':
      return '🏦'
    case 'asset_manager':
      return '📊'
    case 'assistant':
    case 'secretary':
    case 'executive_assistant':
      return '👤'
    case 'manager':
      return '👔'
    default:
      return '👤'
  }
}

export function getRoleColor(role: Role): string {
  switch (role) {
    case 'law_enforcement':
      return 'from-red-500 to-red-700'
    case 'property_owner':
      return 'from-blue-500 to-indigo-600'
    case 'insurance_agent':
      return 'from-green-500 to-green-700'
    case 'broker':
      return 'from-purple-500 to-purple-700'
    case 'banker':
      return 'from-yellow-500 to-yellow-700'
    case 'asset_manager':
      return 'from-teal-500 to-teal-700'
    case 'assistant':
    case 'secretary':
    case 'executive_assistant':
      return 'from-gray-500 to-gray-700'
    case 'manager':
      return 'from-orange-500 to-orange-700'
    default:
      return 'from-gray-500 to-gray-700'
  }
}
