'use client';

import { Drawer } from 'vaul';
import { useCreateStore } from '@/store/useCreateStore';
import { useItemsStore } from '@/store/useItemsStore';
import { useTranslations } from 'next-intl';
import { ArrowRight, Type, AlignLeft, Calendar, MapPin, DollarSign, ChevronDown } from 'lucide-react';
import { Currency } from '@/store/useItemsStore';

export default function CreateDrawer() {
  const { isOpen, setIsOpen, step, setStep, setType, type, location, formData, setFormData, reset } = useCreateStore();
  const { addItem } = useItemsStore();
  const t = useTranslations('CreateFlow');

  const handleTypeSelect = (selectedType: 'TASK' | 'EVENT') => {
    setType(selectedType);
    setStep(2);
    setIsOpen(false);
  };

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
        author: {
            name: 'Me (You)',
            avatarUrl: 'https://i.pravatar.cc/150?u=me',
            reputation: 5.0
        }
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
              <div className="pb-8 pt-4">
                <h2 className="text-3xl font-extrabold text-center mb-8 text-gray-900 tracking-tight">{t('step_1_title')}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleTypeSelect('TASK')}
                    className="relative group overflow-hidden flex flex-col items-center gap-4 p-8 rounded-[32px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(253,224,71,0.3)] transition-all duration-300 active:scale-95 border-2 border-transparent hover:border-[#FEF08A]"
                  >
                    <div className="w-24 h-24 rounded-full bg-[#FEF9C3] flex items-center justify-center text-5xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                      📦
                    </div>
                    <span className="font-bold text-gray-900 text-xl">{t('task_label')}</span>
                  </button>

                  <button 
                     onClick={() => handleTypeSelect('EVENT')}
                     className="relative group overflow-hidden flex flex-col items-center gap-4 p-8 rounded-[32px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(191,219,254,0.3)] transition-all duration-300 active:scale-95 border-2 border-transparent hover:border-[#BFDBFE]"
                  >
                    <div className="w-24 h-24 rounded-full bg-[#DBEAFE] flex items-center justify-center text-5xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                      🎉
                    </div>
                    <span className="font-bold text-gray-900 text-xl">{t('event_label')}</span>
                  </button>
                </div>
              </div>
            )}
            
            {step === 3 && (
               <div className="pb-8 flex flex-col gap-5 pt-2">
                  <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">{t('step_3_title')}</h2>
                  
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
                          <div className="flex items-center gap-3 px-4 py-2">
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-green-600" />
                              </div>
                              <input 
                                  type="number"
                                  className="flex-1 py-3 bg-transparent outline-none font-bold text-xl placeholder:text-gray-300 text-gray-900"
                                  value={formData.price}
                                  onChange={(e) => setFormData({ price: e.target.value })}
                                  placeholder="0"
                              />
                              <div className="relative">
                                  <select 
                                    className="appearance-none bg-gray-100 font-bold text-gray-700 py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ currency: e.target.value as Currency })}
                                  >
                                      <option value="USD">USD</option>
                                      <option value="KZT">KZT</option>
                                      <option value="RUB">RUB</option>
                                      <option value="EUR">EUR</option>
                                  </select>
                                  <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
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

                  {/* Location Preview (Static) */}
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
               </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}