'use client';

import { Drawer } from 'vaul';
import { useCreateStore } from '@/store/useCreateStore';
import { useItemsStore } from '@/store/useItemsStore';
import { useTranslations } from 'next-intl';

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
        <Drawer.Content className="bg-white flex flex-col rounded-t-[10px] fixed bottom-0 left-0 right-0 z-[1001] outline-none max-h-[90vh]">
          <div className="p-4 bg-white rounded-t-[10px] flex-1 overflow-y-auto">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-6" />
            
            {step === 1 && (
              <div className="pb-8">
                <h2 className="text-xl font-bold text-center mb-6">{t('step_1_title')}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleTypeSelect('TASK')}
                    className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-yellow-50 hover:bg-yellow-100 transition-colors border border-yellow-200"
                  >
                    <div className="w-16 h-16 rounded-full bg-yellow-200 flex items-center justify-center text-3xl">
                      📦
                    </div>
                    <span className="font-semibold text-gray-800">{t('task_label')}</span>
                  </button>

                  <button 
                     onClick={() => handleTypeSelect('EVENT')}
                     className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200"
                  >
                    <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center text-3xl">
                      🎉
                    </div>
                    <span className="font-semibold text-gray-800">{t('event_label')}</span>
                  </button>
                </div>
              </div>
            )}
            
            {step === 3 && (
               <div className="pb-8 flex flex-col gap-4">
                  <h2 className="text-xl font-bold mb-4">{t('step_3_title')}</h2>
                  
                  <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">{t('title_label')}</label>
                      <input 
                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.title}
                        onChange={(e) => setFormData({ title: e.target.value })}
                        placeholder={isTask ? "Ex: Walk my dog" : "Ex: Football match"}
                      />
                  </div>

                  <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">{t('desc_label')}</label>
                      <textarea 
                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                        value={formData.description}
                        onChange={(e) => setFormData({ description: e.target.value })}
                      />
                  </div>

                  {isTask ? (
                      <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">{t('price_label')}</label>
                          <input 
                            type="number"
                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.price}
                            onChange={(e) => setFormData({ price: e.target.value })}
                          />
                      </div>
                  ) : (
                      <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">{t('date_label')}</label>
                          <input 
                            type="datetime-local"
                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.date}
                            onChange={(e) => setFormData({ date: e.target.value })}
                          />
                      </div>
                  )}

                  <button 
                    onClick={handleSubmit}
                    className="w-full py-4 bg-black text-white rounded-xl font-semibold text-lg hover:bg-gray-900 transition-colors mt-4"
                  >
                    {t('create_btn')}
                  </button>
               </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}