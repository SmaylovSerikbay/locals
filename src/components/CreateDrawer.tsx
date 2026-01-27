'use client';

import { Drawer } from 'vaul';
import { useCreateStore } from '@/store/useCreateStore';
import { useItemsStore } from '@/store/useItemsStore';
import { useTranslations } from 'next-intl';
import { ArrowRight, Type, AlignLeft, Calendar, MapPin, DollarSign, Sparkles, ChevronRight, Clock, ChevronLeft } from 'lucide-react';
import { Currency } from '@/store/useItemsStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';

const CURRENCIES: Currency[] = ['USD', 'KZT', 'RUB', 'EUR'];

// Simple Custom Date Picker Component
function CustomDatePicker({ value, onChange }: { value: string, onChange: (val: string) => void }) {
    const [view, setView] = useState<'PRESET' | 'CUSTOM'>('PRESET');
    
    // Helper to format ISO string for display
    const formatDisplay = (iso: string) => {
        if (!iso) return 'Select time';
        const date = new Date(iso);
        return date.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    };

    const handlePreset = (offsetDays: number, hour: number) => {
        const date = new Date();
        date.setDate(date.getDate() + offsetDays);
        date.setHours(hour, 0, 0, 0);
        // Adjust to local ISO string (simple hack)
        const tzOffset = date.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
        onChange(localISOTime);
    };

    return (
        <div className="w-full">
            <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">When</div>
                    <div className="text-lg font-bold text-gray-900">{value ? formatDisplay(value) : 'Pick a time'}</div>
                </div>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-2 gap-2 mb-2">
                <button onClick={() => handlePreset(0, 18)} className="bg-white p-3 rounded-xl border border-gray-100 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                    🌙 Tonight (18:00)
                </button>
                <button onClick={() => handlePreset(1, 19)} className="bg-white p-3 rounded-xl border border-gray-100 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                    🚀 Tomorrow (19:00)
                </button>
                <button onClick={() => handlePreset(0, new Date().getHours() + 1)} className="bg-white p-3 rounded-xl border border-gray-100 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                    ⚡ In 1 hour
                </button>
                <button onClick={() => setView(view === 'CUSTOM' ? 'PRESET' : 'CUSTOM')} className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-sm font-bold text-blue-700 hover:bg-blue-100 transition-colors">
                    📅 Custom...
                </button>
            </div>

            {/* Native Picker Fallback (Styled better) */}
            {view === 'CUSTOM' && (
                 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                    <input 
                        type="datetime-local"
                        className="w-full p-3 bg-gray-50 rounded-xl font-bold text-gray-700 outline-none border border-gray-200"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                 </motion.div>
            )}
        </div>
    );
}

