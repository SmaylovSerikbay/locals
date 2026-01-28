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
  location: [number, number]; // [lat, lng]
  status: ItemStatus;
  author: {
    id: string; // added ID to check ownership
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
  deleteItem: (id: string) => Promise<void>;
  addResponse: (itemId: string, userId: number, message: string) => Promise<void>;
  updateResponseStatus: (responseId: string, status: ResponseStatus, authorId: number) => Promise<void>;
  completeItem: (itemId: string, userId: number) => Promise<void>;
  
  // Real-time subscriptions
  subscribeToItems: () => () => void;
}

// Mock Data
const MOCK_ITEMS: Item[] = [
  {
    id: '1',
    type: 'TASK',
    title: 'Помочь с переездом',
    description: 'Нужно перенести 5 коробок на 3 этаж. Лифта нет.',
    price: 15,
    currency: 'USD',
    location: [43.238949, 76.889709],
    status: 'OPEN',
    author: {
      id: 'user_1',
      name: 'Алексей',
      avatarUrl: 'https://i.pravatar.cc/150?u=1',
      reputation: 4.8
    },
    responses: [
        {
            id: 'r1',
            userId: 'u3',
            userName: 'Ержан',
            userAvatar: 'https://i.pravatar.cc/150?u=3',
            userReputation: 4.5,
            message: 'Могу помочь, есть грузчики.',
            status: 'PENDING',
            createdAt: '2023-10-27T10:00:00'
        }
    ]
  },
  {
    id: '2',
    type: 'EVENT',
    title: 'Играем в Мафию',
    description: 'Собираемся в кафе "Центр". Новичкам рады!',
    eventDate: '2023-10-28T19:00:00',
    currency: 'USD',
    location: [43.242949, 76.895709],
    status: 'OPEN',
    author: {
      id: 'user_2',
      name: 'Мария',
      avatarUrl: 'https://i.pravatar.cc/150?u=2',
      reputation: 5.0
    },
    responses: []
  },
  {
    id: '3',
    type: 'TASK',
    title: 'Тестовое задание от меня',
    description: 'Это мой таск, я хочу видеть отклики.',
    price: 5000,
    currency: 'KZT',
    location: [43.235949, 76.885709],
    status: 'OPEN',
    author: {
      id: '123456', // Matches current mock user ID
      name: 'Me (You)',
      avatarUrl: 'https://i.pravatar.cc/300?u=meirzhan',
      reputation: 5.0
    },
    responses: [
        {
            id: 'r2',
            userId: 'u4',
            userName: 'Светлана',
            userAvatar: 'https://i.pravatar.cc/150?u=4',
            userReputation: 4.9,
            message: 'Живу рядом, могу подойти через 15 мин.',
            status: 'PENDING',
            createdAt: '2023-10-27T11:30:00'
        },
        {
            id: 'r3',
            userId: 'u5',
            userName: 'Дмитрий',
            userAvatar: 'https://i.pravatar.cc/150?u=5',
            userReputation: 3.5,
            message: 'Сделаю быстро.',
            status: 'PENDING',
            createdAt: '2023-10-27T11:35:00'
        }
    ]
  }
];

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
      set({ items: data.items || [], loading: false });
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
      set({ items: data.items || [], loading: false });
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
      
      // Update item in list
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? data.item : item)),
        selectedItem: data.item,
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
      set((state) => ({
        items: [data.item, ...state.items],
        loading: false,
      }));
      
      return data.item;
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
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? data.item : item)),
        selectedItem: state.selectedItem?.id === id ? data.item : state.selectedItem,
      }));
    } catch (error) {
      console.error('Error updating item:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },
  
  // Delete item
  deleteItem: async (id) => {
    try {
      const response = await fetch(`/api/items/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete item');
      
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        selectedItem: state.selectedItem?.id === id ? null : state.selectedItem,
      }));
    } catch (error) {
      console.error('Error deleting item:', error);
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
      
      const data = await response.json();
      
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
      set((state) => ({
        items: state.items.map((item) => (item.id === itemId ? data.item : item)),
        selectedItem: state.selectedItem?.id === itemId ? data.item : state.selectedItem,
      }));
    } catch (error) {
      console.error('Error completing item:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
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
          
          if (payload.eventType === 'INSERT') {
            set((state) => ({
              items: [payload.new as Item, ...state.items],
            }));
          } else if (payload.eventType === 'UPDATE') {
            set((state) => ({
              items: state.items.map((item) =>
                item.id === payload.new.id ? (payload.new as Item) : item
              ),
              selectedItem:
                state.selectedItem?.id === payload.new.id
                  ? (payload.new as Item)
                  : state.selectedItem,
            }));
          } else if (payload.eventType === 'DELETE') {
            set((state) => ({
              items: state.items.filter((item) => item.id !== payload.old.id),
              selectedItem:
                state.selectedItem?.id === payload.old.id ? null : state.selectedItem,
            }));
          }
        }
      )
      .subscribe();
    
    // Return cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  },
}));