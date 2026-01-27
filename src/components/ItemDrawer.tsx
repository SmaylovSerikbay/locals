'use client';

import { Drawer } from 'vaul';
import { useItemsStore, Response } from '@/store/useItemsStore';
import { Calendar, Clock, Star, X, MapPin, Share2, Heart, CheckCircle, Briefcase, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useUserStore } from '@/store/useUserStore';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SlideButton from '@/components/ui/SlideButton';

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
        <Drawer.Content className="bg-white flex flex-col rounded-t-[32px] h-[90vh] fixed bottom-0 left-0 right-0 z-[1001] outline-none shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          
          {/* Header Image / Actions */}
          <div className="relative h-64 shrink-0 bg-gray-100">
             {/* Gradient Background (Placeholder for Image) */}
             <div className={`absolute inset-0 bg-gradient-to-br ${isTask ? 'from-yellow-100 to-orange-50' : 'from-blue-100 to-indigo-50'}`}></div>
             
             {/* Pattern Overlay */}
             <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>

             {/* Close / Actions */}
             <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
                 <button onClick={() => setSelectedItem(null)} className="w-10 h-10 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white transition-all shadow-sm active:scale-95">
                    <X className="w-5 h-5 text-gray-900" />
                 </button>
                 <div className="flex gap-2">
                    <button className="w-10 h-10 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white transition-all shadow-sm active:scale-95">
                        <Share2 className="w-5 h-5 text-gray-900" />
                    </button>
                    <button className="w-10 h-10 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white transition-all shadow-sm active:scale-95">
                        <Heart className="w-5 h-5 text-gray-900" />
                    </button>
                 </div>
             </div>

             {/* Big Type Label */}
             <div className="absolute bottom-8 left-6">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm mb-2 ${isTask ? 'bg-yellow-400 text-yellow-950' : 'bg-blue-500 text-white'}`}>
                    {isTask ? <Briefcase className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                    {isTask ? 'Task' : 'Event'}
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 leading-tight pr-6 drop-shadow-sm max-w-[80%] line-clamp-2">
                    {selectedItem.title}
                </h1>
             </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto bg-white rounded-t-[32px] -mt-6 relative z-10 px-6 pt-8 pb-24">
            
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
                            {isTask && (
                                <div className="col-span-2 bg-gray-50 p-4 rounded-[24px] flex items-center justify-between border border-gray-100">
                                    <span className="text-gray-500 font-medium">Price</span>
                                    <span className="text-2xl font-black text-gray-900">{selectedItem.price} {selectedItem.currency}</span>
                                </div>
                            )}
                            <div className="bg-gray-50 p-3 rounded-[20px] flex flex-col gap-1 border border-gray-100">
                                <Clock className="w-5 h-5 text-gray-400 mb-1" />
                                <span className="text-xs text-gray-500 font-bold uppercase">When</span>
                                <span className="font-bold text-gray-900 text-sm">ASAP</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-[20px] flex flex-col gap-1 border border-gray-100">
                                <MapPin className="w-5 h-5 text-gray-400 mb-1" />
                                <span className="text-xs text-gray-500 font-bold uppercase">Distance</span>
                                <span className="font-bold text-gray-900 text-sm">0.5 km</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-3">
                            <h3 className="font-bold text-gray-900 text-lg">Description</h3>
                            <p className="text-gray-600 leading-relaxed text-[17px]">
                                {selectedItem.description}
                            </p>
                        </div>

                        {/* Author Card */}
                        <div className="space-y-3">
                             <h3 className="font-bold text-gray-900 text-lg">{t('hosted_by')}</h3>
                             <div className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-[24px] shadow-sm hover:border-gray-200 transition-colors">
                                <img 
                                    src={selectedItem.author.avatarUrl} 
                                    alt={selectedItem.author.name}
                                    className="w-14 h-14 rounded-full object-cover bg-gray-100"
                                />
                                <div className="flex-1">
                                    <h4 className="font-bold text-lg text-gray-900">{selectedItem.author.name}</h4>
                                    <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span>{selectedItem.author.reputation}</span>
                                    </div>
                                </div>
                                <button className="px-4 py-2 bg-black text-white rounded-full text-sm font-bold">
                                    Profile
                                </button>
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
                             selectedItem.responses.map(response => (
                                 <div key={response.id} className="bg-white border border-gray-100 p-5 rounded-[24px] shadow-sm hover:shadow-md transition-shadow">
                                     <div className="flex items-center gap-3 mb-3">
                                         <img src={response.userAvatar} className="w-12 h-12 rounded-full bg-gray-200 object-cover" />
                                         <div className="flex-1">
                                             <div className="font-bold text-lg">{response.userName}</div>
                                             <div className="text-xs text-yellow-600 flex items-center gap-1 font-bold">
                                                 <Star className="w-3 h-3 fill-current" /> {response.userReputation}
                                             </div>
                                         </div>
                                         <div className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                                             {new Date(response.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                         </div>
                                     </div>
                                     <div className="bg-gray-50 p-4 rounded-[18px] text-[15px] text-gray-700 mb-4 leading-relaxed font-medium">
                                         "{response.message}"
                                     </div>
                                     
                                     {response.status === 'PENDING' && (
                                         <div className="flex gap-2">
                                             <button 
                                                onClick={() => updateResponseStatus(selectedItem.id, response.id, 'ACCEPTED')}
                                                className="flex-1 py-3 bg-black text-white rounded-[16px] font-bold text-sm active:scale-95 transition-transform shadow-lg shadow-black/10"
                                             >
                                                 Accept
                                             </button>
                                             <button className="flex-1 py-3 bg-white border border-gray-200 text-gray-900 rounded-[16px] font-bold text-sm active:scale-95 transition-transform hover:bg-gray-50">
                                                 Decline
                                             </button>
                                         </div>
                                     )}
                                     {response.status === 'ACCEPTED' && (
                                         <div className="w-full py-3 bg-green-100 text-green-700 rounded-[16px] font-bold text-sm text-center flex items-center justify-center gap-2 border border-green-200">
                                             <CheckCircle className="w-5 h-5" /> Accepted Executor
                                         </div>
                                     )}
                                 </div>
                             ))
                         )}
                    </motion.div>
                )}
            </AnimatePresence>

          </div>

          {/* Sticky Footer Action */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-white/0 pt-8 z-30">
             <div className="bg-white/80 backdrop-blur-xl p-1.5 rounded-[36px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100">
                 {isOwner ? (
                     selectedItem.status === 'IN_PROGRESS' ? (
                         <SlideButton 
                            text="Slide to Complete"
                            onSuccess={() => completeItem(selectedItem.id)}
                            className="bg-green-50"
                            icon={<CheckCircle className="w-6 h-6 text-green-600" />}
                         />
                     ) : (
                        <div className="w-full py-4 text-gray-400 font-bold text-center flex items-center justify-center gap-2">
                             <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" />
                             Waiting for action...
                        </div>
                     )
                 ) : (
                     <SlideButton 
                        text={isTask ? t('respond') : t('join')}
                        onSuccess={handleRespond}
                     />
                 )}
             </div>
          </div>

        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}