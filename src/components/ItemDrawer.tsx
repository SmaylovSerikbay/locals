'use client';

import { Drawer } from 'vaul';
import { useItemsStore, Response } from '@/store/useItemsStore';
import { Calendar, Clock, Star, X, MapPin, Share2, Heart, CheckCircle, Briefcase, ArrowLeft, Users, MessageCircle } from 'lucide-react';
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
  const isOwner = user ? String(user.id) === selectedItem.author.id : false;
  const isCompleted = selectedItem.status === 'COMPLETED';

  // Mock participants for events
  const participants = selectedItem.responses.filter(r => r.status === 'ACCEPTED');
  
  // Handling responses
  const handleRespond = async () => {
      if (!user) return;
      await addResponse(selectedItem.id, user.id, 'Ready to help!');
  };

  const handleChat = () => {
      if (!selectedItem) return;
      
      const isTask = selectedItem.type === 'TASK';
      
      if (isTask) {
          // Для ЗАДАЧ: Приватный чат с автором (1-на-1)
          // Ищем существующий приватный чат с автором задачи
          let privateChat = chats.find(
              c => !c.isGroupChat && 
              c.participant?.id === selectedItem.author.id
          );
          
          if (!privateChat) {
              console.log('Creating private chat with author:', selectedItem.author.id);
              const { createPrivateChat } = useChatStore.getState();
              privateChat = createPrivateChat(
                  selectedItem.author.id,
                  selectedItem.author.name,
                  selectedItem.author.avatarUrl,
                  selectedItem.id,
                  selectedItem.title
              );
          } else {
              console.log('Using existing private chat:', privateChat.id);
          }
          
          setSelectedItem(null);
          openChat(privateChat.id);
      } else {
          // Для СОБЫТИЙ: Групповой чат (топик в Telegram)
          let groupChat = chats.find(c => c.itemId === selectedItem.id && c.isGroupChat);
          
          if (!groupChat) {
              console.log('Creating new group chat for event:', selectedItem.id);
              const { createGroupChat } = useChatStore.getState();
              groupChat = createGroupChat(selectedItem.id, selectedItem.title, selectedItem.type);
          } else {
              console.log('Using existing group chat:', groupChat.id);
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
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[1000] backdrop-blur-sm" />
        <Drawer.Content 
            className="bg-white flex flex-col rounded-t-[32px] fixed bottom-0 left-0 right-0 z-[1001] outline-none shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
            style={{ minHeight: '50vh', maxHeight: '90vh' }}
        >
          
          {/* Header Image / Actions */}
          <div className="relative h-52 shrink-0 bg-gray-100 overflow-hidden">
             <div className={`absolute inset-0 bg-gradient-to-br ${isTask ? 'from-yellow-100 via-orange-50 to-yellow-50' : 'from-blue-100 via-indigo-50 to-purple-50'}`}></div>
             <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
             
             {/* Decorative blobs */}
             <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full ${isTask ? 'bg-yellow-200' : 'bg-blue-200'} opacity-30 blur-3xl`}></div>
             <div className={`absolute -bottom-20 -left-20 w-64 h-64 rounded-full ${isTask ? 'bg-orange-200' : 'bg-indigo-200'} opacity-30 blur-3xl`}></div>

             <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
                 <button onClick={() => setSelectedItem(null)} className="w-11 h-11 bg-white/80 backdrop-blur-xl rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg active:scale-95 border border-white/50">
                    <X className="w-5 h-5 text-gray-900" />
                 </button>
                 <div className="flex gap-2">
                    <button className="w-11 h-11 bg-white/80 backdrop-blur-xl rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg active:scale-95 border border-white/50">
                        <Share2 className="w-5 h-5 text-gray-900" />
                    </button>
                    <button className="w-11 h-11 bg-white/80 backdrop-blur-xl rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg active:scale-95 border border-white/50">
                        <Heart className="w-5 h-5 text-gray-900" />
                    </button>
                 </div>
             </div>

             <div className="absolute bottom-5 left-6 right-6">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg mb-2 ${isTask ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-950' : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'}`}>
                    {isTask ? <Briefcase className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                    {isTask ? 'Task' : 'Event'}
                </div>
                <h1 className="text-3xl font-black text-gray-900 leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.1)] line-clamp-2">
                    {selectedItem.title}
                </h1>
             </div>
          </div>

          {/* Scrollable Content */}
          <div 
            ref={contentRef}
            className="flex-1 overflow-y-auto bg-white rounded-t-[32px] -mt-6 relative z-10 px-6 pt-8"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 100px)' }}
          >
            
            {/* Owner Tabs */}
            {isOwner && isTask && (
                <div className="mb-8 p-1 bg-gray-100 rounded-[16px] flex">
                    <button 
                        onClick={() => setActiveTab('details')}
                        className={`flex-1 py-2.5 rounded-[12px] text-sm font-bold transition-all ${activeTab === 'details' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                    >
                        Details
                    </button>
                    <button 
                        onClick={() => setActiveTab('responses')}
                        className={`flex-1 py-2.5 rounded-[12px] text-sm font-bold transition-all ${activeTab === 'responses' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                    >
                        Responses <span className="ml-1 bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px]">{selectedItem.responses.length}</span>
                    </button>
                </div>
            )}

            <AnimatePresence mode="wait">
                {activeTab === 'details' ? (
                    <motion.div 
                        key="details"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col gap-8"
                    >
                        {/* Price & Meta Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {isTask && selectedItem.price && (
                                <div className="col-span-2 bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-[24px] flex items-center justify-between border-2 border-green-200 shadow-sm">
                                    <div className="flex items-center gap-2">
                                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xl">💰</span>
                                      </div>
                                      <span className="text-green-700 font-bold text-sm">Reward</span>
                                    </div>
                                    <span className="text-3xl font-black text-green-700">{selectedItem.price} {selectedItem.currency}</span>
                                </div>
                            )}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-[20px] flex flex-col gap-1.5 border border-blue-200 shadow-sm">
                                <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center mb-1">
                                  <Clock className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xs text-blue-700 font-bold uppercase tracking-wide">When</span>
                                <span className="font-bold text-gray-900 text-sm">{selectedItem.eventDate ? new Date(selectedItem.eventDate).toLocaleDateString() : 'ASAP'}</span>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-[20px] flex flex-col gap-1.5 border border-purple-200 shadow-sm">
                                <div className="w-9 h-9 bg-purple-500 rounded-full flex items-center justify-center mb-1">
                                  <MapPin className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xs text-purple-700 font-bold uppercase tracking-wide">Distance</span>
                                <span className="font-bold text-gray-900 text-sm">{(selectedItem as any).distance_meters ? ((selectedItem as any).distance_meters / 1000).toFixed(1) + ' km' : 'Nearby'}</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-3">
                            <h3 className="font-bold text-gray-900 text-xl flex items-center gap-2">
                              <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                              Description
                            </h3>
                            <p className="text-gray-700 leading-relaxed text-[17px] bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                {selectedItem.description}
                            </p>
                        </div>

                        {/* Participants Section (For Events) */}
                        {!isTask && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                        <Users className="w-5 h-5 text-gray-400" />
                                        {t('going')}
                                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                                            {participants.length + 1}
                                        </span>
                                    </h3>
                                    <button onClick={handleChat} className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">
                                        Join Chat
                                    </button>
                                </div>
                                <div className="flex items-center -space-x-3 overflow-hidden py-2">
                                    {/* Author */}
                                    <img 
                                        src={(selectedItem.author as any).avatar_url || selectedItem.author.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + selectedItem.author.id} 
                                        className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-md"
                                        title={(selectedItem.author as any).first_name || selectedItem.author.name || 'User'}
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + selectedItem.author.id;
                                        }}
                                    />
                                    {/* Other participants (mock) */}
                                    {[1,2,3].map((_, i) => (
                                        <div key={i} className="w-12 h-12 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                            ?
                                        </div>
                                    ))}
                                    <button className="w-12 h-12 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm hover:bg-gray-200 transition-colors">
                                        +5
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Author Card */}
                        <div className="space-y-3">
                             <h3 className="font-bold text-gray-900 text-lg">{t('hosted_by')}</h3>
                             <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-[24px] shadow-sm hover:shadow-md hover:border-gray-300 transition-all">
                                <div className="relative">
                                  <img 
                                      src={(selectedItem.author as any).avatar_url || selectedItem.author.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + selectedItem.author.id} 
                                      alt={(selectedItem.author as any).first_name || selectedItem.author.name || 'User'}
                                      className="w-16 h-16 rounded-full object-cover bg-gray-100 border-2 border-white shadow-md"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + selectedItem.author.id;
                                      }}
                                  />
                                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-lg text-gray-900 truncate">
                                      {(selectedItem.author as any).first_name && (selectedItem.author as any).last_name 
                                        ? `${(selectedItem.author as any).first_name} ${(selectedItem.author as any).last_name}`
                                        : (selectedItem.author as any).first_name || (selectedItem.author as any).username || selectedItem.author.name || 'User'}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm bg-yellow-50 px-2 py-0.5 rounded-full">
                                          <Star className="w-4 h-4 fill-current" />
                                          <span>{selectedItem.author.reputation || 5.0}</span>
                                      </div>
                                      {(selectedItem.author as any).username && (
                                        <span className="text-xs text-gray-500">@{(selectedItem.author as any).username}</span>
                                      )}
                                    </div>
                                </div>
                                {/* Для задач - кнопка "Написать", для событий - иконка чата */}
                                {!isOwner && isTask ? (
                                    <button
                                        onClick={handleChat}
                                        className="px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-bold text-sm hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30 active:scale-95"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        Чат
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleChat}
                                        className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                                    >
                                        <MessageCircle className="w-5 h-5 text-gray-600" />
                                    </button>
                                )}
                             </div>
                        </div>

                    </motion.div>
                ) : (
                    <motion.div 
                        key="responses"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex flex-col gap-4"
                    >
                         {selectedItem.responses.length === 0 ? (
                             <div className="text-center text-gray-400 py-10 flex flex-col items-center">
                                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Briefcase className="w-8 h-8 opacity-20" />
                                 </div>
                                 <p className="font-medium">No responses yet</p>
                                 <p className="text-sm opacity-60">Wait for neighbors to reach out.</p>
                             </div>
                         ) : (
                             selectedItem.responses.map((response, index) => {
                               const responseUser = (response as any).user;
                               const userName = responseUser?.first_name && responseUser?.last_name
                                 ? `${responseUser.first_name} ${responseUser.last_name}`
                                 : responseUser?.first_name || responseUser?.username || response.userName || 'User';
                               const userAvatar = responseUser?.avatar_url || response.userAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + response.userId;
                               const userReputation = responseUser?.reputation || response.userReputation || 5.0;
                               
                               return (
                                 <motion.div 
                                   key={response.id}
                                   initial={{ opacity: 0, y: 20 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ delay: index * 0.05 }}
                                   className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 p-5 rounded-[24px] shadow-md hover:shadow-xl transition-all hover:border-gray-300"
                                 >
                                     <div className="flex items-center gap-3 mb-4">
                                         <div className="relative">
                                           <img 
                                             src={userAvatar} 
                                             className="w-14 h-14 rounded-full bg-gray-200 object-cover border-2 border-white shadow-md" 
                                             onError={(e) => {
                                               const target = e.target as HTMLImageElement;
                                               target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + response.userId;
                                             }}
                                           />
                                           {response.status === 'ACCEPTED' && (
                                             <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                               <CheckCircle className="w-3 h-3 text-white" />
                                             </div>
                                           )}
                                         </div>
                                         <div className="flex-1 min-w-0">
                                             <div className="font-bold text-lg text-gray-900 truncate">{userName}</div>
                                             <div className="flex items-center gap-2 mt-1">
                                               <div className="flex items-center gap-1 text-yellow-600 text-sm font-bold bg-yellow-50 px-2 py-1 rounded-full">
                                                   <Star className="w-4 h-4 fill-current" />
                                                   <span>{userReputation.toFixed(1)}</span>
                                               </div>
                                               {responseUser?.username && (
                                                 <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">@{responseUser.username}</span>
                                               )}
                                             </div>
                                         </div>
                                         <div className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
                                             {new Date((response as any).created_at || response.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                         </div>
                                     </div>
                                     <div className="bg-white p-4 rounded-2xl text-[15px] text-gray-800 mb-4 leading-relaxed border border-gray-100 shadow-sm">
                                         <span className="text-gray-400 mr-1">"</span>
                                         {response.message}
                                         <span className="text-gray-400 ml-1">"</span>
                                     </div>
                                     
                                     {response.status === 'PENDING' && user && (
                                         <div className="flex gap-3">
                                             <button 
                                                onClick={() => updateResponseStatus(response.id, 'ACCEPTED', user.id)}
                                                className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold text-base active:scale-95 transition-all shadow-lg shadow-green-500/30 hover:shadow-xl flex items-center justify-center gap-2"
                                             >
                                                 <CheckCircle className="w-5 h-5" />
                                                 Accept
                                             </button>
                                             <button className="flex-1 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-2xl font-bold text-base active:scale-95 transition-all hover:bg-gray-50 flex items-center justify-center gap-2">
                                                 <X className="w-5 h-5" />
                                                 Decline
                                             </button>
                                         </div>
                                     )}
                                     {response.status === 'ACCEPTED' && (
                                         <div className="w-full py-4 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-2xl font-bold text-base text-center flex items-center justify-center gap-2 border-2 border-green-300 shadow-sm">
                                             <CheckCircle className="w-6 h-6" /> 
                                             <span>✓ Accepted Executor</span>
                                         </div>
                                     )}
                                     {response.status === 'REJECTED' && (
                                         <div className="w-full py-3 bg-gray-100 text-gray-500 rounded-2xl font-medium text-sm text-center">
                                             Declined
                                         </div>
                                     )}
                                 </motion.div>
                               );
                             })
                         )}
                    </motion.div>
                )}
            </AnimatePresence>

          </div>

          {/* Sticky Footer Action */}
          <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white via-white/95 to-transparent pt-12 z-30">
             <div className="bg-white p-2 rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-200">
                {isOwner ? (
                    selectedItem.status === 'IN_PROGRESS' && user ? (
                          <SlideButton 
                             text="Slide to Complete"
                             onSuccess={() => completeItem(selectedItem.id, user.id)}
                             className="bg-green-50"
                             icon={<CheckCircle className="w-6 h-6 text-green-600" />}
                          />
                    ) : (
                        <div className="w-full py-4 text-gray-400 font-bold text-center flex items-center justify-center gap-2">
                             <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" />
                             Waiting for action...
                        </div>
                     )
                ) : selectedItem.status === 'COMPLETED' ? (
                   <div className="w-full py-5 text-center">
                       <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-50 text-green-700 font-bold rounded-2xl">
                           <CheckCircle className="w-6 h-6" />
                           <span className="text-lg">Completed ✓</span>
                       </div>
                   </div>
                ) : (
                    <SlideButton 
                       text={isTask ? "Slide to Apply 🎯" : "Slide to Join ✨"}
                       onSuccess={handleRespond}
                       className={isTask ? "bg-yellow-50" : "bg-blue-50"}
                       icon={isTask ? <Briefcase className="w-6 h-6 text-yellow-600" /> : <Users className="w-6 h-6 text-blue-600" />}
                    />
                )}
             </div>
          </div>

        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}