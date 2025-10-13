export interface Evidence {
  id: number
  type: 'photo' | 'video' | 'document'
  cloudinaryId: string | null
  url?: string | null
  documentData?: Buffer | Uint8Array | null
  originalName: string | null
  description: string | null
  createdAt: string
}

export interface StolenItem {
  id: number;
  name: string;
  description: string;
  serialNumber: string;
  purchaseDate: string; // YYYY-MM-DD format
  purchaseCost: number;
  dateLastSeen: string; // YYYY-MM-DD format
  locationLastSeen: string;
  estimatedValue: number;
  evidence: Evidence[];
  category: string; // Required field for categorization logic
  tags?: string[];
  notes?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  
  // Tenant isolation (temporarily optional during migration)
  tenantId?: string;
  tenant?: Tenant;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  minValue?: number;
  maxValue?: number;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export interface AuthCredentials {
  username: string;
  password: string;
}

export type Role = 'property_owner' | 'law_enforcement' | 'insurance_agent' | 'broker' | 'banker' | 'asset_manager' | 'assistant' | 'secretary' | 'manager' | 'executive_assistant' | 'super_admin'

export type AccessLevel = 'owner' | 'staff' | 'stakeholder' | 'view_only'

export interface Tenant {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: Role;
  accessLevel?: AccessLevel;
  permissions?: string[];
  
  // Extended profile fields
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  company?: string;
  title?: string;
  bio?: string;
  avatar?: string;
  
  // Account settings
  emailVerified?: boolean;
  isActive?: boolean;
  lastLoginAt?: string;
  preferences?: string; // JSON string
  
  // Tenant relationship (temporarily optional during migration)
  tenantId?: string;
  tenant?: Tenant;
  
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  company?: string;
  title?: string;
  bio?: string;
  avatar?: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserRegistration {
  username: string;
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  role?: Role;
}

export interface ItemFormData {
  name: string;
  description: string;
  serialNumber: string;
  purchaseDate: string;
  purchaseCost: number;
  dateLastSeen: string;
  locationLastSeen: string;
  estimatedValue: number;
  category: string; // Required field for categorization
  tags?: string[];
  notes?: string;
}

// NextAuth types disabled - using custom authentication
