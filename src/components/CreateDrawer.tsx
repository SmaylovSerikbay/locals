'use client';

import { Drawer } from 'vaul';
import { useCreateStore } from '@/store/useCreateStore';
import { useItemsStore } from '@/store/useItemsStore';
import { useTranslations } from 'next-intl';
import { ArrowRight, Type, AlignLeft, DollarSign, Calendar, MapPin } from 'lucide-react';

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
        currency: 'KZT',
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
        <Drawer.Content className="bg-[#F2F2F7] flex flex-col rounded-t-[20px] fixed bottom-0 left-0 right-0 z-[1001] outline-none max-h-[90vh] shadow-2xl">
          
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mt-3 mb-2 z-20" />

          <div className="p-6 flex-1 overflow-y-auto">
            
            {step === 1 && (
              <div className="pb-8">
                <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">{t('step_1_title')}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleTypeSelect('TASK')}
                    className="relative group overflow-hidden flex flex-col items-center gap-4 p-6 rounded-[30px] bg-white shadow-sm hover:shadow-md transition-all duration-300 active:scale-95 border border-transparent hover:border-yellow-400"
                  >
                    <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                      📦
                    </div>
                    <span className="font-bold text-gray-900 text-lg">{t('task_label')}</span>
                  </button>

                  <button 
                     onClick={() => handleTypeSelect('EVENT')}
                     className="relative group overflow-hidden flex flex-col items-center gap-4 p-6 rounded-[30px] bg-white shadow-sm hover:shadow-md transition-all duration-300 active:scale-95 border border-transparent hover:border-blue-400"
                  >
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                      🎉
                    </div>
                    <span className="font-bold text-gray-900 text-lg">{t('event_label')}</span>
                  </button>
                </div>
              </div>
            )}
            
            {step === 3 && (
               <div className="pb-8 flex flex-col gap-5">
                  <div className="flex items-center gap-2 mb-2">
                     <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">3</div>
                     <h2 className="text-2xl font-bold text-gray-900">{t('step_3_title')}</h2>
                  </div>
                  
                  <div className="bg-white rounded-[24px] p-2 space-y-1 shadow-sm">
                      <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-100">
                          <Type className="w-5 h-5 text-gray-400" />
                          <input 
                            className="flex-1 py-3 bg-transparent outline-none font-semibold text-lg placeholder:text-gray-300 text-gray-900"
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
                              <DollarSign className="w-5 h-5 text-green-500" />
                              <input 
                                  type="number"
                                  className="flex-1 py-3 bg-transparent outline-none font-bold text-xl placeholder:text-gray-300 text-gray-900"
                                  value={formData.price}
                                  onChange={(e) => setFormData({ price: e.target.value })}
                                  placeholder="0"
                              />
                              <span className="text-gray-400 font-bold">KZT</span>
                          </div>
                      ) : (
                          <div className="flex items-center gap-3 px-4 py-2">
                              <Calendar className="w-5 h-5 text-blue-500" />
                              <input 
                                type="datetime-local"
                                className="flex-1 py-3 bg-transparent outline-none font-medium text-lg text-gray-900"
                                value={formData.date}
                                onChange={(e) => setFormData({ date: e.target.value })}
                              />
                          </div>
                      )}
                  </div>

                  {/* Location Preview (Static) */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/50 rounded-2xl border border-white/60">
                     <MapPin className="w-5 h-5 text-red-500" />
                     <span className="text-sm text-gray-500 font-medium">Selected Location on Map</span>
                  </div>

                  <button 
                    onClick={handleSubmit}
                    className="w-full py-5 bg-black text-white rounded-[24px] font-bold text-lg hover:bg-gray-900 active:scale-95 transition-all mt-4 shadow-xl flex items-center justify-center gap-2 group"
                  >
                    {t('create_btn')}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}