export default function CreateDrawer() {
  const { isOpen, setIsOpen, step, setStep, setType, type, location, formData, setFormData, reset } = useCreateStore();
  const { addItem } = useItemsStore();
  const t = useTranslations('CreateFlow');
  
  // Ref for managing viewport/keyboard issues
  const contentRef = useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
    if (!type || !location) return;

    addItem({
        id: Math.random().toString(36).substr(2, 9),
        type,
        title: formData.title,
        description: formData.description,
        price: formData.price ? Number(formData.price) : undefined,
        currency: formData.currency,
        eventDate: type === 'EVENT' ? formData.date : undefined,
        location: location,
        status: 'OPEN',
        author: {
            id: '123456',
            name: 'Me (You)',
            avatarUrl: 'https://i.pravatar.cc/300?u=meirzhan',
            reputation: 5.0
        },
        responses: []
    });

    setIsOpen(false);
    reset();
  };

  const isTask = type === 'TASK';

  return (
    <Drawer.Root 
        open={isOpen && step !== 2} 
        onOpenChange={setIsOpen} 
        shouldScaleBackground
        // disablePreventScroll // Sometimes helps with keyboard layout shifts on mobile
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[1000] backdrop-blur-sm" />
        <Drawer.Content className="bg-[#F2F2F7] flex flex-col rounded-t-[32px] fixed bottom-0 left-0 right-0 z-[1001] outline-none max-h-[90dvh] shadow-2xl">
          
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mt-3 mb-2 z-20" />

          {/* Wrapper with explicit height management for keyboard */}
          <div 
            ref={contentRef}
            className="flex-1 overflow-y-auto p-6"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            
            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pt-2"
              >
                <h2 className="text-2xl font-extrabold text-left mb-6 text-gray-900 tracking-tight flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                    {t('step_1_title')}
                </h2>
                
                <div className="flex flex-col gap-3">
                     {/* Task Card - Compact */}
                     <button 
                        onClick={() => { setType('TASK'); setStep(2); setIsOpen(false); }}
                        className="relative w-full p-4 rounded-[24px] bg-white shadow-sm active:scale-[0.98] transition-all flex items-center gap-4 overflow-hidden group border border-transparent hover:border-yellow-200"
                     >
                         <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                             📦
                         </div>
                         <div className="text-left flex-1 z-10">
                             <h3 className="text-lg font-bold text-gray-900">{t('task_label')}</h3>
                             <p className="text-sm text-gray-500 font-medium">Find help nearby</p>
                         </div>
                         <ChevronRight className="w-5 h-5 text-gray-300" />
                     </button>

                     {/* Event Card - Compact */}
                     <button 
                        onClick={() => { setType('EVENT'); setStep(2); setIsOpen(false); }}
                        className="relative w-full p-4 rounded-[24px] bg-white shadow-sm active:scale-[0.98] transition-all flex items-center gap-4 overflow-hidden group border border-transparent hover:border-blue-200"
                     >
                         <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                             🎉
                         </div>
                         <div className="text-left flex-1 z-10">
                             <h3 className="text-lg font-bold text-gray-900">{t('event_label')}</h3>
                             <p className="text-sm text-gray-500 font-medium">Hangout together</p>
                         </div>
                         <ChevronRight className="w-5 h-5 text-gray-300" />
                     </button>
                </div>
              </motion.div>
            )}
            
            {step === 3 && (
               <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-4 pt-2"
               >
                  <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1">{t('step_3_title')}</h2>
                  
                  {/* Form Fields */}
                  <div className="bg-white rounded-[24px] p-2 space-y-1 shadow-sm">
                      <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-100">
                          <Type className="w-5 h-5 text-gray-400" />
                          <input 
                            className="flex-1 py-3 bg-transparent outline-none font-bold text-lg placeholder:text-gray-300 text-gray-900"
                            value={formData.title}
                            onChange={(e) => setFormData({ title: e.target.value })}
                            placeholder={isTask ? "Ex: Walk my dog" : "Ex: Football match"}
                          />
                      </div>

                      <div className="flex items-start gap-3 px-4 py-2">
                          <AlignLeft className="w-5 h-5 text-gray-400 mt-3" />
                          <textarea 
                            className="flex-1 py-3 bg-transparent outline-none font-medium text-base placeholder:text-gray-300 text-gray-900 min-h-[80px] resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({ description: e.target.value })}
                            placeholder={t('desc_label')}
                          />
                      </div>
                  </div>

                  <div className="bg-white rounded-[24px] p-2 shadow-sm">
                      {isTask ? (
                          <div className="flex flex-col gap-2 p-2">
                             <div className="flex items-center gap-3 px-2">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                </div>
                                <input 
                                    type="number"
                                    className="flex-1 py-2 bg-transparent outline-none font-bold text-2xl placeholder:text-gray-300 text-gray-900"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ price: e.target.value })}
                                    placeholder="0"
                                />
                             </div>
                             
                             {/* Horizontal Currency Scroll */}
                             <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                {CURRENCIES.map(curr => (
                                    <button
                                        key={curr}
                                        onClick={() => setFormData({ currency: curr })}
                                        className={`px-4 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap ${
                                            formData.currency === curr 
                                            ? 'bg-black text-white shadow-md' 
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }`}
                                    >
                                        {curr}
                                    </button>
                                ))}
                             </div>
                          </div>
                      ) : (
                          <div className="p-2">
                              <CustomDatePicker 
                                  value={formData.date} 
                                  onChange={(val) => setFormData({ date: val })} 
                              />
                          </div>
                      )}
                  </div>

                  <div className="flex items-center gap-3 px-4 py-4 bg-white/50 rounded-[24px] border border-white/60">
                     <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-red-500" />
                     </div>
                     <div className="flex-1">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Location</div>
                        <div className="font-bold text-gray-900">Selected on Map</div>
                     </div>
                  </div>

                  <button 
                    onClick={handleSubmit}
                    className="w-full py-4 bg-black text-white rounded-[24px] font-bold text-lg hover:bg-gray-900 active:scale-95 transition-all mt-2 shadow-xl shadow-black/20 flex items-center justify-center gap-2 group mb-4"
                  >
                    {t('create_btn')}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
               </motion.div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}