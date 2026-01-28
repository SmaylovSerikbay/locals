import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export type ItemType = 'TASK' | 'EVENT';
export type Currency = 'USD' | 'KZT' | 'RUB' | 'EUR';
export type ItemStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ResponseStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface Review {
  id: string;
  authorId: string;
  rating: number; // 1-5
  text: string;
  createdAt: string;
}

export interface Response {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userReputation: number;
  message: string;
  status: ResponseStatus;
  createdAt: string;
}

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  price?: number; // For tasks
  currency: Currency;
  eventDate?: string; // For events
  latitude: number;
  longitude: number;
  location?: [number, number]; // [lat, lng]
  status: ItemStatus;
  author: {
    id: number;
    name: string;
    avatarUrl: string;
    reputation: number;
  };
  responses: Response[]; // Candidates
  executorId?: string; // Who is doing the task
  reviews?: Review[];
}

interface ItemsState {
  items: Item[];
  selectedItem: Item | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setSelectedItem: (item: Item | null) => void;
  fetchItems: (filters?: { type?: ItemType; status?: ItemStatus; author_id?: string }) => Promise<void>;
  fetchNearbyItems: (lat: number, lng: number, radius?: number, type?: ItemType) => Promise<void>;
  fetchItemById: (id: string) => Promise<void>;
  createItem: (itemData: Partial<Item>) => Promise<Item | null>;
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>;
  deleteItem: (id: string, authorId: number) => Promise<boolean>;
  addResponse: (itemId: string, userId: number, message: string) => Promise<void>;
  updateResponseStatus: (responseId: string, status: ResponseStatus, authorId: number) => Promise<void>;
  completeItem: (itemId: string, userId: number) => Promise<void>;
  joinEvent: (itemId: string, userId: number) => Promise<any>;
  getJoinRequests: (itemId: string, status?: string) => Promise<any[]>;
  moderateJoinRequest: (itemId: string, participantId: string, status: 'APPROVED' | 'REJECTED', authorId: number) => Promise<any>;
  
  // Real-time subscriptions
  subscribeToItems: () => () => void;
}

// Helper to map API response to Domain Model
const mapItem = (data: any): Item => {
  const authorData = data.author || {};
  return {
    id: data.id,
    type: data.type,
    title: data.title,
    description: data.description,
    price: data.price,
    currency: data.currency,
    eventDate: data.event_date || data.eventDate, // Handle both cases
    latitude: data.latitude,
    longitude: data.longitude,
    location: [data.latitude, data.longitude],
    status: data.status,
    author: {
      id: authorData.id,
      name: (authorData.first_name && authorData.last_name) 
            ? `${authorData.first_name} ${authorData.last_name}` 
            : (authorData.first_name || authorData.username || 'User'),
      avatarUrl: authorData.avatar_url || authorData.avatarUrl, // Map snake_case to camelCase
      reputation: authorData.reputation || 5.0
    },
    responses: (data.responses || []).map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      userName: r.user?.first_name || 'User',
      userAvatar: r.user?.avatar_url,
      userReputation: r.user?.reputation || 5.0,
      message: r.message,
      status: r.status,
      createdAt: r.created_at
    })),
    executorId: data.executor_id,
    reviews: data.reviews || []
  };
};

