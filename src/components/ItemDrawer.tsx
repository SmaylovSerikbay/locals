'use client';

import { Drawer } from 'vaul';
import { useItemsStore } from '@/store/useItemsStore';
import { Calendar, CreditCard, Star, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ItemDrawer() {
  const { selectedItem, setSelectedItem } = useItemsStore();
  const t = useTranslations('HomePage'); // Using HomePage just for example, ideally should have common keys

  const isOpen = !!selectedItem;

  const handleOpenChange = (open: boolean) => {
    if (!open) setSelectedItem(null);
  };

  if (!selectedItem) return null;

  const isTask = selectedItem.type === 'TASK';

  return (
    <Drawer.Root open={isOpen} onOpenChange={handleOpenChange} shouldScaleBackground>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[1000]" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[10px] h-[50vh] fixed bottom-0 left-0 right-0 z-[1001] outline-none">
          <div className="p-4 bg-white rounded-t-[10px] flex-1">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-6" />
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3 items-center">
                <img 
                  src={selectedItem.author.avatarUrl} 
                  alt={selectedItem.author.name}
                  className="w-12 h-12 rounded-full object-cover border border-gray-100"
                />
                <div>
                  <h3 className="font-semibold text-lg">{selectedItem.author.name}</h3>
                  <div className="flex items-center text-yellow-500 text-sm">
                    <Star className="w-3 h-3 fill-current mr-1" />
                    <span>{selectedItem.author.reputation}</span>
                  </div>
                </div>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${isTask ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                {isTask ? 'Task' : 'Event'}
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-2">{selectedItem.title}</h2>
            
            <div className="flex items-center gap-4 text-gray-600 mb-6 text-sm">
              {isTask ? (
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" />
                  <span className="font-semibold text-black">{selectedItem.price} {selectedItem.currency}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(selectedItem.eventDate!).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <p className="text-gray-600 mb-8 leading-relaxed">
              {selectedItem.description}
            </p>

            <button className="w-full py-4 bg-black text-white rounded-xl font-semibold text-lg hover:bg-gray-900 transition-colors">
              {isTask ? 'Откликнуться' : 'Присоединиться'}
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}