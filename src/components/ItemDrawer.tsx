'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Drawer } from 'vaul';
import { useItemsStore } from '@/store/useItemsStore';
import { useUserStore } from '@/store/useUserStore';
import { useChatStore } from '@/store/useChatStore';
import { useTranslations } from 'next-intl';
import { 
  X, Share2, Briefcase, Calendar, Clock, MessageCircle, CheckCircle, Users, Trash2, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SlideButton from './ui/SlideButton';

// Import sub-components
import DetailsTab from './item-drawer/DetailsTab';
import ResponsesTab from './item-drawer/ResponsesTab';
import JoinRequestsTab from './item-drawer/JoinRequestsTab';

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
  const [userStatus, setUserStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | null>(null);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
        setSelectedItem(null);
        setActiveTab('details');
        setShowDeleteConfirm(false);
    }
  };

  const isOwner = selectedItem && user ? user.id === selectedItem.author.id : false;

  useEffect(() => {
    if (selectedItem && selectedItem.type === 'EVENT') {
      if (isOwner) {
        loadJoinRequests();
      } else if (user) {
        checkUserStatus();
      }
    }
  }, [selectedItem?.id, activeTab, user?.id, isOwner]);

  const loadJoinRequests = async () => {
    if (!selectedItem) return;
    
    const pending = await getJoinRequests(selectedItem.id, 'PENDING');
    const approved = await getJoinRequests(selectedItem.id, 'APPROVED');
    
    setJoinRequests(pending);
    setApprovedParticipants(approved);
  };

  const checkUserStatus = async () => {
    if (!selectedItem || !user) return;
    
    const allParticipants = await getJoinRequests(selectedItem.id);
    const myParticipation = allParticipants.find((p: any) => p.user_id === user.id);
    
    if (myParticipation) {
      setUserStatus(myParticipation.status);
    } else {
      setUserStatus(null);
    }
  };

  if (!selectedItem) return null;

  const isTask = selectedItem.type === 'TASK';
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
        setUserStatus('PENDING');
      } else {
        setUserStatus('APPROVED');
      }
      await checkUserStatus();
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
            className="bg-[#F2F2F7] flex flex-col rounded-t-[32px] fixed bottom-0 left-0 right-0 z-[1001] outline-none shadow-2xl"
            style={{ minHeight: '50vh', maxHeight: '92vh' }}
        >
          
          {/* Scrollable Content with Header */}
          <div 
            ref={contentRef}
            className="flex-1 overflow-y-auto"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 120px)' }}
          >
            {/* Header - Now Scrollable */}
            <div className="relative h-64 shrink-0 bg-white overflow-hidden rounded-t-[32px]">
               {/* Vivid Background Gradient */}
               <div className={`absolute inset-0 bg-gradient-to-br ${
                 isTask 
                 ? 'from-yellow-300 via-orange-200 to-yellow-100' 
                 : 'from-[#5D5FEF] via-[#8B8DFF] to-[#D0D1FF]'
               }`}></div>
               
               {/* Abstract Shapes/Noise */}
               <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
               <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white opacity-20 blur-3xl mix-blend-overlay"></div>
               <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white opacity-20 blur-3xl mix-blend-overlay"></div>

               <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
                   <button onClick={() => setSelectedItem(null)} className="w-12 h-12 bg-white/30 backdrop-blur-xl rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg active:scale-95 border border-white/50 group">
                      <X className="w-6 h-6 text-gray-900 group-hover:scale-110 transition-transform" />
                   </button>
                   <div className="flex gap-2">
                      <button className="w-12 h-12 bg-white/30 backdrop-blur-xl rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg active:scale-95 border border-white/50 group">
                          <Share2 className="w-6 h-6 text-gray-900 group-hover:scale-110 transition-transform" />
                      </button>
                      {isOwner && (
                        <button 
                          onClick={handleDelete}
                          className={`w-12 h-12 backdrop-blur-xl rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 border ${
                            showDeleteConfirm 
                              ? 'bg-red-500 border-red-600' 
                              : 'bg-white/30 border-white/50 hover:bg-white'
                          }`}
                        >
                          {showDeleteConfirm ? (
                            <AlertCircle className="w-6 h-6 text-white" />
                          ) : (
                            <Trash2 className="w-6 h-6 text-gray-900" />
                          )}
                        </button>
                      )}
                   </div>
               </div>

               <div className="absolute bottom-6 left-6 right-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg mb-3 border border-white/20 ${
                      isTask 
                      ? 'bg-black text-[#FFD700]' 
                      : 'bg-black text-[#5D5FEF]'
                    }`}
                  >
                      {isTask ? <Briefcase className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                      {isTask ? t('task_label') || 'TASK' : t('event_label') || 'DVIZH'}
                  </motion.div>
                  <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`text-4xl font-black leading-tight line-clamp-3 tracking-tight ${
                      isTask ? 'text-gray-900' : 'text-white'
                    }`}
                  >
                      {selectedItem.title}
                  </motion.h1>
               </div>
            </div>

            {/* Content Container */}
            <div className="px-5 pt-6 pb-10">
            
            {/* Owner Tabs */}
            {isOwner && (
                <div className="mb-8 p-1.5 bg-white rounded-[24px] flex overflow-x-auto no-scrollbar shadow-sm border border-gray-100">
                    <button 
                        onClick={() => setActiveTab('details')}
                        className={`flex-1 py-3 px-4 rounded-[20px] text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'details' ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        {t('tab_details')}
                    </button>
                    {isTask && (
                      <button 
                          onClick={() => setActiveTab('responses')}
                          className={`flex-1 py-3 px-4 rounded-[20px] text-sm font-bold transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'responses' ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                          {t('tab_responses')} 
                          {selectedItem.responses?.length > 0 && (
                             <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'responses' ? 'bg-white text-black' : 'bg-gray-200 text-gray-600'}`}>
                                {selectedItem.responses.length}
                             </span>
                          )}
                      </button>
                    )}
                    {!isTask && requiresApproval && (
                      <button 
                          onClick={() => setActiveTab('join-requests')}
                          className={`flex-1 py-3 px-4 rounded-[20px] text-sm font-bold transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'join-requests' ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                          {t('tab_join_requests')} 
                          {joinRequests.length > 0 && (
                              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'join-requests' ? 'bg-white text-black' : 'bg-gray-200 text-gray-600'}`}>
                                {joinRequests.length}
                              </span>
                          )}
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

          {/* Footer Action - Floating */}
          <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#F2F2F7] via-[#F2F2F7]/95 to-transparent pt-12 z-30 pointer-events-none">
             <div className="pointer-events-auto">
                {isOwner ? (
                    isTask && selectedItem.status === 'IN_PROGRESS' && user ? (
                          <SlideButton 
                             text={t('slide_to_complete')}
                             onSuccess={() => completeItem(selectedItem.id, user.id)}
                             className="bg-[#ccff00]"
                             icon={<CheckCircle className="w-6 h-6 text-black" />}
                          />
                    ) : (
                        <div className="w-full py-4 text-gray-400 font-bold text-center flex items-center justify-center gap-2 bg-white/50 backdrop-blur-md rounded-[24px] border border-gray-200/50">
                             <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" />
                             {t('waiting_for_action') || "Wait for activity..."}
                        </div>
                     )
                 ) : isCompleted ? (
                   <div className="w-full py-5 text-center">
                       <div className="inline-flex items-center gap-3 px-8 py-4 bg-white text-green-600 font-black rounded-full shadow-lg border border-green-100">
                           <CheckCircle className="w-6 h-6" />
                           <span className="text-lg">{t('completed')}</span>
                       </div>
                   </div>
                ) : isFull ? (
                   <div className="w-full py-5 text-center">
                       <div className="inline-flex items-center gap-3 px-8 py-4 bg-gray-200 text-gray-500 font-black rounded-full shadow-inner">
                           <Users className="w-6 h-6" />
                           <span className="text-lg">{t('event_full')}</span>
                       </div>
                   </div>
                ) : (
                    <>
                      {/* Event: User is APPROVED - Show Chat Button */}
                      {!isTask && userStatus === 'APPROVED' ? (
                         <motion.div 
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="flex flex-col gap-3"
                         >
                           <div className="w-full py-4 bg-[#ccff00] text-black rounded-[28px] font-black text-lg text-center flex items-center justify-center gap-2 shadow-lg shadow-lime-300/30">
                               <CheckCircle className="w-6 h-6" /> 
                               <span>{t('you_are_in')}</span>
                           </div>

                           {(selectedItem as any).telegram_topic_id && (
                             <motion.button
                               whileTap={{ scale: 0.97 }}
                               onClick={() => {
                                 const chatIdNumeric = ((selectedItem as any).telegram_chat_id || '-1003836967887').replace('-100', '');
                                 const topicLink = `https://t.me/c/${chatIdNumeric}/${(selectedItem as any).telegram_topic_id}`;
                                 window.open(topicLink, '_blank');
                               }}
                               className="w-full py-4 bg-[#5D5FEF] text-white rounded-[28px] font-black text-lg shadow-xl shadow-indigo-500/30 hover:shadow-2xl transition-all flex items-center justify-center gap-3"
                             >
                               <MessageCircle className="w-6 h-6" />
                               <span>{t('open_chat')}</span>
                             </motion.button>
                           )}
                         </motion.div>
                      ) : !isTask && userStatus === 'PENDING' ? (
                         <motion.div 
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="w-full py-6 bg-white border-2 border-yellow-400 text-yellow-600 rounded-[28px] font-black text-xl text-center flex items-center justify-center gap-3 shadow-lg"
                         >
                             <Clock className="w-7 h-7" /> 
                             <span>{t('waiting_approval')}</span>
                         </motion.div>
                      ) : (
                        <SlideButton 
                           text={isTask ? t('slide_to_apply') : (requiresApproval ? t('request_to_join') : t('slide_to_join'))}
                           onSuccess={isTask ? handleRespond : handleJoin}
                           className={isTask ? "bg-yellow-100" : "bg-blue-100"}
                           icon={isTask ? <Briefcase className="w-6 h-6 text-yellow-700" /> : <Users className="w-6 h-6 text-[#5D5FEF]" />}
                           disabled={isJoining}
                        />
                      )}
                    </>
                )}
             </div>
          </div>

        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}