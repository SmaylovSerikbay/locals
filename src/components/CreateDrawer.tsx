'use client';

import React, { useRef } from 'react';
import { Drawer } from 'vaul';
import { useCreateStore } from '@/store/useCreateStore';
import { useItemsStore } from '@/store/useItemsStore';
import { useUserStore } from '@/store/useUserStore';
import { useTranslations } from 'next-intl';
import { ArrowRight, Type, AlignLeft, Calendar, MapPin, DollarSign, Sparkles, ChevronRight } from 'lucide-react';
import { Currency } from '@/store/useItemsStore';
import { motion } from 'framer-motion';

const CURRENCIES: Currency[] = ['USD', 'KZT', 'RUB', 'EUR'];

// Custom Date & Time Picker with Presets
function DateTrigger({ value, onChange }: { value: string, onChange: (val: string) => void }) {
    const [showPicker, setShowPicker] = React.useState(false);
    const [selectedDate, setSelectedDate] = React.useState<Date>(value ? new Date(value) : new Date());

    // Helper to format display
    const formatDisplay = (iso: string) => {
        if (!iso) return 'Select date & time';
        return new Date(iso).toLocaleString('ru-RU', { 
            weekday: 'short', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const applyPreset = (hours: number) => {
        const date = new Date();
        date.setHours(date.getHours() + hours);
        date.setMinutes(0, 0, 0);
        setSelectedDate(date);
        onChange(date.toISOString().slice(0, 16));
        setShowPicker(false);
    };

    const handleCustomSave = () => {
        onChange(selectedDate.toISOString().slice(0, 16));
        setShowPicker(false);
    };

    return (
        <>
            <div 
                onClick={() => setShowPicker(true)}
                className="flex items-center gap-3 px-4 py-4 bg-white border border-gray-100 rounded-[24px] shadow-sm cursor-pointer active:bg-gray-50 transition-all hover:border-blue-200 group"
            >
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">When</div>
                    <div className={`text-lg font-black ${value ? 'text-gray-900' : 'text-gray-300'}`}>
                        {formatDisplay(value)}
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            {/* Custom Picker Modal */}
            {showPicker && (
                <div 
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1100] flex items-end"
                    onClick={() => setShowPicker(false)}
                >
                    <motion.div 
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-[#F2F2F7] rounded-t-[32px] p-6 pb-8"
                    >
                        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Choose Time</h3>
                        
                        {/* Quick Presets */}
                        <div className="space-y-3 mb-6">
                            <button
                                onClick={() => applyPreset(3)}
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-[24px] font-bold text-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-between"
                            >
                                <span>🌙 Tonight (3 hours)</span>
                                <ChevronRight className="w-6 h-6 opacity-50" />
                            </button>
                            <button
                                onClick={() => applyPreset(24)}
                                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-6 rounded-[24px] font-bold text-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-between"
                            >
                                <span>☀️ Tomorrow</span>
                                <ChevronRight className="w-6 h-6 opacity-50" />
                            </button>
                            <button
                                onClick={() => applyPreset(168)}
                                className="w-full bg-gradient-to-r from-[#ccff00] to-[#b3e600] text-black py-4 px-6 rounded-[24px] font-bold text-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-between"
                            >
                                <span>📅 Next Week</span>
                                <ChevronRight className="w-6 h-6 opacity-50" />
                            </button>
                        </div>

                        {/* Custom Date/Time */}
                        <div className="bg-white rounded-[24px] p-4 mb-4 shadow-sm">
                            <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Custom Date & Time</label>
                            <input 
                                type="datetime-local"
                                value={selectedDate.toISOString().slice(0, 16)}
                                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 text-lg outline-none focus:border-black transition-colors"
                            />
                            <button
                                onClick={handleCustomSave}
                                className="w-full mt-3 bg-black text-white py-4 px-6 rounded-xl font-bold hover:bg-gray-900 active:scale-[0.98] transition-all"
                            >
                                Apply Custom Time
                            </button>
                        </div>

                        <button
                            onClick={() => setShowPicker(false)}
                            className="w-full text-gray-500 font-bold py-3 hover:text-gray-900 transition-colors"
                        >
                            Cancel
                        </button>
                    </motion.div>
                </div>
            )}
        </>
    );
}

export default function CreateDrawer() {
  const { isOpen, setIsOpen, step, setStep, setType, type, location, formData, setFormData, reset } = useCreateStore();
  const { createItem } = useItemsStore();
  const { user } = useUserStore();
  const t = useTranslations('CreateFlow');
  
  const contentRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    if (!type || !location || !user) {
      console.error('Missing required data:', { type, location, user });
      return;
    }

    const itemData = {
      type,
      title: formData.title,
      description: formData.description,
      price: formData.price ? Number(formData.price) : undefined,
      currency: formData.currency,
      event_date: type === 'EVENT' ? formData.date : undefined,
      latitude: location[0],
      longitude: location[1],
      author_id: user.id,
      // New moderation fields
      max_participants: type === 'EVENT' && formData.maxParticipants ? Number(formData.maxParticipants) : undefined,
      requires_approval: type === 'EVENT' ? (formData.requiresApproval ?? false) : false,
    };

    const createdItem = await createItem(itemData);
    
    if (createdItem) {
      setIsOpen(false);
      reset();
    }
  };

  const isTask = type === 'TASK';

  return (
    <Drawer.Root 
        open={isOpen && step !== 2} 
        onOpenChange={setIsOpen} 
        shouldScaleBackground
        disablePreventScroll={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[1000] backdrop-blur-sm" />
        <Drawer.Content 
            className="bg-[#F2F2F7] flex flex-col rounded-t-[32px] fixed bottom-0 left-0 right-0 z-[1001] outline-none shadow-2xl"
            style={{ minHeight: '40vh', maxHeight: '85vh' }}
        >
          
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mt-3 mb-2 z-20" />

          {/* Wrapper with padding for safe area */}
          <div 
            ref={contentRef}
            className="flex-1 overflow-y-auto p-6"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)' }}
          >
            
            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pt-2"
              >
                <h2 className="text-3xl font-black text-left mb-6 text-gray-900 tracking-tighter flex items-center gap-2">
                    <Sparkles className="w-8 h-8 text-[#FFD700] fill-[#FFD700]" />
                    {t('step_1_title') || "Create New"}
                </h2>
                
                <div className="flex flex-col gap-4">
                     {/* Task Card - Vibrant */}
                     <button 
                        onClick={() => { setType('TASK'); setStep(2); setIsOpen(false); }}
                        className="relative w-full p-5 rounded-[32px] bg-white shadow-sm active:scale-[0.98] transition-all flex items-center gap-5 overflow-hidden group border border-transparent hover:border-yellow-300 hover:shadow-lg hover:shadow-yellow-100"
                     >
                         <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-yellow-200 to-orange-100 flex items-center justify-center text-3xl shrink-0 group-hover:rotate-12 transition-transform shadow-inner">
                             📦
                         </div>
                         <div className="text-left flex-1 z-10">
                             <h3 className="text-xl font-black text-gray-900">{t('task_label')}</h3>
                             <p className="text-sm text-gray-500 font-bold">Find help nearby</p>
                         </div>
                         <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-yellow-50 transition-colors">
                            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-yellow-600" />
                         </div>
                     </button>

                     {/* Event Card - Vibrant */}
                     <button 
                        onClick={() => { setType('EVENT'); setStep(2); setIsOpen(false); }}
                        className="relative w-full p-5 rounded-[32px] bg-white shadow-sm active:scale-[0.98] transition-all flex items-center gap-5 overflow-hidden group border border-transparent hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100"
                     >
                         <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-[#00E0FF] to-[#5D5FEF] flex items-center justify-center text-3xl shrink-0 group-hover:-rotate-12 transition-transform shadow-inner text-white">
                             🎉
                         </div>
                         <div className="text-left flex-1 z-10">
                             <h3 className="text-xl font-black text-gray-900">{t('event_label')}</h3>
                             <p className="text-sm text-gray-500 font-bold">Hangout together</p>
                         </div>
                         <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
                         </div>
                     </button>
                </div>
              </motion.div>
            )}
            
            {step === 3 && (
               <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-5 pt-2"
               >
                  <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-1">
                      {t('step_3_title') || (isTask ? "Describe Task" : "Describe Event")}
                  </h2>
                  
                  {/* Form Fields */}
                  <div className="bg-white rounded-[32px] p-2 space-y-1 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-100">
                          <Type className="w-5 h-5 text-gray-400" />
                          <input 
                            className="flex-1 py-4 bg-transparent outline-none font-black text-xl placeholder:text-gray-300 text-gray-900"
                            value={formData.title}
                            onChange={(e) => setFormData({ title: e.target.value })}
                            placeholder={isTask ? "Ex: Walk my dog" : "Ex: Football match"}
                          />
                      </div>

                      <div className="flex items-start gap-3 px-4 py-2">
                          <AlignLeft className="w-5 h-5 text-gray-400 mt-4" />
                          <textarea 
                            className="flex-1 py-3 bg-transparent outline-none font-medium text-lg placeholder:text-gray-300 text-gray-900 min-h-[100px] resize-none leading-relaxed"
                            value={formData.description}
                            onChange={(e) => setFormData({ description: e.target.value })}
                            placeholder={t('desc_label')}
                          />
                      </div>
                  </div>

                  <div className="bg-white rounded-[32px] p-2 shadow-sm border border-gray-100">
                      {isTask ? (
                          <div className="flex flex-col gap-2 p-2">
                             <div className="flex items-center gap-3 px-2">
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-green-600" />
                                </div>
                                <input 
                                    type="number"
                                    className="flex-1 py-2 bg-transparent outline-none font-black text-4xl placeholder:text-gray-200 text-gray-900 tracking-tight"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ price: e.target.value })}
                                    placeholder="0"
                                />
                             </div>
                             
                             {/* Horizontal Currency Scroll */}
                             <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-2">
                                {CURRENCIES.map(curr => (
                                    <button
                                        key={curr}
                                        onClick={() => setFormData({ currency: curr })}
                                        className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all whitespace-nowrap ${
                                            formData.currency === curr 
                                            ? 'bg-black text-white shadow-lg transform scale-105' 
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }`}
                                    >
                                        {curr}
                                    </button>
                                ))}
                             </div>
                          </div>
                      ) : (
                          <div className="p-1 space-y-2">
                              <DateTrigger 
                                  value={formData.date} 
                                  onChange={(val) => setFormData({ date: val })} 
                              />
                          </div>
                      )}
                  </div>

                  {/* Event-specific options */}
                  {!isTask && (
                    <div className="space-y-3">
                      {/* Max Participants */}
                      <div className="bg-white rounded-[32px] p-5 shadow-sm border border-gray-100">
                        <label className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-[#B921FF]/10 flex items-center justify-center">
                              <span className="text-2xl">👥</span>
                            </div>
                            <div>
                              <div className="text-base font-bold text-gray-900">Max Participants</div>
                              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Leave empty for unlimited</div>
                            </div>
                          </div>
                        </label>
                        <input 
                          type="number"
                          min="2"
                          className="w-full py-4 px-5 bg-gray-50 border border-gray-200 rounded-[20px] outline-none font-black text-xl placeholder:text-gray-300 text-gray-900 focus:border-[#B921FF] transition-colors"
                          value={formData.maxParticipants || ''}
                          onChange={(e) => setFormData({ maxParticipants: e.target.value })}
                          placeholder="Unlimited"
                        />
                      </div>

                      {/* Requires Approval Toggle */}
                      <div 
                        onClick={() => setFormData({ requiresApproval: !formData.requiresApproval })}
                        className="bg-white rounded-[32px] p-5 shadow-sm cursor-pointer active:scale-[0.98] transition-all border border-gray-100 hover:border-blue-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-12 h-12 rounded-full bg-[#5D5FEF]/10 flex items-center justify-center">
                              <span className="text-2xl">🔐</span>
                            </div>
                            <div>
                              <div className="text-base font-bold text-gray-900">Approve Requests</div>
                              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Manually approve who joins</div>
                            </div>
                          </div>
                          <div className={`w-16 h-9 rounded-full transition-all relative ${
                            formData.requiresApproval ? 'bg-[#5D5FEF]' : 'bg-gray-200'
                          }`}>
                            <div className={`absolute top-1 w-7 h-7 bg-white rounded-full shadow-md transition-all ${
                              formData.requiresApproval ? 'right-1' : 'left-1'
                            }`} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 px-5 py-4 bg-white/50 rounded-[24px] border border-white/60">
                     <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 animate-pulse">
                        <MapPin className="w-5 h-5 text-red-500" />
                     </div>
                     <div className="flex-1">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Location</div>
                        <div className="font-bold text-gray-900">Selected on Map</div>
                     </div>
                  </div>

                  <button 
                    onClick={handleSubmit}
                    className="w-full py-5 bg-black text-white rounded-[32px] font-black text-xl hover:bg-[#111] active:scale-95 transition-all mt-2 shadow-2xl shadow-black/30 flex items-center justify-center gap-3 group mb-8"
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