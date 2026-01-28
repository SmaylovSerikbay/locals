import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  username?: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  languageCode: string;
  reputation: number;
  instagram?: string;
}

interface UserState {
  user: User | null;
  isProfileOpen: boolean;
  loading: boolean;
  
  // Actions
  setUser: (user: User) => void;
  setProfileOpen: (open: boolean) => void;
  updateInstagram: (instagram: string) => void;
  syncUserWithAPI: (telegramUser: any) => Promise<void>;
  fetchUser: (userId: number) => Promise<void>;
  updateUser: (userId: number, updates: Partial<User>) => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isProfileOpen: false,
      loading: false,
      
      setUser: (user) => set({ user }),
      setProfileOpen: (isProfileOpen) => set({ isProfileOpen }),
      
      updateInstagram: (instagram) =>
        set((state) => ({
          user: state.user ? { ...state.user, instagram } : null,
        })),
      
      // Sync Telegram user with API (upsert)
      syncUserWithAPI: async (telegramUser) => {
        set({ loading: true });
        try {
          const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: telegramUser.id,
              username: telegramUser.username,
              first_name: telegramUser.first_name,
              last_name: telegramUser.last_name,
              avatar_url: telegramUser.photo_url,
              language_code: telegramUser.language_code,
            }),
          });
          
          if (!response.ok) throw new Error('Failed to sync user');
          
          const data = await response.json();
          
          // Map API user to local user format
          const user: User = {
            id: data.user.id,
            username: data.user.username,
            firstName: data.user.first_name,
            lastName: data.user.last_name,
            photoUrl: data.user.avatar_url,
            languageCode: data.user.language_code || 'ru',
            reputation: data.user.reputation || 5.0,
          };
          
          set({ user, loading: false });
        } catch (error) {
          console.error('Error syncing user:', error);
          set({ loading: false });
        }
      },
      
      // Fetch user by ID
      fetchUser: async (userId) => {
        set({ loading: true });
        try {
          const response = await fetch(`/api/users/${userId}`);
          if (!response.ok) throw new Error('Failed to fetch user');
          
          const data = await response.json();
          
          const user: User = {
            id: data.user.id,
            username: data.user.username,
            firstName: data.user.first_name,
            lastName: data.user.last_name,
            photoUrl: data.user.avatar_url,
            languageCode: data.user.language_code || 'ru',
            reputation: data.user.reputation || 5.0,
          };
          
          set({ user, loading: false });
        } catch (error) {
          console.error('Error fetching user:', error);
          set({ loading: false });
        }
      },
      
      // Update user
      updateUser: async (userId, updates) => {
        try {
          const response = await fetch(`/api/users/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: updates.username,
              first_name: updates.firstName,
              last_name: updates.lastName,
              avatar_url: updates.photoUrl,
              language_code: updates.languageCode,
            }),
          });
          
          if (!response.ok) throw new Error('Failed to update user');
          
          const data = await response.json();
          
          const user: User = {
            id: data.user.id,
            username: data.user.username,
            firstName: data.user.first_name,
            lastName: data.user.last_name,
            photoUrl: data.user.avatar_url,
            languageCode: data.user.language_code || 'ru',
            reputation: data.user.reputation || 5.0,
            instagram: get().user?.instagram,
          };
          
          set({ user });
        } catch (error) {
          console.error('Error updating user:', error);
        }
      },
    }),
    {
      name: 'locals-user-storage',
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);