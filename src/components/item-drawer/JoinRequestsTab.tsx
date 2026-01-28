import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, X, Users, Star } from 'lucide-react';

interface JoinRequestsTabProps {
  requests: any[];
  onApprove: (participantId: string) => void;
  onReject: (participantId: string) => void;
  t: (key: string) => string;
}

export default function JoinRequestsTab({ requests, onApprove, onReject, t }: JoinRequestsTabProps) {
  return (
    <motion.div 
        key="join-requests"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="flex flex-col gap-4"
    >
         {requests.length === 0 ? (
             <div className="text-center text-gray-400 py-12 flex flex-col items-center">
                 <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                    <Users className="w-10 h-10 opacity-20 text-gray-900" />
                 </div>
                 <p className="font-bold text-gray-900 text-lg">{t('no_requests')}</p>
                 <p className="text-sm opacity-60 max-w-[200px] mt-1">{t('no_requests_desc')}</p>
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
                   className="bg-white border border-gray-100 p-5 rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all"
                 >
                     <div className="flex items-center gap-3 mb-4">
                         <img 
                           src={userAvatar} 
                           className="w-14 h-14 rounded-full bg-gray-100 object-cover border-2 border-white shadow-sm" 
                           onError={(e) => {
                             const target = e.target as HTMLImageElement;
                             target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.user_id}`;
                           }}
                         />
                         <div className="flex-1 min-w-0">
                             <div className="font-bold text-lg text-gray-900 truncate">{userName}</div>
                             <div className="flex items-center gap-2 mt-1">
                               <div className="flex items-center gap-1 text-black text-xs font-bold bg-[#FFD700] px-2 py-0.5 rounded-full">
                                   <Star className="w-3 h-3 fill-black" />
                                   <span>{userReputation.toFixed(1)}</span>
                               </div>
                               {userData?.username && (
                                 <span className="text-xs text-gray-400 font-medium">@{userData.username}</span>
                               )}
                             </div>
                         </div>
                         <div className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                             {new Date(request.joined_at).toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}
                         </div>
                     </div>
                     
                     <div className="flex gap-3 mt-2">
                         <button 
                            onClick={() => onApprove(request.id)}
                            className="flex-1 py-3.5 bg-black text-white rounded-2xl font-bold text-sm active:scale-95 transition-all shadow-lg shadow-black/20 flex items-center justify-center gap-2"
                         >
                             <CheckCircle className="w-4 h-4" />
                             {t('approve')}
                         </button>
                         <button 
                            onClick={() => onReject(request.id)}
                            className="flex-1 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold text-sm active:scale-95 transition-all hover:bg-gray-50 flex items-center justify-center gap-2">
                             <X className="w-4 h-4" />
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