import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Star, MessageCircle, DollarSign, Calendar, Users } from 'lucide-react';
import { Item } from '@/store/useItemsStore';

interface DetailsTabProps {
  item: Item;
  isTask: boolean;
  isOwner: boolean;
  handleChat: () => void;
  approvedParticipants: any[];
  t: (key: string) => string;
}

export default function DetailsTab({ item, isTask, isOwner, handleChat, approvedParticipants, t }: DetailsTabProps) {
  return (
    <motion.div 
        key="details"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex flex-col gap-6"
    >
        {/* Price & Meta Grid */}
        <div className="grid grid-cols-2 gap-3">
            {isTask && item.price && (
                <div className="col-span-2 bg-gradient-to-r from-[#ccff00] to-[#b3e600] p-5 rounded-[24px] flex items-center justify-between shadow-lg shadow-lime-200/50">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <DollarSign className="w-6 h-6 text-black" />
                      </div>
                      <span className="text-black font-bold text-sm tracking-wide uppercase opacity-70">{t('reward')}</span>
                    </div>
                    <span className="text-3xl font-black text-black tracking-tight">{item.price} {item.currency}</span>
                </div>
            )}
            <div className="bg-soft-blue p-4 rounded-[24px] flex flex-col gap-2 border border-blue-100/50">
                <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center mb-1 shadow-md shadow-blue-500/30">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                    <span className="text-xs text-blue-500 font-bold uppercase tracking-wider block mb-0.5">{t('when')}</span>
                    <span className="font-bold text-gray-900 text-sm leading-tight block">
                        {item.eventDate ? new Date(item.eventDate).toLocaleDateString('ru-RU', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        }) : t('asap')}
                    </span>
                </div>
            </div>
            <div className="bg-soft-purple p-4 rounded-[24px] flex flex-col gap-2 border border-purple-100/50">
                <div className="w-10 h-10 bg-purple-500 rounded-2xl flex items-center justify-center mb-1 shadow-md shadow-purple-500/30">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                    <span className="text-xs text-purple-500 font-bold uppercase tracking-wider block mb-0.5">{t('distance')}</span>
                    <span className="font-bold text-gray-900 text-sm leading-tight block">
                        {(item as any).distance_meters ? ((item as any).distance_meters / 1000).toFixed(1) + ' km' : t('nearby')}
                    </span>
                </div>
            </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
            <h3 className="font-black text-gray-900 text-xl flex items-center gap-2">
              <span className="text-2xl">📝</span>
              {t('description')}
            </h3>
            <div className="text-gray-700 leading-relaxed text-[17px] bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
                {item.description}
            </div>
        </div>

        {/* Participants (Events) */}
        {!isTask && approvedParticipants.length > 0 && (
            <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                        {t('going')}
                        <span className="bg-black text-white px-2 py-0.5 rounded-full text-xs font-bold">
                            {approvedParticipants.length}
                        </span>
                    </h3>
                    <button onClick={handleChat} className="text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors">
                        {t('chat')}
                    </button>
                </div>
                <div className="flex items-center -space-x-3 overflow-hidden py-1 pl-1">
                    {approvedParticipants.slice(0, 5).map((p: any, i: number) => {
                      const userData = p.user;
                      return (
                        <div key={i} className="relative group hover:z-10 transition-all hover:scale-110">
                            <img 
                                src={userData?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.user_id}`} 
                                className="w-12 h-12 rounded-full border-[3px] border-white object-cover shadow-md bg-gray-100"
                                title={userData?.first_name || 'User'}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.user_id}`;
                                }}
                            />
                        </div>
                      );
                    })}
                    {approvedParticipants.length > 5 && (
                      <div className="w-12 h-12 rounded-full border-[3px] border-white bg-gray-900 flex items-center justify-center text-white font-bold text-sm shadow-md z-10">
                          +{approvedParticipants.length - 5}
                      </div>
                    )}
                </div>
            </div>
        )}

        {/* Author Card */}
        <div className="space-y-3 pb-4">
             <h3 className="font-black text-gray-900 text-xl flex items-center gap-2">
                <span className="text-2xl">👑</span>
                {t('hosted_by')}
             </h3>
             <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-[28px] shadow-lg shadow-gray-100 hover:shadow-xl transition-all group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <img 
                      src={item.author.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + item.author.id} 
                      alt={item.author.name || 'User'}
                      className="w-16 h-16 rounded-full object-cover bg-gray-100 border-2 border-white relative z-10"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + item.author.id;
                      }}
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-[3px] border-white z-20"></div>
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-lg text-gray-900 truncate">
                      {item.author.name || 'User'}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-black font-bold text-xs bg-[#FFD700] px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3 fill-black text-black" />
                          <span>{item.author.reputation?.toFixed(1) || '5.0'}</span>
                      </div>
                    </div>
                </div>
                {!isOwner && (
                    <button
                        onClick={handleChat}
                        className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/20"
                    >
                        <MessageCircle className="w-6 h-6" />
                    </button>
                )}
             </div>
        </div>
    </motion.div>
  );
}