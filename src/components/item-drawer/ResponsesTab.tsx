import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, X, Star, Briefcase } from 'lucide-react';
import { Item, ResponseStatus } from '@/store/useItemsStore';
import { User } from '@/store/useUserStore';

interface ResponsesTabProps {
  item: Item;
  user: User | null;
  updateResponseStatus: (responseId: string, status: ResponseStatus, authorId: number) => Promise<void>;
  t: (key: string) => string;
}

export default function ResponsesTab({ item, user, updateResponseStatus, t }: ResponsesTabProps) {
  return (
    <motion.div 
        key="responses"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="flex flex-col gap-4"
    >
         {(!item.responses || item.responses.length === 0) ? (
             <div className="text-center text-gray-400 py-12 flex flex-col items-center">
                 <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                    <Briefcase className="w-10 h-10 opacity-20 text-gray-900" />
                 </div>
                 <p className="font-bold text-gray-900 text-lg">{t('no_responses')}</p>
                 <p className="text-sm opacity-60 max-w-[200px] mt-1">{t('no_responses_desc')}</p>
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
                   className="bg-white border border-gray-100 p-5 rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all"
                 >
                     <div className="flex items-center gap-3 mb-4">
                         <div className="relative">
                           <img 
                             src={userAvatar} 
                             className="w-14 h-14 rounded-full bg-gray-100 object-cover border-2 border-white shadow-sm" 
                             onError={(e) => {
                               const target = e.target as HTMLImageElement;
                               target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + response.userId;
                             }}
                           />
                           {response.status === 'ACCEPTED' && (
                             <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-[3px] border-white flex items-center justify-center">
                               <CheckCircle className="w-3 h-3 text-white" />
                             </div>
                           )}
                         </div>
                         <div className="flex-1 min-w-0">
                             <div className="font-bold text-lg text-gray-900 truncate">{userName}</div>
                             <div className="flex items-center gap-2 mt-1">
                               <div className="flex items-center gap-1 text-black text-xs font-bold bg-[#FFD700] px-2 py-0.5 rounded-full">
                                   <Star className="w-3 h-3 fill-black" />
                                   <span>{userReputation.toFixed(1)}</span>
                               </div>
                               {responseUser?.username && (
                                 <span className="text-xs text-gray-400 font-medium">@{responseUser.username}</span>
                               )}
                             </div>
                         </div>
                         <div className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
                             {new Date((response as any).created_at || response.createdAt).toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}
                         </div>
                     </div>
                     
                     <div className="bg-gray-50 p-4 rounded-2xl text-[16px] text-gray-800 mb-5 leading-relaxed relative mx-1">
                         <div className="absolute -top-2 left-6 w-4 h-4 bg-gray-50 rotate-45"></div>
                         {response.message}
                     </div>
                     
                     {response.status === 'PENDING' && user && (
                         <div className="flex gap-3">
                             <button 
                                onClick={() => updateResponseStatus(response.id, 'ACCEPTED', user.id)}
                                className="flex-1 py-3.5 bg-black text-white rounded-2xl font-bold text-sm active:scale-95 transition-all shadow-lg shadow-black/20 flex items-center justify-center gap-2"
                             >
                                 <CheckCircle className="w-4 h-4" />
                                 {t('accept')}
                             </button>
                             <button 
                                onClick={() => updateResponseStatus(response.id, 'REJECTED', user.id)}
                                className="flex-1 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold text-sm active:scale-95 transition-all hover:bg-gray-50 flex items-center justify-center gap-2">
                                 <X className="w-4 h-4" />
                                 {t('decline')}
                             </button>
                         </div>
                     )}
                     {response.status === 'ACCEPTED' && (
                         <div className="w-full py-3 bg-green-50 text-green-700 rounded-2xl font-bold text-sm text-center flex items-center justify-center gap-2 border border-green-100">
                             <CheckCircle className="w-4 h-4" /> 
                             <span>{t('accepted_executor')}</span>
                         </div>
                     )}
                     {response.status === 'REJECTED' && (
                         <div className="w-full py-3 bg-gray-100 text-gray-400 rounded-2xl font-bold text-sm text-center">
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