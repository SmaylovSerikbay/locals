'use client';

import { Search, Plus, User, MessageCircle } from 'lucide-react';
import { useCreateStore } from '@/store/useCreateStore';
import { useUserStore } from '@/store/useUserStore';
import { useChatStore } from '@/store/useChatStore';

export default function BottomDock() {
  const { setIsOpen, reset } = useCreateStore();
  const { setProfileOpen } = useUserStore();
  const { setChatListOpen } = useChatStore();

  const handleCreateClick = () => {
    reset();
    setIsOpen(true);
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 z-[500] px-4 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-[280px] bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-2 flex items-center justify-between">
        
        <button className="flex flex-col items-center justify-center w-12 h-12 rounded-xl hover:bg-gray-100/50 transition-colors gap-1">
          <Search className="w-6 h-6 text-gray-600" />
        </button>
        
        <button 
          onClick={() => setChatListOpen(true)}
          className="flex flex-col items-center justify-center w-12 h-12 rounded-xl hover:bg-gray-100/50 transition-colors gap-1"
        >
          <MessageCircle className="w-6 h-6 text-gray-600" />
        </button>

        <button 
          onClick={handleCreateClick}
          className="flex items-center justify-center w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 text-white transform -translate-y-6 border-4 border-white transition-transform active:scale-95"
        >
          <Plus className="w-7 h-7" />
        </button>

        <button 
          onClick={() => setProfileOpen(true)}
          className="flex flex-col items-center justify-center w-12 h-12 rounded-xl hover:bg-gray-100/50 transition-colors gap-1"
        >
          <User className="w-6 h-6 text-gray-600" />
        </button>
        
      </div>
    </div>
  );
}