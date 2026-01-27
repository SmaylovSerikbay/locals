import { create } from 'zustand';

export interface Message {
  id: string;
  senderId: string; // 'me' or other
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface Chat {
  id: string;
  participant: {
    id: string;
    name: string;
    avatarUrl: string;
    isOnline: boolean;
  };
  lastMessage: Message;
  unreadCount: number;
  messages: Message[];
}

interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
  isChatListOpen: boolean;
  setChatListOpen: (isOpen: boolean) => void;
  openChat: (chatId: string) => void;
  closeChat: () => void;
  sendMessage: (chatId: string, text: string) => void;
}

// Mock Data
const MOCK_CHATS: Chat[] = [
  {
    id: '1',
    participant: {
      id: 'u2',
      name: 'Алексей',
      avatarUrl: 'https://i.pravatar.cc/150?u=1',
      isOnline: true
    },
    unreadCount: 2,
    lastMessage: {
      id: 'm2',
      senderId: 'u2',
      text: 'Да, я буду через 15 минут.',
      timestamp: '2023-10-27T14:30:00',
      isRead: false
    },
    messages: [
      {
        id: 'm1',
        senderId: 'me',
        text: 'Привет! Ты сможешь помочь с коробками?',
        timestamp: '2023-10-27T14:25:00',
        isRead: true
      },
      {
        id: 'm2',
        senderId: 'u2',
        text: 'Да, я буду через 15 минут.',
        timestamp: '2023-10-27T14:30:00',
        isRead: false
      }
    ]
  },
  {
    id: '2',
    participant: {
      id: 'u3',
      name: 'Мария',
      avatarUrl: 'https://i.pravatar.cc/150?u=2',
      isOnline: false
    },
    unreadCount: 0,
    lastMessage: {
      id: 'm4',
      senderId: 'me',
      text: 'Круто, спасибо за игру!',
      timestamp: '2023-10-26T20:15:00',
      isRead: true
    },
    messages: [
      {
        id: 'm3',
        senderId: 'u3',
        text: 'Было весело вчера!',
        timestamp: '2023-10-26T10:00:00',
        isRead: true
      },
      {
        id: 'm4',
        senderId: 'me',
        text: 'Круто, спасибо за игру!',
        timestamp: '2023-10-26T20:15:00',
        isRead: true
      }
    ]
  }
];

export const useChatStore = create<ChatState>((set) => ({
  chats: MOCK_CHATS,
  activeChatId: null,
  isChatListOpen: false,
  setChatListOpen: (isOpen) => set({ isChatListOpen: isOpen }),
  openChat: (chatId) => set({ activeChatId: chatId }),
  closeChat: () => set({ activeChatId: null }),
  sendMessage: (chatId, text) => set((state) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: 'me',
      text,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    const updatedChats = state.chats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: newMessage
        };
      }
      return chat;
    });

    return { chats: updatedChats };
  })
}));