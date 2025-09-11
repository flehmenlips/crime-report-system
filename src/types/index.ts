export interface Evidence {
  photos: string[];
  videos: string[];
  documents: string[];
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
  evidence: Evidence;
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

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'law_enforcement' | 'admin';
  permissions: string[];
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
