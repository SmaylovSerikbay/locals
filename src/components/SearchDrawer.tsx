'use client';

import { Drawer } from 'vaul';
import { useSearchStore } from '@/store/useSearchStore';
import { useItemsStore } from '@/store/useItemsStore';
import { useTranslations } from 'next-intl';
import { Search as SearchIcon, X, MapPin, TrendingUp, Clock } from 'lucide-react';

export default function SearchDrawer() {
  const { isSearchOpen, setSearchOpen, searchQuery, setSearchQuery } = useSearchStore();
  const { items, setSelectedItem } = useItemsStore();
  const t = useTranslations('HomePage');

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setSearchOpen(false);
  };

  // Mock recommendations (first 4 items usually, or specialized mock)
  const recommendations = items.slice(0, 4); 

  return (
    <Drawer.Root open={isSearchOpen} onOpenChange={setSearchOpen} shouldScaleBackground>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[1000] backdrop-blur-sm" />
        <Drawer.Content className="bg-[#F2F2F7] flex flex-col rounded-t-[20px] h-[85vh] fixed bottom-0 left-0 right-0 z-[1001] outline-none shadow-2xl">
          
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mt-3 mb-2 z-20" />

          {/* Search Header */}
          <div className="px-4 py-2 sticky top-0 z-10 bg-[#F2F2F7]">
             <div className="bg-white rounded-[20px] px-4 py-3 flex items-center gap-3 shadow-sm border border-gray-100 transition-all focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300">
                <SearchIcon className="w-5 h-5 text-gray-400" />
                <input 
                    className="flex-1 bg-transparent outline-none font-medium text-lg placeholder:text-gray-400 text-gray-900"
                    placeholder={t('search_placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus={false} // Disabled autoFocus as requested
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="p-1 bg-gray-100 rounded-full hover:bg-gray-200">
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                )}
             </div>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
             {!searchQuery ? (
                 // Recommendations View
                 <div>
                    <div className="flex items-center gap-2 mb-4 px-2">
                        <TrendingUp className="w-4 h-4 text-gray-500" />
                        <h3 className="font-bold text-gray-500 uppercase tracking-wide text-xs">{t('suggested')}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {recommendations.map(item => (
                            <button 
                                key={item.id}
                                onClick={() => handleItemClick(item)}
                                className="bg-white p-4 rounded-[24px] flex flex-col items-start gap-3 shadow-sm hover:shadow-md transition-all active:scale-95 text-left border border-transparent hover:border-gray-100"
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${item.type === 'TASK' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                                    {item.type === 'TASK' ? '📦' : '🎉'}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 leading-tight line-clamp-2 mb-1">{item.title}</h4>
                                    {item.price && (
                                        <span className="text-sm font-semibold text-gray-500">{item.price} {item.currency}</span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                 </div>
             ) : (
                 // Search Results
                 filteredItems.length === 0 ? (
                     <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
                         <SearchIcon className="w-16 h-16 mb-4 opacity-20" />
                         <p className="font-medium">Nothing found</p>
                     </div>
                 ) : (
                     filteredItems.map(item => (
                         <button 
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            className="w-full bg-white rounded-[24px] p-4 flex items-center gap-4 hover:bg-gray-50 active:scale-[0.98] transition-all shadow-sm border border-gray-100"
                         >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 border-gray-100 flex-shrink-0 ${item.type === 'TASK' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                                {item.type === 'TASK' ? '📦' : '🎉'}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <h3 className="font-bold text-gray-900 truncate text-[17px]">{item.title}</h3>
                                <p className="text-sm text-gray-500 truncate">{item.description}</p>
                            </div>
                            <div className="flex-shrink-0">
                                {item.type === 'TASK' && item.price && (
                                    <span className="font-bold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-full text-sm">
                                        {item.price} {item.currency}
                                    </span>
                                )}
                            </div>
                         </button>
                     ))
                 )
             )}
          </div>

        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}