'use client';

import { Search, Plus, User, MessageCircle } from 'lucide-react';
import { useCreateStore } from '@/store/useCreateStore';
import { useUserStore } from '@/store/useUserStore';
import { useChatStore } from '@/store/useChatStore';
import { useSearchStore } from '@/store/useSearchStore';
import { motion } from 'framer-motion';

export default function BottomDock() {
  const { setIsOpen, reset } = useCreateStore();
  const { setProfileOpen } = useUserStore();
  const { setChatListOpen } = useChatStore();
  const { setSearchOpen } = useSearchStore();

  const handleCreateClick = () => {
    reset();
    setIsOpen(true);
  };

  return (
    <div className="fixed bottom-8 left-0 right-0 z-[500] px-4 pointer-events-none flex justify-center">
      <div className="pointer-events-auto bg-black/80 backdrop-blur-xl rounded-[32px] shadow-2xl shadow-black/30 border border-white/10 p-2 flex items-center justify-between gap-2 min-w-[280px]">
        
        <DockButton 
          icon={<Search className="w-6 h-6" />} 
          onClick={() => setSearchOpen(true)} 
        />
        
        <DockButton 
          icon={<MessageCircle className="w-6 h-6" />} 
          onClick={() => setChatListOpen(true)} 
        />

        {/* Central Action Button */}
        <div className="px-2">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateClick}
              className="flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-[#5D5FEF] to-[#00E0FF] rounded-full shadow-lg shadow-[#5D5FEF]/40 text-white border-4 border-[#121212] relative -mt-8 hover:shadow-[#5D5FEF]/60 transition-shadow"
            >
              <Plus className="w-8 h-8" />
            </motion.button>
        </div>

        <DockButton 
          icon={<User className="w-6 h-6" />} 
          onClick={() => setProfileOpen(true)} 
        />
        
      </div>
    </div>
  );
}

function DockButton({ icon, onClick }: { icon: React.ReactNode, onClick: () => void }) {
  return (
    <motion.button 
      whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl text-gray-400 hover:text-white transition-colors"
    >
      {icon}
    </motion.button>
  );
}