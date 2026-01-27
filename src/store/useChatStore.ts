import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  senderId: string; // 'me' or other
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface Chat {
  id: string;
  itemId?: string; // Link to the item (for clan chats)
  isGroupChat: boolean;
  participant?: {
    id: string;
    name: string;
    avatarUrl: string;
    isOnline: boolean;
  };
  groupInfo?: {
    name: string;
    avatarUrl: string;
    participantCount: number;
  };
  lastMessage: Message;
  unreadCount: number;
  messages: Message[];
  telegramGroupLink?: string; // For future Telegram integration
}

interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
  isChatListOpen: boolean;
  setChatListOpen: (isOpen: boolean) => void;
  openChat: (chatId: string) => void;
  closeChat: () => void;
  sendMessage: (chatId: string, text: string) => void;
  createGroupChat: (itemId: string, itemTitle: string, itemType: string) => Chat;
}

// Mock Data
const MOCK_CHATS: Chat[] = [
  {
    id: '1',
    isGroupChat: false,
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
  }
];

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
  chats: MOCK_CHATS,
  activeChatId: null,
  isChatListOpen: false,
  setChatListOpen: (isOpen) => set({ isChatListOpen: isOpen }),
  openChat: (chatId) => set({ activeChatId: chatId, isChatListOpen: true }),
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
  }),
  createGroupChat: (itemId, itemTitle, itemType) => {
      // Проверяем, не существует ли уже чат для этого item
      const existingChat = get().chats.find(c => c.itemId === itemId && c.isGroupChat);
      if (existingChat) {
          console.log('Chat already exists for item:', itemId);
          return existingChat; // Возвращаем существующий чат
      }

      const newChat: Chat = {
          id: `group_${itemId}`,
          itemId,
          isGroupChat: true,
          groupInfo: {
              name: `${itemType === 'EVENT' ? '🎉' : '📦'} ${itemTitle}`,
              avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=' + itemId,
              participantCount: 1
          },
          unreadCount: 0,
          lastMessage: {
              id: 'welcome',
              senderId: 'system',
              text: `Welcome to the ${itemType === 'EVENT' ? 'event' : 'task'} chat!`,
              timestamp: new Date().toISOString(),
              isRead: true
          },
          messages: [
              {
                  id: 'welcome',
                  senderId: 'system',
                  text: itemType === 'EVENT' 
                    ? `🎉 Добро пожаловать! Это чат события "${itemTitle}". Обсуждайте детали здесь. Все сообщения синхронизируются с Telegram.` 
                    : `📦 Добро пожаловать! Это чат задачи "${itemTitle}". Координируйте выполнение здесь. Все сообщения синхронизируются с Telegram.`,
                  timestamp: new Date().toISOString(),
                  isRead: true
              }
          ],
          telegramGroupLink: undefined // Will be set after API call
      };

      set((state) => ({
          chats: [...state.chats, newChat]
      }));

      // Call API to create Telegram forum topic (async, non-blocking)
      fetch('/api/telegram/create-group', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, title: itemTitle, itemType })
      })
      .then(res => res.json())
      .then(data => {
          if (data.success && data.deepLink) {
              // Update chat with Telegram topic link
              set((state) => ({
                  chats: state.chats.map(c => 
                      c.id === `group_${itemId}` 
                      ? { 
                          ...c, 
                          telegramGroupLink: data.deepLink,
                          messages: [
                              ...c.messages,
                              {
                                  id: 'telegram_ready',
                                  senderId: 'system',
                                  text: '✅ Telegram топик создан! Теперь вы можете общаться как в приложении, так и в Telegram.',
                                  timestamp: new Date().toISOString(),
                                  isRead: true
                              }
                          ]
                      }
                      : c
                  )
              }));
          } else {
              console.error('Failed to create Telegram topic:', data);
              // Add error message
              set((state) => ({
                  chats: state.chats.map(c => 
                      c.id === `group_${itemId}` 
                      ? { 
                          ...c,
                          messages: [
                              ...c.messages,
                              {
                                  id: 'telegram_error',
                                  senderId: 'system',
                                  text: '⚠️ Не удалось создать Telegram топик. Вы можете продолжить общение в приложении.',
                                  timestamp: new Date().toISOString(),
                                  isRead: true
                              }
                          ]
                      }
                      : c
                  )
              }));
          }
      })
      .catch(err => {
          console.error('Failed to create Telegram topic:', err);
          set((state) => ({
              chats: state.chats.map(c => 
                  c.id === `group_${itemId}` 
                  ? { 
                      ...c,
                      messages: [
                          ...c.messages,
                          {
                              id: 'telegram_error',
                              senderId: 'system',
                              text: '⚠️ Ошибка подключения к Telegram. Попробуйте позже.',
                              timestamp: new Date().toISOString(),
                              isRead: true
                          }
                      ]
                  }
                  : c
              )
          }));
      });

      return newChat;
  }
}),
    {
      name: 'locals-chat-storage', // Имя ключа в localStorage
      partialize: (state) => ({
        chats: state.chats, // Сохраняем только чаты, не UI состояние
      }),
    }
  )
);