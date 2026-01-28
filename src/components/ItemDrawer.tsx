'use client';

import { Drawer } from 'vaul';
import { useItemsStore, Response } from '@/store/useItemsStore';
import { Calendar, Clock, Star, X, MapPin, MessageCircle, CheckCircle, DollarSign, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useUserStore } from '@/store/useUserStore';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SlideButton from '@/components/ui/SlideButton';
import { useChatStore } from '@/store/useChatStore';

export default function ItemDrawer() {
  const { selectedItem, setSelectedItem, addResponse, updateResponseStatus, completeItem } = useItemsStore();
  const { user } = useUserStore();
  const { openChat, setChatListOpen, chats } = useChatStore();
  const t = useTranslations('ItemDetails');
  
  const [activeTab, setActiveTab] = useState<'details' | 'responses'>('details');
  const contentRef = useRef<HTMLDivElement>(null);

  const isOpen = !!selectedItem;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
        setSelectedItem(null);
        setActiveTab('details');
    }
  };

  if (!selectedItem) return null;

  const isTask = selectedItem.type === 'TASK';
  const isOwner = user ? String(user.id) === String(selectedItem.author?.id || selectedItem.author_id) : false;
  const isCompleted = selectedItem.status === 'COMPLETED';

  // Get author data - поддержка обоих форматов (старый и новый)
  const author = selectedItem.author ? {
    id: String(selectedItem.author.id),
    name: selectedItem.author.name || selectedItem.author.first_name || 'User',
    username: selectedItem.author.username,
    avatarUrl: selectedItem.author.avatarUrl || selectedItem.author.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedItem.author.id}`,
    reputation: selectedItem.author.reputation || 5.0
  } : {
    id: String(selectedItem.author_id),
    name: 'User',
    username: undefined,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedItem.author_id}`,
    reputation: 5.0
  };

  const participants = selectedItem.responses?.filter(r => r.status === 'ACCEPTED') || [];
  
  const handleRespond = async () => {
      if (!user) return;
      await addResponse(selectedItem.id, user.id, 'Ready to help!');
  };

  const handleChat = () => {
      if (!selectedItem) return;
      
      if (isTask) {
          let privateChat = chats.find(
              c => !c.isGroupChat && 
              c.participant?.id === author.id
          );
          
          if (!privateChat) {
              const { createPrivateChat } = useChatStore.getState();
              privateChat = createPrivateChat(
                  author.id,
                  author.name,
                  author.avatarUrl,
                  selectedItem.id,
                  selectedItem.title
              );
          }
          
          setSelectedItem(null);
          openChat(privateChat.id);
      } else {
          let groupChat = chats.find(c => c.itemId === selectedItem.id && c.isGroupChat);
          
          if (!groupChat) {
              const { createGroupChat } = useChatStore.getState();
              groupChat = createGroupChat(selectedItem.id, selectedItem.title, selectedItem.type);
          }
          
          setSelectedItem(null);
          openChat(groupChat.id);
      }
  };

  return (
    <Drawer.Root 
        open={isOpen} 
        onOpenChange={handleOpenChange} 
        shouldScaleBackground
        disablePreventScroll={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[1000] backdrop-blur-sm" />
        <Drawer.Content 
            className="bg-white flex flex-col rounded-t-[32px] fixed bottom-0 left-0 right-0 z-[1001] outline-none shadow-2xl"
            style={{ minHeight: '60vh', maxHeight: '92vh' }}
        >
          
          {/* Drag Handle */}
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mt-4 mb-6" />

          {/* Scrollable Content */}
          <div 
            ref={contentRef}
            className="flex-1 overflow-y-auto px-6 pb-32"
          >
            
            {/* Header Section */}
            <div className="mb-6">
              {/* Type Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{
                backgroundColor: isTask ? '#FEF3C7' : '#DBEAFE',
                color: isTask ? '#92400E' : '#1E40AF'
              }}>
                {isTask ? '📦' : '🎉'}
                <span className="font-bold text-sm uppercase tracking-wide">
                  {isTask ? 'Task' : 'Event'}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
                {selectedItem.title}
              </h1>

              {/* Status Badge */}
              {selectedItem.status !== 'OPEN' && (
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedItem.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                  selectedItem.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {selectedItem.status}
                </span>
              )}
            </div>

            {/* Owner Tabs - только для владельца задачи */}
            {isOwner && isTask && (
                <div className="mb-6 bg-gray-100 rounded-2xl p-1 flex gap-1">
                    <button 
                        onClick={() => setActiveTab('details')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                          activeTab === 'details' 
                            ? 'bg-white shadow-sm text-gray-900' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Детали
                    </button>
                    <button 
                        onClick={() => setActiveTab('responses')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all relative ${
                          activeTab === 'responses' 
                            ? 'bg-white shadow-sm text-gray-900' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Отклики
                        {selectedItem.responses && selectedItem.responses.length > 0 && (
                          <span className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
                            {selectedItem.responses.length}
                          </span>
                        )}
                    </button>
                </div>
            )}

            <AnimatePresence mode="wait">
                {activeTab === 'details' ? (
                    <motion.div 
                        key="details"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                    >
                        {/* Key Info Cards */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Price Card - только для задач */}
                            {isTask && selectedItem.price && (
                                <div className="col-span-2 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="text-sm font-medium text-green-700 mb-1">Цена</div>
                                        <div className="text-3xl font-black text-green-900">
                                          {selectedItem.price} {selectedItem.currency}
                                        </div>
                                      </div>
                                      <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                                        <DollarSign className="w-6 h-6 text-green-700" />
                                      </div>
                                    </div>
                                </div>
                            )}

                            {/* Time Card */}
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span className="text-xs font-semibold text-gray-500 uppercase">Когда</span>
                                </div>
                                <div className="font-bold text-gray-900">
                                  {selectedItem.eventDate 
                                    ? new Date(selectedItem.eventDate).toLocaleDateString('ru-RU', { 
                                        day: 'numeric', 
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })
                                    : 'ASAP'
                                  }
                                </div>
                            </div>

                            {/* Location Card */}
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  <span className="text-xs font-semibold text-gray-500 uppercase">Рядом</span>
                                </div>
                                <div className="font-bold text-gray-900">
                                  {selectedItem.distance_meters 
                                    ? `${(selectedItem.distance_meters / 1000).toFixed(1)} км` 
                                    : '< 1 км'}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                              Описание
                            </h3>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {selectedItem.description}
                            </p>
                        </div>

                        {/* Author Card - ГЛАВНАЯ КАРТОЧКА */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <User className="w-5 h-5 text-blue-600" />
                              {isTask ? 'Заказчик' : 'Организатор'}
                            </h3>
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="relative">
                                  <img 
                                      src={author.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.id}`}
                                      alt={author.name}
                                      className="w-16 h-16 rounded-2xl object-cover bg-white border-2 border-white shadow-md"
                                      onError={(e) => {
                                        e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.id}`;
                                      }}
                                  />
                                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                                
                                {/* Info */}
                                <div className="flex-1">
                                    <h4 className="font-bold text-lg text-gray-900 mb-1">
                                      {author.name}
                                    </h4>
                                    <div className="flex items-center gap-3">
                                      {/* Rating */}
                                      <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        <span className="font-bold text-sm text-gray-700">
                                          {author.reputation?.toFixed(1) || '5.0'}
                                        </span>
                                      </div>
                                      {/* Username */}
                                      {author.username && (
                                        <span className="text-sm text-gray-500">
                                          @{author.username}
                                        </span>
                                      )}
                                    </div>
                                </div>

                                {/* Message Button */}
                                {!isOwner && (
                                  <button 
                                    onClick={handleChat}
                                    className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
                                  >
                                    <MessageCircle className="w-5 h-5 text-white" />
                                  </button>
                                )}
                            </div>
                        </div>

                        {/* Participants for Events */}
                        {!isTask && participants.length > 0 && (
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                                <h3 className="font-bold text-gray-900 mb-3">
                                  Участники ({participants.length + 1})
                                </h3>
                                <div className="flex items-center -space-x-2">
                                    <img 
                                        src={author.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.id}`}
                                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                                        alt="Organizer"
                                    />
                                    {participants.slice(0, 4).map((p, i) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-purple-400 to-pink-400 shadow-sm"></div>
                                    ))}
                                    {participants.length > 4 && (
                                        <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shadow-sm">
                                            +{participants.length - 4}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </motion.div>
                ) : (
                    <motion.div 
                        key="responses"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        {selectedItem.responses && selectedItem.responses.length > 0 ? (
                            selectedItem.responses.map((response: any) => (
                                <div key={response.id} className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-blue-300 transition-all">
                                     <div className="flex items-start gap-4">
                                         <img 
                                            src={response.user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.user_id}`}
                                            className="w-12 h-12 rounded-xl object-cover bg-gray-100"
                                            alt="User"
                                         />
                                         <div className="flex-1">
                                             <div className="flex items-center gap-2 mb-2">
                                               <h4 className="font-bold text-gray-900">
                                                 {response.user?.first_name || response.userName || 'User'}
                                               </h4>
                                               <div className="flex items-center gap-1">
                                                 <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                 <span className="text-xs font-semibold text-gray-600">
                                                   {response.user?.reputation?.toFixed(1) || response.userReputation || '5.0'}
                                                 </span>
                                               </div>
                                             </div>
                                             <p className="text-gray-600 text-sm mb-3">
                                                 {response.message}
                                             </p>
                                             
                                             {/* Status Badge */}
                                             <div className="flex items-center gap-2">
                                               {response.status === 'PENDING' && user && (
                                                   <>
                                                     <button 
                                                        onClick={() => updateResponseStatus(response.id, 'ACCEPTED', user.id)}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 active:scale-95 transition-all"
                                                     >
                                                         ✓ Принять
                                                     </button>
                                                     <button 
                                                        onClick={() => updateResponseStatus(response.id, 'REJECTED', user.id)}
                                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-300 active:scale-95 transition-all"
                                                     >
                                                         ✗ Отклонить
                                                     </button>
                                                   </>
                                               )}
                                               {response.status === 'ACCEPTED' && (
                                                   <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                                       ✓ Принято
                                                   </span>
                                               )}
                                               {response.status === 'REJECTED' && (
                                                   <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                                                       Отклонено
                                                   </span>
                                               )}
                                             </div>
                                         </div>
                                     </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <User className="w-10 h-10 text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium">Пока нет откликов</p>
                                <p className="text-gray-400 text-sm mt-1">Будьте первым!</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

          </div>

          {/* Sticky Footer Action */}
          <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white via-white to-transparent">
             <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                 {isOwner ? (
                     selectedItem.status === 'IN_PROGRESS' && user ? (
                          <SlideButton 
                             text="Завершить задачу ➜"
                             onSuccess={() => completeItem(selectedItem.id, user.id)}
                             className="bg-gradient-to-r from-green-500 to-emerald-500"
                             icon={<CheckCircle className="w-6 h-6 text-white" />}
                          />
                     ) : (
                        <div className="py-5 text-center">
                             <p className="text-gray-400 font-medium">
                               {selectedItem.status === 'COMPLETED' ? '✓ Задача завершена' : 'Ожидание действий...'}
                             </p>
                        </div>
                     )
                 ) : (
                    <button 
                        onClick={handleRespond}
                        disabled={isCompleted}
                        className={`w-full py-5 font-bold text-lg transition-all ${
                          isCompleted 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : isTask
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-lg active:scale-[0.98]'
                              : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg active:scale-[0.98]'
                        }`}
                    >
                        {isCompleted ? 'Завершено' : isTask ? '📦 Откликнуться' : '🎉 Присоединиться'}
                    </button>
                 )}
             </div>
          </div>

        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
