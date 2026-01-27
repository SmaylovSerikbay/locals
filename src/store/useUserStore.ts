import { create } from 'zustand';

export interface User {
  id: number;
  username?: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  languageCode: string;
  instagram?: string;
}

interface UserState {
  user: User | null;
  isProfileOpen: boolean;
  setUser: (user: User) => void;
  setProfileOpen: (open: boolean) => void;
  updateInstagram: (instagram: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isProfileOpen: false,
  setUser: (user) => set({ user }),
  setProfileOpen: (isProfileOpen) => set({ isProfileOpen }),
  updateInstagram: (instagram) => set((state) => ({
    user: state.user ? { ...state.user, instagram } : null
  })),
}));