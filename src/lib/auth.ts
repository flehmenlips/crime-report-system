import { cookies } from 'next/headers'

export type Role = 'property_owner' | 'law_enforcement' | 'insurance_agent' | 'broker' | 'banker' | 'asset_manager' | 'assistant' | 'secretary' | 'manager' | 'executive_assistant'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  permissions?: string[]
}

// Enhanced user database with all stakeholder roles
const users = [
  // Law Enforcement
  {
    id: "1",
    name: "Police Officer",
    email: "officer@police.gov",
    role: "law_enforcement" as Role,
    username: "admin",
    password: "password",
    permissions: ["read:all", "write:all", "admin:users", "admin:system"]
  },
  {
    id: "2",
    name: "Detective Smith",
    email: "detective@police.gov", 
    role: "law_enforcement" as Role,
    username: "detective",
    password: "password",
    permissions: ["read:all", "write:all", "admin:users"]
  },
  
  // Property Owners
  {
    id: "3", 
    name: "George Page",
    email: "george@birkenfeldfarm.com",
    role: "property_owner" as Role,
    username: "george",
    password: "password",
    permissions: ["read:own", "write:own", "upload:evidence"]
  },
  {
    id: "4",
    name: "Farm Owner",
    email: "owner@birkenfeldfarm.com",
    role: "property_owner" as Role,
    username: "owner",
    password: "password",
    permissions: ["read:own", "write:own", "upload:evidence"]
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

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  console.log('=== AUTH DEBUG ===')
  console.log('Attempting to authenticate user:', username)
  console.log('Total users in database:', users.length)
  console.log('Available users:', users.map(u => ({ username: u.username, role: u.role })))
  console.log('Looking for exact match:', { username, password })
  
  const user = users.find(u => u.username === username && u.password === password)
  if (user) {
    console.log('✅ User found:', { username: user.username, role: user.role })
    // Return user without password
    const { password: _, username: __, ...userWithoutCredentials } = user
    return userWithoutCredentials as User
  }
  
  console.log('❌ No user found for:', username)
  console.log('=== END AUTH DEBUG ===')
  return null
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')
    
    if (!userCookie) {
      return null
    }
    
    return JSON.parse(userCookie.value) as User
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function setUserSession(user: User): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('user', JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })
}

export async function clearUserSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('user')
}

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
