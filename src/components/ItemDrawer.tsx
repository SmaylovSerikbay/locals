'use client';

import { Drawer } from 'vaul';
import { useItemsStore, Response } from '@/store/useItemsStore';
import { Calendar, Clock, Star, X, MapPin, Share2, Heart, CheckCircle, MessageSquare, Briefcase } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useUserStore } from '@/store/useUserStore';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ItemDrawer() {
  const { selectedItem, setSelectedItem, addResponse, updateResponseStatus, completeItem } = useItemsStore();
  const { user } = useUserStore();
  const t = useTranslations('ItemDetails');
  
  const [activeTab, setActiveTab] = useState<'details' | 'responses'>('details');

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

  // Handling responses
  const handleRespond = () => {
      if (!user) return;
      const newResponse: Response = {
          id: Math.random().toString(36).substr(2, 9),
          userId: String(user.id),
          userName: user.firstName,
          userAvatar: user.photoUrl || '',
          userReputation: 5.0,
          message: 'Ready to help!',
          status: 'PENDING',
          createdAt: new Date().toISOString()
      };
      addResponse(selectedItem.id, newResponse);
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={handleOpenChange} shouldScaleBackground>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[1000] backdrop-blur-sm" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[30px] h-[85vh] fixed bottom-0 left-0 right-0 z-[1001] outline-none shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          
          {/* Cover / Map Placeholder */}
          <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-[30px] relative overflow-hidden shrink-0">
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
             
             <div className="absolute top-4 right-4 flex gap-2 z-10">
                <button className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm active:scale-90">
                    <Share2 className="w-5 h-5 text-gray-700" />
                </button>
                <button onClick={() => setSelectedItem(null)} className="w-10 h-10 bg-black/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/20 transition-colors active:scale-90 text-white">
                    <X className="w-5 h-5" />
                </button>
             </div>

             <div className={`absolute bottom-4 left-6 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm z-10 ${isTask ? 'bg-[#FEF9C3] text-yellow-800' : 'bg-[#DBEAFE] text-blue-800'}`}>
                {isTask ? 'Task' : 'Event'}
             </div>
          </div>

          <div className="flex-1 overflow-y-auto -mt-6 bg-white rounded-t-[30px] pt-8 pb-20 relative z-10 flex flex-col">
            
            {/* Owner Controls Tabs */}
            {isOwner && isTask && (
                <div className="px-6 mb-6">
                    <div className="bg-gray-100 p-1 rounded-xl flex">
                        <button 
                            onClick={() => setActiveTab('details')}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'details' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                        >
                            Details
                        </button>
                        <button 
                            onClick={() => setActiveTab('responses')}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'responses' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                        >
                            Responses ({selectedItem.responses.length})
                        </button>
                    </div>
                </div>
            )}

            <AnimatePresence mode="wait">
                {activeTab === 'details' ? (
                    <motion.div 
                        key="details"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="px-6 flex flex-col gap-6"
                    >
                        {/* Title & Price */}
                        <div className="flex justify-between items-start gap-4">
                            <h2 className="text-3xl font-bold leading-tight text-gray-900">{selectedItem.title}</h2>
                            {isTask && (
                                <div className="flex flex-col items-end shrink-0">
                                    <span className="text-2xl font-bold text-black">{selectedItem.price} {selectedItem.currency}</span>
                                </div>
                            )}
                        </div>

                        {/* Status Badge */}
                        {selectedItem.status === 'COMPLETED' && (
                            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 self-start">
                                <CheckCircle className="w-5 h-5" /> Completed
                            </div>
                        )}

                        {/* Meta Info */}
                        <div className="flex items-center gap-2 flex-wrap text-gray-500 text-sm font-medium">
                            {isTask ? (
                                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                                    <Clock className="w-4 h-4" />
                                    <span>ASAP</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(selectedItem.eventDate!).toLocaleDateString()}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                                <MapPin className="w-4 h-4" />
                                <span>0.5 km away</span>
                            </div>
                        </div>

                        {/* Author */}
                        <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-[24px] hover:bg-gray-50 transition-colors cursor-pointer active:scale-[0.98]">
                            <img 
                            src={selectedItem.author.avatarUrl} 
                            alt={selectedItem.author.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                            <div className="flex-1">
                            <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-0.5">{t('hosted_by')}</div>
                            <h3 className="font-bold text-lg text-gray-900">{selectedItem.author.name}</h3>
                            </div>
                            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-bold text-yellow-700">{selectedItem.author.reputation}</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-bold mb-3 text-gray-900">About</h3>
                            <p className="text-gray-600 leading-relaxed text-[17px]">
                                {selectedItem.description}
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="responses"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="px-6 flex flex-col gap-4"
                    >
                         {selectedItem.responses.length === 0 ? (
                             <div className="text-center text-gray-400 py-10">
                                 <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                 <p>No responses yet</p>
                             </div>
                         ) : (
                             selectedItem.responses.map(response => (
                                 <div key={response.id} className="bg-white border border-gray-100 p-4 rounded-[24px] shadow-sm">
                                     <div className="flex items-center gap-3 mb-3">
                                         <img src={response.userAvatar} className="w-10 h-10 rounded-full bg-gray-200" />
                                         <div className="flex-1">
                                             <div className="font-bold">{response.userName}</div>
                                             <div className="text-xs text-yellow-600 flex items-center gap-1">
                                                 <Star className="w-3 h-3 fill-current" /> {response.userReputation}
                                             </div>
                                         </div>
                                         <div className="text-xs text-gray-400">{new Date(response.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                     </div>
                                     <div className="bg-gray-50 p-3 rounded-2xl text-sm text-gray-700 mb-3">
                                         "{response.message}"
                                     </div>
                                     
                                     {response.status === 'PENDING' && (
                                         <div className="flex gap-2">
                                             <button 
                                                onClick={() => updateResponseStatus(selectedItem.id, response.id, 'ACCEPTED')}
                                                className="flex-1 py-2 bg-black text-white rounded-xl font-bold text-sm active:scale-95 transition-transform"
                                             >
                                                 Accept
                                             </button>
                                             <button className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm active:scale-95 transition-transform">
                                                 Decline
                                             </button>
                                         </div>
                                     )}
                                     {response.status === 'ACCEPTED' && (
                                         <div className="w-full py-2 bg-green-100 text-green-700 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2">
                                             <CheckCircle className="w-4 h-4" /> Accepted Executor
                                         </div>
                                     )}
                                 </div>
                             ))
                         )}
                    </motion.div>
                )}
            </AnimatePresence>

          </div>

          {/* Bottom Action Bar (Sticky) */}
          <div className="p-4 border-t border-gray-100 bg-white pb-8 sticky bottom-0 z-20">
             {isOwner ? (
                 selectedItem.status === 'IN_PROGRESS' ? (
                     <button 
                        onClick={() => completeItem(selectedItem.id)}
                        className="w-full py-4 bg-green-500 text-white rounded-[24px] font-bold text-xl hover:bg-green-600 transition-all active:scale-[0.98] shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
                     >
                        <CheckCircle className="w-6 h-6" /> Complete Task
                     </button>
                 ) : (
                    <button className="w-full py-4 bg-gray-100 text-gray-400 rounded-[24px] font-bold text-xl cursor-not-allowed flex items-center justify-center gap-2">
                        Waiting for action...
                    </button>
                 )
             ) : (
                 <button 
                    onClick={handleRespond}
                    className="w-full py-4 bg-black text-white rounded-[24px] font-bold text-xl hover:bg-gray-900 transition-all active:scale-[0.98] shadow-lg shadow-black/20 flex items-center justify-center gap-2"
                 >
                    {isTask ? t('respond') : t('join')}
                 </button>
             )}
          </div>

        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}