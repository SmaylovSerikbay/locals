'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Drawer } from 'vaul';
import { useItemsStore } from '@/store/useItemsStore';
import { useUserStore } from '@/store/useUserStore';
import { useChatStore } from '@/store/useChatStore';
import { useTranslations } from 'next-intl';
import { 
  X, Share2, Heart, Briefcase, Calendar, Clock, MapPin, Star, 
  MessageCircle, CheckCircle, Users, Trash2, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SlideButton from './ui/SlideButton';

type TabType = 'details' | 'responses' | 'join-requests';

export default function ItemDrawer() {
  const { selectedItem, setSelectedItem, updateResponseStatus, completeItem, addResponse, deleteItem, joinEvent, getJoinRequests, moderateJoinRequest } = useItemsStore();
  const { user } = useUserStore();
  const { chats, openChat, createPrivateChat } = useChatStore();
  const t = useTranslations('ItemDetails');
  
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [approvedParticipants, setApprovedParticipants] = useState<any[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
        setSelectedItem(null);
        setActiveTab('details');
        setShowDeleteConfirm(false);
    }
  };

  useEffect(() => {
    if (selectedItem && selectedItem.type === 'EVENT' && isOwner) {
      // Load join requests for event owner
      loadJoinRequests();
    }
  }, [selectedItem?.id, activeTab]);

  const loadJoinRequests = async () => {
    if (!selectedItem) return;
    
    const pending = await getJoinRequests(selectedItem.id, 'PENDING');
    const approved = await getJoinRequests(selectedItem.id, 'APPROVED');
    
    setJoinRequests(pending);
    setApprovedParticipants(approved);
  };

  if (!selectedItem) return null;

  const isTask = selectedItem.type === 'TASK';
  const isOwner = user ? String(user.id) === String((selectedItem.author as any).id || selectedItem.author.id) : false;
  const isCompleted = selectedItem.status === 'COMPLETED';
  const requiresApproval = (selectedItem as any).requires_approval;
  const maxParticipants = (selectedItem as any).max_participants;
  const currentParticipants = (selectedItem as any).current_participants || 0;
  const isFull = maxParticipants && currentParticipants >= maxParticipants;

  // Handler functions
  const handleJoin = async () => {
    if (!user || isJoining) return;
    
    setIsJoining(true);
    const result = await joinEvent(selectedItem.id, user.id);
    setIsJoining(false);
    
    if (result) {
      if (result.requiresApproval) {
        alert(t('waiting_approval'));
      } else {
        alert(t('approved'));
      }
      await loadJoinRequests();
    }
  };

  const handleRespond = async () => {
      if (!user) return;
      await addResponse(selectedItem.id, user.id, 'Готов помочь!');
  };
  
  const handleChat = () => {
      if (!selectedItem) return;
      
      if (isTask) {
          // Private chat with author
          let privateChat = chats.find(
              c => !c.isGroupChat && 
              c.participant?.id === String((selectedItem.author as any).id || selectedItem.author.id)
          );
          
          if (!privateChat) {
              const authorData = selectedItem.author as any;
              privateChat = createPrivateChat(
                  String(authorData.id || selectedItem.author.id),
                  authorData.first_name || authorData.name || 'User',
                  authorData.avatar_url || authorData.avatarUrl,
                  selectedItem.id,
                  selectedItem.title
              );
          }
          
          setSelectedItem(null);
          openChat(privateChat.id);
      } else {
          // Group chat for event
          let groupChat = chats.find(c => c.itemId === selectedItem.id && c.isGroupChat);
          
          if (!groupChat) {
              const { createGroupChat } = useChatStore.getState();
              groupChat = createGroupChat(
                  selectedItem.id,
                  selectedItem.title,
                  'group'
              );
          }
          
          setSelectedItem(null);
          openChat(groupChat.id);
      }
  };

  const handleApprove = async (participantId: string) => {
    if (!user) return;
    const result = await moderateJoinRequest(selectedItem.id, participantId, 'APPROVED', user.id);
    if (result) {
      await loadJoinRequests();
    }
  };

  const handleReject = async (participantId: string) => {
    if (!user) return;
    const result = await moderateJoinRequest(selectedItem.id, participantId, 'REJECTED', user.id);
    if (result) {
      await loadJoinRequests();
    }
  };

  const handleDelete = async () => {
    if (!user || !showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    
    const success = await deleteItem(selectedItem.id, user.id);
    if (success) {
      setSelectedItem(null);
    }
  };

  return (
    <Drawer.Root open={!!selectedItem} onOpenChange={handleOpenChange} shouldScaleBackground>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[1000] backdrop-blur-sm" />
        <Drawer.Content 
            className="bg-white flex flex-col rounded-t-[32px] fixed bottom-0 left-0 right-0 z-[1001] outline-none shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
            style={{ minHeight: '50vh', maxHeight: '90vh' }}
        >
          
          {/* Scrollable Content with Header */}
          <div 
            ref={contentRef}
            className="flex-1 overflow-y-auto bg-white"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 100px)' }}
          >
            {/* Header - Now Scrollable */}
            <div className="relative h-48 shrink-0 bg-gray-100 overflow-hidden">
               <div className={`absolute inset-0 bg-gradient-to-br ${isTask ? 'from-yellow-100 via-orange-50 to-yellow-50' : 'from-blue-100 via-indigo-50 to-purple-50'}`}></div>
               <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
               
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
                      {isOwner && (
                        <button 
                          onClick={handleDelete}
                          className={`w-11 h-11 backdrop-blur-xl rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 border ${
                            showDeleteConfirm 
                              ? 'bg-red-500 border-red-600' 
                              : 'bg-white/80 border-white/50 hover:bg-white'
                          }`}
                        >
                          {showDeleteConfirm ? (
                            <AlertCircle className="w-5 h-5 text-white" />
                          ) : (
                            <Trash2 className="w-5 h-5 text-gray-900" />
                          )}
                        </button>
                      )}
                   </div>
               </div>

               <div className="absolute bottom-4 left-5 right-5">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg mb-2 ${isTask ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-950' : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'}`}>
                      {isTask ? <Briefcase className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                      {isTask ? 'Task' : 'Event'}
                  </div>
                  <h1 className="text-2xl font-black text-gray-900 leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.1)] line-clamp-2">
                      {selectedItem.title}
                  </h1>
               </div>
            </div>

            {/* Content */}
            <div className="px-6 pt-6">
            
            {/* Owner Tabs */}
            {isOwner && (
                <div className="mb-8 p-1 bg-gray-100 rounded-[16px] flex overflow-x-auto no-scrollbar">
                    <button 
                        onClick={() => setActiveTab('details')}
                        className={`flex-1 py-2.5 px-4 rounded-[12px] text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'details' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                    >
                        {t('tab_details')}
                    </button>
                    {isTask && (
                      <button 
                          onClick={() => setActiveTab('responses')}
                          className={`flex-1 py-2.5 px-4 rounded-[12px] text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'responses' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                      >
                          {t('tab_responses')} <span className="ml-1 bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px]">{selectedItem.responses?.length || 0}</span>
                      </button>
                    )}
                    {!isTask && requiresApproval && (
                      <button 
                          onClick={() => setActiveTab('join-requests')}
                          className={`flex-1 py-2.5 px-4 rounded-[12px] text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'join-requests' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                      >
                          {t('tab_join_requests')} <span className="ml-1 bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px]">{joinRequests.length}</span>
                      </button>
                    )}
                </div>
            )}

            <AnimatePresence mode="wait">
                {activeTab === 'details' ? (
                    <DetailsTab 
                      item={selectedItem}
                      isTask={isTask}
                      isOwner={isOwner}
                      handleChat={handleChat}
                      approvedParticipants={approvedParticipants}
                      t={t}
                    />
                ) : activeTab === 'responses' ? (
                    <ResponsesTab 
                      item={selectedItem}
                      user={user}
                      updateResponseStatus={updateResponseStatus}
                      t={t}
                    />
                ) : (
                    <JoinRequestsTab 
                      requests={joinRequests}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      t={t}
                    />
                )}
            </AnimatePresence>

            </div>
          </div>

          {/* Footer Action */}
          <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white via-white/95 to-transparent pt-12 z-30">
             <div className="bg-white p-2 rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-200">
                {isOwner ? (
                    isTask && selectedItem.status === 'IN_PROGRESS' && user ? (
                          <SlideButton 
                             text={t('slide_to_complete')}
                             onSuccess={() => completeItem(selectedItem.id, user.id)}
                             className="bg-green-50"
                             icon={<CheckCircle className="w-6 h-6 text-green-600" />}
                          />
                    ) : (
                        <div className="w-full py-4 text-gray-400 font-bold text-center flex items-center justify-center gap-2">
                             <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" />
                             Ожидание действия...
                        </div>
                     )
                 ) : isCompleted ? (
                   <div className="w-full py-5 text-center">
                       <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-50 text-green-700 font-bold rounded-2xl">
                           <CheckCircle className="w-6 h-6" />
                           <span className="text-lg">{t('completed')} ✓</span>
                       </div>
                   </div>
                ) : isFull ? (
                   <div className="w-full py-5 text-center">
                       <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-2xl">
                           <Users className="w-6 h-6" />
                           <span className="text-lg">{t('event_full')}</span>
                       </div>
                   </div>
                ) : (
                    <SlideButton 
                       text={isTask ? t('slide_to_apply') : (requiresApproval ? t('request_to_join') : t('slide_to_join'))}
                       onSuccess={isTask ? handleRespond : handleJoin}
                       className={isTask ? "bg-yellow-50" : "bg-blue-50"}
                       icon={isTask ? <Briefcase className="w-6 h-6 text-yellow-600" /> : <Users className="w-6 h-6 text-blue-600" />}
                       disabled={isJoining}
                    />
                )}
             </div>
          </div>

        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

// Details Tab Component
function DetailsTab({ item, isTask, isOwner, handleChat, approvedParticipants, t }: any) {
  return (
    <motion.div 
        key="details"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex flex-col gap-8"
    >
        {/* Price & Meta Grid */}
        <div className="grid grid-cols-2 gap-3">
            {isTask && item.price && (
                <div className="col-span-2 bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-[24px] flex items-center justify-between border-2 border-green-200 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl">💰</span>
                      </div>
                      <span className="text-green-700 font-bold text-sm">{t('reward')}</span>
                    </div>
                    <span className="text-3xl font-black text-green-700">{item.price} {item.currency}</span>
                </div>
            )}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-[20px] flex flex-col gap-1.5 border border-blue-200 shadow-sm">
                <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center mb-1">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-blue-700 font-bold uppercase tracking-wide">{t('when')}</span>
                <span className="font-bold text-gray-900 text-sm">{item.event_date ? new Date(item.event_date).toLocaleDateString('ru-RU') : t('asap')}</span>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-[20px] flex flex-col gap-1.5 border border-purple-200 shadow-sm">
                <div className="w-9 h-9 bg-purple-500 rounded-full flex items-center justify-center mb-1">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-purple-700 font-bold uppercase tracking-wide">{t('distance')}</span>
                <span className="font-bold text-gray-900 text-sm">{(item as any).distance_meters ? ((item as any).distance_meters / 1000).toFixed(1) + ' км' : t('nearby')}</span>
            </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
            <h3 className="font-bold text-gray-900 text-xl flex items-center gap-2">
              <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              {t('description')}
            </h3>
            <p className="text-gray-700 leading-relaxed text-[17px] bg-gray-50 p-5 rounded-2xl border border-gray-100">
                {item.description}
            </p>
        </div>

        {/* Participants (Events) */}
        {!isTask && approvedParticipants.length > 0 && (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                        {t('going')}
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                            {approvedParticipants.length}
                        </span>
                    </h3>
                    <button onClick={handleChat} className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">
                        {t('chat')}
                    </button>
                </div>
                <div className="flex items-center -space-x-3 overflow-hidden py-2">
                    {approvedParticipants.slice(0, 5).map((p: any, i: number) => {
                      const userData = p.user;
                      return (
                        <img 
                            key={i}
                            src={userData?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.user_id}`} 
                            className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-md"
                            title={userData?.first_name || 'User'}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.user_id}`;
                            }}
                        />
                      );
                    })}
                    {approvedParticipants.length > 5 && (
                      <div className="w-12 h-12 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm">
                          +{approvedParticipants.length - 5}
                      </div>
                    )}
                </div>
            </div>
        )}

        {/* Author Card */}
        <div className="space-y-3">
             <h3 className="font-bold text-gray-900 text-lg">{t('hosted_by')}</h3>
             <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-[24px] shadow-sm hover:shadow-md hover:border-gray-300 transition-all">
                <div className="relative">
                  <img 
                      src={(item.author as any).avatar_url || item.author.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + item.author.id} 
                      alt={(item.author as any).first_name || item.author.name || 'User'}
                      className="w-16 h-16 rounded-full object-cover bg-gray-100 border-2 border-white shadow-md"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + item.author.id;
                      }}
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lg text-gray-900 truncate">
                      {(item.author as any).first_name && (item.author as any).last_name 
                        ? `${(item.author as any).first_name} ${(item.author as any).last_name}`
                        : (item.author as any).first_name || (item.author as any).username || item.author.name || 'User'}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm bg-yellow-50 px-2 py-0.5 rounded-full">
                          <Star className="w-4 h-4 fill-current" />
                          <span>{item.author.reputation || 5.0}</span>
                      </div>
                      {(item.author as any).username && (
                        <span className="text-xs text-gray-500">@{(item.author as any).username}</span>
                      )}
                    </div>
                </div>
                {!isOwner && (
                    <button
                        onClick={handleChat}
                        className="px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-bold text-sm hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30 active:scale-95"
                    >
                        <MessageCircle className="w-4 h-4" />
                        {t('chat')}
                    </button>
                )}
             </div>
        </div>

    </motion.div>
  );
}

