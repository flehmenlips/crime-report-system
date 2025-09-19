export interface Evidence {
  id: number
  type: 'photo' | 'video' | 'document'
  cloudinaryId: string | null
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
  category?: string;
  tags?: string[];
  notes?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
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

export type Role = 'property_owner' | 'law_enforcement' | 'insurance_agent' | 'broker' | 'banker' | 'asset_manager' | 'assistant' | 'secretary' | 'manager' | 'executive_assistant'

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions?: string[];
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
  category?: string;
  tags?: string[];
  notes?: string;
}

// NextAuth types disabled - using custom authentication
