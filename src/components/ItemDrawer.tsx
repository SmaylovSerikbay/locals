'use client';

import { Drawer } from 'vaul';
import { useItemsStore } from '@/store/useItemsStore';
import { Calendar, CreditCard, Star, X, MapPin, Share2, Heart, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ItemDrawer() {
  const { selectedItem, setSelectedItem } = useItemsStore();
  const t = useTranslations('ItemDetails');

  const isOpen = !!selectedItem;

  const handleOpenChange = (open: boolean) => {
    if (!open) setSelectedItem(null);
  };

  if (!selectedItem) return null;

  const isTask = selectedItem.type === 'TASK';

  return (
    <Drawer.Root open={isOpen} onOpenChange={handleOpenChange} shouldScaleBackground>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[1000] backdrop-blur-sm" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[30px] h-[75vh] fixed bottom-0 left-0 right-0 z-[1001] outline-none shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          
          {/* Cover / Map Placeholder */}
          <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-[30px] relative overflow-hidden">
             {/* Abstract Pattern */}
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
             
             {/* Top Actions */}
             <div className="absolute top-4 right-4 flex gap-2">
                <button className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm active:scale-90">
                    <Share2 className="w-5 h-5 text-gray-700" />
                </button>
                <button className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm active:scale-90">
                    <Heart className="w-5 h-5 text-gray-700" />
                </button>
                <button onClick={() => setSelectedItem(null)} className="w-10 h-10 bg-black/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/20 transition-colors active:scale-90 text-white">
                    <X className="w-5 h-5" />
                </button>
             </div>

             {/* Type Badge */}
             <div className={`absolute bottom-4 left-6 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${isTask ? 'bg-[#FEF9C3] text-yellow-800' : 'bg-[#DBEAFE] text-blue-800'}`}>
                {isTask ? 'Task' : 'Event'}
             </div>
          </div>

          <div className="flex-1 overflow-y-auto -mt-6 bg-white rounded-t-[30px] px-6 pt-8 pb-4 relative z-10 flex flex-col">
            
            {/* Title & Price */}
            <div className="flex justify-between items-start gap-4 mb-2">
                <h2 className="text-3xl font-bold leading-tight text-gray-900">{selectedItem.title}</h2>
                {isTask && (
                    <div className="flex flex-col items-end">
                        <span className="text-2xl font-bold text-black">{selectedItem.price} {selectedItem.currency}</span>
                    </div>
                )}
            </div>

            {/* Meta Info Row */}
            <div className="flex items-center gap-4 text-gray-500 text-sm font-medium mb-6">
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
            <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-[24px] mb-6 hover:bg-gray-50 transition-colors cursor-pointer active:scale-[0.98]">
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
            <div className="mb-8">
                <h3 className="text-lg font-bold mb-3 text-gray-900">About</h3>
                <p className="text-gray-600 leading-relaxed text-[17px]">
                    {selectedItem.description}
                </p>
            </div>

          </div>

          {/* Bottom Action Bar */}
          <div className="p-4 border-t border-gray-100 bg-white pb-8 sticky bottom-0 z-20">
             <button className="w-full py-4 bg-black text-white rounded-[24px] font-bold text-xl hover:bg-gray-900 transition-all active:scale-[0.98] shadow-lg shadow-black/20 flex items-center justify-center gap-2">
                {isTask ? t('respond') : t('join')}
             </button>
          </div>

        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}