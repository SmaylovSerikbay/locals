'use client';

import { Drawer } from 'vaul';
import { useSearchStore } from '@/store/useSearchStore';
import { useItemsStore } from '@/store/useItemsStore';
import { useTranslations } from 'next-intl';
import { Search as SearchIcon, X, MapPin, TrendingUp, Clock, Flame, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

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
        <Drawer.Content className="bg-[#F2F2F7] flex flex-col rounded-t-[32px] h-[92vh] fixed bottom-0 left-0 right-0 z-[1001] outline-none shadow-2xl">
          
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mt-3 mb-2 z-20" />

          {/* Search Header - Sticky & Stylish */}
          <div className="px-5 py-2 sticky top-0 z-10 bg-[#F2F2F7]">
             <div className="bg-white rounded-[24px] px-4 py-3 flex items-center gap-4 shadow-sm border border-gray-100 transition-all focus-within:ring-4 focus-within:ring-black/5 focus-within:border-black/20 focus-within:shadow-md">
                <SearchIcon className="w-6 h-6 text-gray-400" />
                <input 
                    className="flex-1 bg-transparent outline-none font-bold text-xl placeholder:text-gray-300 text-gray-900 h-10"
                    placeholder={t('search_placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus={false} 
                />
                {searchQuery && (
                    <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSearchQuery('')} 
                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-500" />
                    </motion.button>
                )}
             </div>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
             {!searchQuery ? (
                 // Recommendations View
                 <div className="space-y-6">
                    {/* Trending Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-4 px-1">
                            <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
                            <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm">{t('suggested')}</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {recommendations.map((item, i) => (
                                <motion.button 
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={() => handleItemClick(item)}
                                    className="bg-white p-4 rounded-[28px] flex flex-col items-start gap-3 shadow-sm hover:shadow-lg transition-all active:scale-[0.97] text-left border border-gray-100 hover:border-gray-200 h-full relative overflow-hidden group"
                                >
                                    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${item.type === 'TASK' ? 'from-yellow-100 to-transparent' : 'from-blue-100 to-transparent'} rounded-bl-[40px] opacity-50`}></div>
                                    
                                    <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center text-2xl shadow-sm z-10 group-hover:scale-110 transition-transform ${item.type === 'TASK' ? 'bg-[#FFD700] text-black' : 'bg-[#5D5FEF] text-white'}`}>
                                        {item.type === 'TASK' ? '📦' : '🎉'}
                                    </div>
                                    <div className="z-10 w-full">
                                        <h4 className="font-black text-gray-900 leading-tight line-clamp-2 mb-1.5 text-base">{item.title}</h4>
                                        {item.price ? (
                                            <span className="inline-block bg-black text-white px-2 py-0.5 rounded-md text-xs font-bold">
                                                {item.price} {item.currency}
                                            </span>
                                        ) : (
                                            <span className="inline-block bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md text-xs font-bold">
                                                Free
                                            </span>
                                        )}
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Recent Searches (Mockup) */}
                    <div>
                        <div className="flex items-center gap-2 mb-3 px-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <h3 className="font-bold text-gray-400 uppercase tracking-wide text-xs">Recent</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['Football', 'Dog walking', 'Party'].map(tag => (
                                <button key={tag} className="px-4 py-2 bg-white rounded-full text-sm font-bold text-gray-600 border border-gray-100 hover:border-gray-300 hover:text-black transition-all">
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                 </div>
             ) : (
                 // Search Results List
                 filteredItems.length === 0 ? (
                     <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
                         <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6 opacity-50">
                            <SearchIcon className="w-10 h-10 text-gray-500" />
                         </div>
                         <h3 className="font-black text-gray-900 text-xl mb-1">Nothing found</h3>
                         <p className="font-medium text-gray-400">Try searching for something else</p>
                     </div>
                 ) : (
                     <div className="space-y-3">
                        {filteredItems.map((item, i) => (
                            <motion.button 
                               key={item.id}
                               initial={{ opacity: 0, x: -10 }}
                               animate={{ opacity: 1, x: 0 }}
                               transition={{ delay: i * 0.05 }}
                               onClick={() => handleItemClick(item)}
                               className="w-full bg-white rounded-[28px] p-4 flex items-center gap-4 hover:bg-gray-50 active:scale-[0.98] transition-all shadow-sm border border-gray-100 group"
                            >
                               <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center text-2xl flex-shrink-0 shadow-sm transition-transform group-hover:rotate-6 ${item.type === 'TASK' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                                   {item.type === 'TASK' ? '📦' : '🎉'}
                               </div>
                               <div className="flex-1 text-left min-w-0">
                                   <h3 className="font-bold text-gray-900 truncate text-lg">{item.title}</h3>
                                   <p className="text-sm text-gray-500 truncate font-medium">{item.description}</p>
                               </div>
                               <div className="flex-shrink-0 flex items-center gap-3">
                                   {item.type === 'TASK' && item.price && (
                                       <span className="font-black text-gray-900 bg-[#ccff00] px-3 py-1.5 rounded-xl text-sm shadow-sm border border-lime-200">
                                           {item.price} {item.currency}
                                       </span>
                                   )}
                                   <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-900 transition-colors" />
                               </div>
                            </motion.button>
                        ))}
                     </div>
                 )
             )}
          </div>

        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}