// Responses Tab Component
function ResponsesTab({ item, user, updateResponseStatus, t }: any) {
  return (
    <motion.div 
        key="responses"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="flex flex-col gap-4"
    >
         {item.responses.length === 0 ? (
             <div className="text-center text-gray-400 py-10 flex flex-col items-center">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Briefcase className="w-8 h-8 opacity-20" />
                 </div>
                 <p className="font-medium">{t('no_responses')}</p>
                 <p className="text-sm opacity-60">{t('no_responses_desc')}</p>
             </div>
         ) : (
             item.responses.map((response: any, index: number) => {
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
                             {new Date((response as any).created_at || response.createdAt).toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}
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
                                 {t('accept')}
                             </button>
                             <button 
                                onClick={() => updateResponseStatus(response.id, 'REJECTED', user.id)}
                                className="flex-1 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-2xl font-bold text-base active:scale-95 transition-all hover:bg-gray-50 flex items-center justify-center gap-2">
                                 <X className="w-5 h-5" />
                                 {t('decline')}
                             </button>
                         </div>
                     )}
                     {response.status === 'ACCEPTED' && (
                         <div className="w-full py-4 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-2xl font-bold text-base text-center flex items-center justify-center gap-2 border-2 border-green-300 shadow-sm">
                             <CheckCircle className="w-6 h-6" /> 
                             <span>✓ {t('accepted_executor')}</span>
                         </div>
                     )}
                     {response.status === 'REJECTED' && (
                         <div className="w-full py-3 bg-gray-100 text-gray-500 rounded-2xl font-medium text-sm text-center">
                             {t('rejected')}
                         </div>
                     )}
                 </motion.div>
               );
             })
         )}
    </motion.div>
  );
}

