import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

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
  loading: boolean;
  
  // Actions
  setChatListOpen: (isOpen: boolean) => void;
  openChat: (chatId: string) => void;
  closeChat: () => void;
  fetchMessages: (itemId: string) => Promise<void>;
  sendMessage: (itemId: string, senderId: number, text: string) => Promise<void>;
  createGroupChat: (itemId: string, itemTitle: string, itemType: string) => Chat;
  createPrivateChat: (userId: string, userName: string, userAvatar: string, itemId?: string, itemTitle?: string) => Chat;
  
  // Real-time subscriptions
  subscribeToMessages: (itemId: string) => () => void;
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
  chats: [],
  activeChatId: null,
  isChatListOpen: false,
  loading: false,
  
  setChatListOpen: (isOpen) => set({ isChatListOpen: isOpen }),
  openChat: (chatId) => set({ activeChatId: chatId, isChatListOpen: true }),
  closeChat: () => set({ activeChatId: null }),
  
  // Fetch messages from API
  fetchMessages: async (itemId) => {
    set({ loading: true });
    try {
      const response = await fetch(`/api/messages?item_id=${itemId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const data = await response.json();
      
      // Update chat with messages
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat.itemId === itemId
            ? {
                ...chat,
                messages: data.messages.map((msg: any) => ({
                  id: msg.id,
                  senderId: msg.sender_id.toString(),
                  text: msg.text,
                  timestamp: msg.created_at,
                  isRead: true,
                })),
                lastMessage: data.messages.length > 0 ? {
                  id: data.messages[data.messages.length - 1].id,
                  senderId: data.messages[data.messages.length - 1].sender_id.toString(),
                  text: data.messages[data.messages.length - 1].text,
                  timestamp: data.messages[data.messages.length - 1].created_at,
                  isRead: true,
                } : chat.lastMessage,
              }
            : chat
        ),
        loading: false,
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      set({ loading: false });
    }
  },
  
  // Send message via API
  sendMessage: async (itemId, senderId, text) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: itemId,
          sender_id: senderId,
          text,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      
      const data = await response.json();
      
      // Add message to local state
      const newMessage: Message = {
        id: data.message.id,
        senderId: senderId.toString(),
        text: data.message.text,
        timestamp: data.message.created_at,
        isRead: true,
      };
      
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat.itemId === itemId
            ? {
                ...chat,
                messages: [...chat.messages, newMessage],
                lastMessage: newMessage,
              }
            : chat
        ),
      }));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  },
  
  // Real-time subscription to messages
  subscribeToMessages: (itemId) => {
    const channel = supabase
      .channel(`messages-${itemId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `item_id=eq.${itemId}`,
        },
        (payload) => {
          console.log('New message:', payload);
          
          const newMessage: Message = {
            id: payload.new.id,
            senderId: payload.new.sender_id.toString(),
            text: payload.new.text,
            timestamp: payload.new.created_at,
            isRead: false,
          };
          
          set((state) => ({
            chats: state.chats.map((chat) =>
              chat.itemId === itemId
                ? {
                    ...chat,
                    messages: [...chat.messages, newMessage],
                    lastMessage: newMessage,
                    unreadCount: chat.unreadCount + 1,
                  }
                : chat
            ),
          }));
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  },
  
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
  },
  
  createPrivateChat: (userId, userName, userAvatar, itemId, itemTitle) => {
      // Проверяем, не существует ли уже приватный чат с этим пользователем
      const existingChat = get().chats.find(
          c => !c.isGroupChat && c.participant?.id === userId
      );
      if (existingChat) {
          console.log('Private chat already exists with user:', userId);
          return existingChat;
      }

      const newChat: Chat = {
          id: `private_${userId}`,
          isGroupChat: false,
          participant: {
              id: userId,
              name: userName,
              avatarUrl: userAvatar,
              isOnline: true // Mock
          },
          unreadCount: 0,
          lastMessage: {
              id: 'welcome',
              senderId: 'system',
              text: itemTitle 
                  ? `Чат по задаче "${itemTitle}"` 
                  : `Начните общение`,
              timestamp: new Date().toISOString(),
              isRead: true
          },
          messages: [
              {
                  id: 'welcome',
                  senderId: 'system',
                  text: itemTitle 
                      ? `📦 Чат создан для обсуждения задачи "${itemTitle}". Договоритесь о деталях!`
                      : `👋 Начните общение с ${userName}`,
                  timestamp: new Date().toISOString(),
                  isRead: true
              }
          ]
      };

      set((state) => ({
          chats: [...state.chats, newChat]
      }));

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