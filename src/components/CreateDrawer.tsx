'use client';

import { Drawer } from 'vaul';
import { useCreateStore } from '@/store/useCreateStore';
import { useItemsStore } from '@/store/useItemsStore';
import { useTranslations } from 'next-intl';
import { ArrowRight, Type, AlignLeft, Calendar, MapPin, DollarSign } from 'lucide-react';
import { Currency } from '@/store/useItemsStore';
import { motion, AnimatePresence } from 'framer-motion';

const CURRENCIES: Currency[] = ['USD', 'KZT', 'RUB', 'EUR'];

export default function CreateDrawer() {
  const { isOpen, setIsOpen, step, setStep, setType, type, location, formData, setFormData, reset } = useCreateStore();
  const { addItem } = useItemsStore();
  const t = useTranslations('CreateFlow');

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
    <Drawer.Root open={isOpen && step !== 2} onOpenChange={setIsOpen} shouldScaleBackground>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[1000] backdrop-blur-sm" />
        <Drawer.Content className="bg-[#F2F2F7] flex flex-col rounded-t-[30px] fixed bottom-0 left-0 right-0 z-[1001] outline-none max-h-[90vh] shadow-2xl">
          
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mt-3 mb-2 z-20" />

          <div className="p-6 flex-1 overflow-y-auto">
            
            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="pb-8 pt-4"
              >
                <h2 className="text-3xl font-extrabold text-center mb-8 text-gray-900 tracking-tight">{t('step_1_title')}</h2>
                
                {/* Compact Toggle / Segmented Control */}
                <div className="bg-gray-200 p-1.5 rounded-[20px] flex gap-2 mb-8">
                     <button 
                        onClick={() => { setType('TASK'); setStep(2); setIsOpen(false); }}
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-[16px] bg-white shadow-sm active:scale-95 transition-all"
                     >
                         <span className="text-2xl">📦</span>
                         <span className="font-bold text-gray-900 text-lg">{t('task_label')}</span>
                     </button>
                     <button 
                        onClick={() => { setType('EVENT'); setStep(2); setIsOpen(false); }}
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-[16px] bg-white/50 hover:bg-white shadow-sm active:scale-95 transition-all text-gray-500 hover:text-gray-900"
                     >
                         <span className="text-2xl">🎉</span>
                         <span className="font-bold text-lg">{t('event_label')}</span>
                     </button>
                </div>
              </motion.div>
            )}
            
            {step === 3 && (
               <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="pb-8 flex flex-col gap-5 pt-2"
               >
                  <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">{t('step_3_title')}</h2>
                  
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
                            className="flex-1 py-3 bg-transparent outline-none font-medium text-base placeholder:text-gray-300 text-gray-900 min-h-[100px] resize-none"
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
                          <div className="flex items-center gap-3 px-4 py-2">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-blue-600" />
                              </div>
                              <input 
                                type="datetime-local"
                                className="flex-1 py-3 bg-transparent outline-none font-bold text-lg text-gray-900"
                                value={formData.date}
                                onChange={(e) => setFormData({ date: e.target.value })}
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
                    className="w-full py-5 bg-black text-white rounded-[24px] font-bold text-xl hover:bg-gray-900 active:scale-95 transition-all mt-4 shadow-xl shadow-black/20 flex items-center justify-center gap-2 group"
                  >
                    {t('create_btn')}
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </button>
               </motion.div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}