// Join Requests Tab Component
function JoinRequestsTab({ requests, onApprove, onReject, t }: any) {
  return (
    <motion.div 
        key="join-requests"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="flex flex-col gap-4"
    >
         {requests.length === 0 ? (
             <div className="text-center text-gray-400 py-10 flex flex-col items-center">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 opacity-20" />
                 </div>
                 <p className="font-medium">{t('no_requests')}</p>
                 <p className="text-sm opacity-60">{t('no_requests_desc')}</p>
             </div>
         ) : (
             requests.map((request: any, index: number) => {
               const userData = request.user;
               const userName = userData?.first_name && userData?.last_name
                 ? `${userData.first_name} ${userData.last_name}`
                 : userData?.first_name || userData?.username || 'User';
               const userAvatar = userData?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.user_id}`;
               const userReputation = userData?.reputation || 5.0;
               
               return (
                 <motion.div 
                   key={request.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: index * 0.05 }}
                   className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 p-5 rounded-[24px] shadow-md hover:shadow-xl transition-all"
                 >
                     <div className="flex items-center gap-3 mb-4">
                         <img 
                           src={userAvatar} 
                           className="w-14 h-14 rounded-full bg-gray-200 object-cover border-2 border-white shadow-md" 
                           onError={(e) => {
                             const target = e.target as HTMLImageElement;
                             target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.user_id}`;
                           }}
                         />
                         <div className="flex-1 min-w-0">
                             <div className="font-bold text-lg text-gray-900 truncate">{userName}</div>
                             <div className="flex items-center gap-2 mt-1">
                               <div className="flex items-center gap-1 text-yellow-600 text-sm font-bold bg-yellow-50 px-2 py-1 rounded-full">
                                   <Star className="w-4 h-4 fill-current" />
                                   <span>{userReputation.toFixed(1)}</span>
                               </div>
                               {userData?.username && (
                                 <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">@{userData.username}</span>
                               )}
                             </div>
                         </div>
                         <div className="text-xs font-medium text-blue-600 bg-blue-100 px-3 py-1.5 rounded-full">
                             {new Date(request.joined_at).toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}
                         </div>
                     </div>
                     
                     <div className="flex gap-3 mt-4">
                         <button 
                            onClick={() => onApprove(request.id)}
                            className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl font-bold text-base active:scale-95 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl flex items-center justify-center gap-2"
                         >
                             <CheckCircle className="w-5 h-5" />
                             {t('approve')}
                         </button>
                         <button 
                            onClick={() => onReject(request.id)}
                            className="flex-1 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-2xl font-bold text-base active:scale-95 transition-all hover:bg-gray-50 flex items-center justify-center gap-2">
                             <X className="w-5 h-5" />
                             {t('decline')}
                         </button>
                     </div>
                 </motion.div>
               );
             })
         )}
    </motion.div>
  );
}
