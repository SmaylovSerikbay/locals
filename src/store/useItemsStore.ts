import { create } from 'zustand';

export type ItemType = 'TASK' | 'EVENT';
export type Currency = 'USD' | 'KZT' | 'RUB' | 'EUR';
export type ItemStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
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
  setSelectedItem: (item: Item | null) => void;
  addItem: (item: Item) => void;
  addResponse: (itemId: string, response: Response) => void;
  updateResponseStatus: (itemId: string, responseId: string, status: ResponseStatus) => void;
  completeItem: (itemId: string) => void;
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

export const useItemsStore = create<ItemsState>((set) => ({
  items: MOCK_ITEMS,
  selectedItem: null,
  setSelectedItem: (item) => set({ selectedItem: item }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  addResponse: (itemId, response) => set((state) => ({
    items: state.items.map(item => 
        item.id === itemId 
        ? { ...item, responses: [...item.responses, response] }
        : item
    )
  })),
  updateResponseStatus: (itemId, responseId, status) => set((state) => ({
      items: state.items.map(item => {
          if (item.id !== itemId) return item;
          
          // If accepting a user, assign executor
          const executorId = status === 'ACCEPTED' 
            ? item.responses.find(r => r.id === responseId)?.userId 
            : item.executorId;

          // Update item status if accepted
          const itemStatus = status === 'ACCEPTED' ? 'IN_PROGRESS' : item.status;

          return {
              ...item,
              status: itemStatus,
              executorId,
              responses: item.responses.map(r => 
                  r.id === responseId 
                  ? { ...r, status } 
                  : (status === 'ACCEPTED' ? { ...r, status: 'REJECTED' as ResponseStatus } : r) // Reject others if one is accepted
              )
          };
      })
  })),
  completeItem: (itemId) => set((state) => ({
      items: state.items.map(item => 
          item.id === itemId 
          ? { ...item, status: 'COMPLETED' }
          : item
      )
  }))
}));