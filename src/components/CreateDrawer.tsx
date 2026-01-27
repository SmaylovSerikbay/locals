'use client';

import { Drawer } from 'vaul';
import { useCreateStore } from '@/store/useCreateStore';
import { useItemsStore } from '@/store/useItemsStore';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';

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
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[1000]" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[20px] fixed bottom-0 left-0 right-0 z-[1001] outline-none max-h-[90vh] shadow-2xl">
          <div className="p-6 bg-white rounded-t-[20px] flex-1 overflow-y-auto">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-200 mb-8" />
            
            {step === 1 && (
              <div className="pb-8">
                <h2 className="text-2xl font-bold text-center mb-8">{t('step_1_title')}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleTypeSelect('TASK')}
                    className="relative group overflow-hidden flex flex-col items-center gap-4 p-6 rounded-[2rem] bg-[#FEF9C3] hover:bg-[#FEF08A] transition-all duration-300 active:scale-95"
                  >
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-4xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                      📦
                    </div>
                    <span className="font-bold text-gray-900 text-lg">{t('task_label')}</span>
                  </button>

                  <button 
                     onClick={() => handleTypeSelect('EVENT')}
                     className="relative group overflow-hidden flex flex-col items-center gap-4 p-6 rounded-[2rem] bg-[#DBEAFE] hover:bg-[#BFDBFE] transition-all duration-300 active:scale-95"
                  >
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-4xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                      🎉
                    </div>
                    <span className="font-bold text-gray-900 text-lg">{t('event_label')}</span>
                  </button>
                </div>
              </div>
            )}
            
            {step === 3 && (
               <div className="pb-8 flex flex-col gap-5">
                  <h2 className="text-2xl font-bold mb-2">{t('step_3_title')}</h2>
                  
                  <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900 ml-1">{t('title_label')}</label>
                      <input 
                        className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none font-medium"
                        value={formData.title}
                        onChange={(e) => setFormData({ title: e.target.value })}
                        placeholder={isTask ? "Ex: Walk my dog" : "Ex: Football match"}
                      />
                  </div>

                  <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900 ml-1">{t('desc_label')}</label>
                      <textarea 
                        className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none font-medium min-h-[120px] resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({ description: e.target.value })}
                      />
                  </div>

                  {isTask ? (
                      <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-900 ml-1">{t('price_label')}</label>
                          <div className="relative">
                            <input 
                                type="number"
                                className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none font-medium pl-4"
                                value={formData.price}
                                onChange={(e) => setFormData({ price: e.target.value })}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold pointer-events-none">₸</div>
                          </div>
                      </div>
                  ) : (
                      <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-900 ml-1">{t('date_label')}</label>
                          <input 
                            type="datetime-local"
                            className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none font-medium"
                            value={formData.date}
                            onChange={(e) => setFormData({ date: e.target.value })}
                          />
                      </div>
                  )}

                  <button 
                    onClick={handleSubmit}
                    className="w-full py-5 bg-black text-white rounded-[2rem] font-bold text-lg hover:bg-gray-900 active:scale-95 transition-all mt-6 shadow-xl flex items-center justify-center gap-2 group"
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