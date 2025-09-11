import { StolenItem, SearchFilters } from '@/types';

/**
 * Fetch all stolen items from the API
 */
export async function getAllItems(): Promise<StolenItem[]> {
  try {
    const response = await fetch('/api/items');
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error loading items data:', error);
    return [];
  }
}

/**
 * Search items using the API
 */
export async function searchItems(filters: SearchFilters): Promise<StolenItem[]> {
  try {
    const params = new URLSearchParams();

    if (filters.query) params.set('query', filters.query);
    if (filters.minValue !== undefined) params.set('minValue', filters.minValue.toString());
    if (filters.maxValue !== undefined) params.set('maxValue', filters.maxValue.toString());
    if (filters.dateRange) {
      params.set('dateStart', filters.dateRange.start);
      params.set('dateEnd', filters.dateRange.end);
    }

    const response = await fetch(`/api/items?${params.toString()}`);
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error searching items:', error);
    return [];
  }
}

/**
 * Get total value of all items
 */
export async function getTotalValue(): Promise<number> {
  const items = await getAllItems();
  return items.reduce((total, item) => total + item.estimatedValue, 0);
}

/**
 * Get items by evidence type (photos, videos, documents)
 */
export async function getItemsByEvidenceType(type: 'photos' | 'videos' | 'documents'): Promise<StolenItem[]> {
  const items = await getAllItems();
  return items.filter(item => item.evidence[type].length > 0);
}

/**
 * Get all unique locations where items were last seen
 */
export async function getUniqueLocations(): Promise<string[]> {
  const items = await getAllItems();
  const locations = new Set(items.map(item => item.locationLastSeen));
  return Array.from(locations);
}

/**
 * Format currency value
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format date string
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Add a new stolen item
 */
export async function addItem(itemData: any, ownerId: string): Promise<StolenItem | null> {
  try {
    console.log('Sending API request with data:', { ...itemData, ownerId })
    
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...itemData,
        ownerId
      })
    })

    console.log('API response status:', response.status)
    
    if (!response.ok) {
      const errorData = await response.text()
      console.error('API error response:', errorData)
      throw new Error(`Failed to add item: ${response.status} ${errorData}`)
    }

    const data = await response.json()
    console.log('API success response:', data)
    return data.item
  } catch (error) {
    console.error('Error adding item:', error)
    throw error // Re-throw to see the actual error in the UI
  }
}

/**
 * Update an existing stolen item
 */
export async function updateItem(itemData: any): Promise<StolenItem | null> {
  try {
    const response = await fetch('/api/items', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData)
    })

    if (!response.ok) {
      throw new Error('Failed to update item')
    }

    const data = await response.json()
    return data.item
  } catch (error) {
    console.error('Error updating item:', error)
    return null
  }
}

/**
 * Delete a stolen item
 */
export async function deleteItem(itemId: number): Promise<boolean> {
  try {
    const response = await fetch(`/api/items?id=${itemId}`, {
      method: 'DELETE'
    })

    return response.ok
  } catch (error) {
    console.error('Error deleting item:', error)
    return false
  }
}
