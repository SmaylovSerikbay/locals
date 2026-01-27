import { create } from 'zustand';
import { ItemType, Currency } from './useItemsStore';

interface CreateState {
  isOpen: boolean;
  step: number;
  type: ItemType | null;
  location: [number, number] | null;
  formData: {
    title: string;
    description: string;
    price: string;
    currency: Currency;
    date: string;
  };
  setIsOpen: (isOpen: boolean) => void;
  setStep: (step: number) => void;
  setType: (type: ItemType) => void;
  setLocation: (location: [number, number]) => void;
  setFormData: (data: Partial<CreateState['formData']>) => void;
  reset: () => void;
}

export const useCreateStore = create<CreateState>((set) => ({
  isOpen: false,
  step: 1,
  type: null,
  location: null,
  formData: {
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    date: ''
  },
  setIsOpen: (isOpen) => set({ isOpen }),
  setStep: (step) => set({ step }),
  setType: (type) => set({ type }),
  setLocation: (location) => set({ location }),
  setFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
  reset: () => set({
    step: 1,
    type: null,
    location: null,
    formData: {
      title: '',
      description: '',
      price: '',
      currency: 'USD',
      date: ''
    }
  })
}));