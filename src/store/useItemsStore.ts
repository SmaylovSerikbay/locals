import { create } from 'zustand';

export type ItemType = 'TASK' | 'EVENT';
export type Currency = 'USD' | 'KZT' | 'RUB' | 'EUR';

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  price?: number; // For tasks
  currency: Currency;
  eventDate?: string; // For events
  location: [number, number]; // [lat, lng]
  author: {
    name: string;
    avatarUrl: string;
    reputation: number;
  };
}

interface ItemsState {
  items: Item[];
  selectedItem: Item | null;
  setSelectedItem: (item: Item | null) => void;
  addItem: (item: Item) => void;
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
    location: [43.238949, 76.889709], // Almaty
    author: {
      name: 'Алексей',
      avatarUrl: 'https://i.pravatar.cc/150?u=1',
      reputation: 4.8
    }
  },
  {
    id: '2',
    type: 'EVENT',
    title: 'Играем в Мафию',
    description: 'Собираемся в кафе "Центр". Новичкам рады!',
    eventDate: '2023-10-28T19:00:00',
    currency: 'USD',
    location: [43.242949, 76.895709], // Nearby
    author: {
      name: 'Мария',
      avatarUrl: 'https://i.pravatar.cc/150?u=2',
      reputation: 5.0
    }
  },
  {
    id: '3',
    type: 'TASK',
    title: 'Выгулять собаку',
    description: 'Маленький корги, очень добрый. Гулять 30 минут.',
    price: 10,
    currency: 'USD',
    location: [43.235949, 76.885709],
    author: {
      name: 'Ержан',
      avatarUrl: 'https://i.pravatar.cc/150?u=3',
      reputation: 4.5
    }
  }
];

export const useItemsStore = create<ItemsState>((set) => ({
  items: MOCK_ITEMS,
  selectedItem: null,
  setSelectedItem: (item) => set({ selectedItem: item }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
}));