export const useItemsStore = create<ItemsState>((set, get) => ({
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
  
  setSelectedItem: (item) => set({ selectedItem: item }),
  
  // Fetch all items with filters
  fetchItems: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.author_id) params.append('author_id', filters.author_id);
      
      const response = await fetch(`/api/items?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch items');
      
      const data = await response.json();
      const mappedItems = (data.items || []).map(mapItem);
      
      set({ items: mappedItems, loading: false });
    } catch (error) {
      console.error('Error fetching items:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },
  
  // Fetch nearby items by location
  fetchNearbyItems: async (lat, lng, radius = 5000, type) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radius: radius.toString(),
      });
      if (type) params.append('type', type);
      
      const response = await fetch(`/api/items/nearby?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch nearby items');
      
      const data = await response.json();
      const mappedItems = (data.items || []).map(mapItem);
      
      set({ items: mappedItems, loading: false });
    } catch (error) {
      console.error('Error fetching nearby items:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },
  
  // Fetch single item by ID
  fetchItemById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/items/${id}`);
      if (!response.ok) throw new Error('Failed to fetch item');
      
      const data = await response.json();
      const mappedItem = mapItem(data.item);
      
      // Update item in list
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? mappedItem : item)),
        selectedItem: mappedItem,
        loading: false,
      }));
    } catch (error) {
      console.error('Error fetching item:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },
  
  // Create new item
  createItem: async (itemData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      
      if (!response.ok) throw new Error('Failed to create item');
      
      const data = await response.json();
      const mappedItem = mapItem(data.item);
      
      set((state) => ({
        items: [mappedItem, ...state.items],
        loading: false,
      }));
      
      return mappedItem;
    } catch (error) {
      console.error('Error creating item:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
      return null;
    }
  },
  
  // Update item
  updateItem: async (id, updates) => {
    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) throw new Error('Failed to update item');
      
      const data = await response.json();
      const mappedItem = mapItem(data.item);

      set((state) => ({
        items: state.items.map((item) => (item.id === id ? mappedItem : item)),
        selectedItem: state.selectedItem?.id === id ? mappedItem : state.selectedItem,
      }));
    } catch (error) {
      console.error('Error updating item:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },
  
  
  // Add response to item
  addResponse: async (itemId, userId, message) => {
    try {
      const response = await fetch(`/api/items/${itemId}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, message }),
      });
      
      if (!response.ok) throw new Error('Failed to add response');
      
      // Refresh item data to get updated responses
      await get().fetchItemById(itemId);
    } catch (error) {
      console.error('Error adding response:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },
  
  // Update response status (accept/reject)
  updateResponseStatus: async (responseId, status, authorId) => {
    try {
      const response = await fetch(`/api/responses/${responseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, author_id: authorId }),
      });
      
      if (!response.ok) throw new Error('Failed to update response');
      
      // Refresh the item to get updated data
      if (get().selectedItem) {
        await get().fetchItemById(get().selectedItem!.id);
      }
    } catch (error) {
      console.error('Error updating response status:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },
  
  // Complete item
  completeItem: async (itemId, userId) => {
    try {
      const response = await fetch(`/api/items/${itemId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      
      if (!response.ok) throw new Error('Failed to complete item');
      
      const data = await response.json();
      const mappedItem = mapItem(data.item);

      set((state) => ({
        items: state.items.map((item) => (item.id === itemId ? mappedItem : item)),
        selectedItem: state.selectedItem?.id === itemId ? mappedItem : state.selectedItem,
      }));
    } catch (error) {
      console.error('Error completing item:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  // Join event
  joinEvent: async (itemId, userId) => {
    try {
      const response = await fetch(`/api/items/${itemId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join event');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Join event error:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
      return null;
    }
  },

  // Get join requests
  getJoinRequests: async (itemId, status) => {
    try {
      const url = status 
        ? `/api/items/${itemId}/join?status=${status}`
        : `/api/items/${itemId}/join`;
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch join requests');
      }

      const data = await response.json();
      return data.participants || [];
    } catch (error) {
      console.error('Get join requests error:', error);
      return [];
    }
  },

  // Moderate join request
  moderateJoinRequest: async (itemId, participantId, status, authorId) => {
    try {
      const response = await fetch(`/api/items/${itemId}/join/${participantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, authorId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to moderate request');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Moderate join request error:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
      return null;
    }
  },

  // Delete item by author
  deleteItem: async (itemId, authorId) => {
    try {
      const response = await fetch(`/api/items/${itemId}/delete?authorId=${authorId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete item');
      }

      // Remove from local state
      set((state) => ({
        items: state.items.filter((item) => item.id !== itemId),
        selectedItem: state.selectedItem?.id === itemId ? null : state.selectedItem,
      }));

      return true;
    } catch (error) {
      console.error('Delete item error:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  },
  
  // Real-time subscriptions
  subscribeToItems: () => {
    const channel = supabase
      .channel('items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
        },
        (payload) => {
          console.log('Item changed:', payload);
          // For real-time updates, we should probably re-fetch to get the full relations
          // or construct a partial object.
          // Since mapping is needed, basic payload might not be enough if we need author data.
          // For now, let's keep it simple or trigger a refetch if needed.
          
          if (payload.eventType === 'INSERT') {
             // Ideally fetch the full item by ID
             const newItem = payload.new as any;
             // We can't fully map without relations, but we can add what we have
             // Better strategy: fetchItemById(newItem.id)
             // But we can't call async actions easily from here without `get().fetchItemById`
          } 
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  },
}));