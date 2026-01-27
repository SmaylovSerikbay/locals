import { create } from 'zustand';
import { Item } from '@/store/useItemsStore';

interface SearchState {
  isSearchOpen: boolean;
  searchQuery: string;
  setSearchOpen: (isOpen: boolean) => void;
  setSearchQuery: (query: string) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  isSearchOpen: false,
  searchQuery: '',
  setSearchOpen: (isOpen) => set({ isSearchOpen: isOpen }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));