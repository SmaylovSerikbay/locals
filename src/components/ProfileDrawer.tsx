'use client';

import { Drawer } from 'vaul';
import { useUserStore } from '@/store/useUserStore';
import { useTranslations } from 'next-intl';
import { Instagram, Star, Check, Globe, Settings, LogOut, ChevronRight } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';

export default function ProfileDrawer() {
  const { user, isProfileOpen, setProfileOpen, updateInstagram } = useUserStore();
  const t = useTranslations('Profile');
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  if (!user) return null;

  const handleLanguageChange = (locale: string) => {
    router.replace(pathname, { locale });
  };

  return (
    <Drawer.Root open={isProfileOpen} onOpenChange={setProfileOpen} shouldScaleBackground>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[1000] backdrop-blur-sm" />
        <Drawer.Content className="bg-[#F2F2F7] flex flex-col rounded-t-[32px] h-[85vh] fixed bottom-0 left-0 right-0 z-[1001] outline-none shadow-2xl">
          
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mt-3 mb-2 z-20" />

          <div className="flex-1 overflow-y-auto pb-8">
            {/* Header / Avatar - Modern Card Style */}
            <div className="mx-4 mt-4 bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-10"></div>
              
              <div className="relative">
                 <div className="w-28 h-28 rounded-full bg-white p-1.5 shadow-xl overflow-hidden relative z-10 border-4 border-white">
                    {user.photoUrl ? (
                        <img src={user.photoUrl} alt={user.firstName} className="w-full h-full object-cover rounded-full" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400 bg-gray-100 rounded-full">
                            {user.firstName[0]}
                        </div>
                    )}
                 </div>
                 <div className="absolute -bottom-2 -right-2 bg-black text-white text-sm font-black px-3 py-1.5 rounded-full border-[3px] border-white shadow-lg flex items-center gap-1.5 z-20 transform rotate-3 hover:scale-110 transition-transform">
                    <Star className="w-3.5 h-3.5 fill-[#FFD700] text-[#FFD700]" /> 
                    {user.reputation.toFixed(1)}
                 </div>
              </div>
              
              <h2 className="text-3xl font-black mt-5 text-gray-900 tracking-tight text-center">
                  {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-500 font-bold text-sm bg-gray-100 px-3 py-1 rounded-full mt-2">
                  @{user.username || 'username'}
              </p>

              {/* Stats Row (Mockup for now) */}
              <div className="flex items-center gap-8 mt-6 w-full justify-center">
                  <div className="text-center">
                      <div className="text-xl font-black text-gray-900">12</div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Tasks</div>
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div className="text-center">
                      <div className="text-xl font-black text-gray-900">5</div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Events</div>
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div className="text-center">
                      <div className="text-xl font-black text-gray-900">4.9</div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Rating</div>
                  </div>
              </div>
            </div>

            {/* Settings Group */}
            <div className="px-5 space-y-6 mt-6">
                
                {/* Instagram Section */}
                <div className="space-y-2">
                   <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider ml-4 flex items-center gap-2">
                       <Instagram className="w-3 h-3" />
                       {t('instagram_label')}
                   </h3>
                   <div className="bg-white rounded-[24px] p-2 shadow-sm flex items-center gap-3 pr-4 border border-gray-100 focus-within:border-pink-300 focus-within:ring-4 focus-within:ring-pink-50 transition-all">
                       <div className="w-12 h-12 rounded-[18px] bg-gradient-to-tr from-[#FFD600] via-[#FF0069] to-[#7638FA] flex items-center justify-center text-white shadow-md">
                          <Instagram className="w-6 h-6" />
                       </div>
                       <input 
                            className="flex-1 bg-transparent text-lg font-bold outline-none placeholder:text-gray-300 text-gray-900"
                            placeholder="@username"
                            value={user.instagram || ''}
                            onChange={(e) => updateInstagram(e.target.value)}
                        />
                   </div>
                </div>

                {/* Language Section */}
                <div className="space-y-2">
                   <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider ml-4 flex items-center gap-2">
                       <Globe className="w-3 h-3" />
                       {t('language')}
                   </h3>
                   <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
                       <button 
                         onClick={() => handleLanguageChange('en')}
                         className="w-full flex items-center justify-between p-4 active:bg-gray-50 transition-colors border-b border-gray-50 hover:bg-gray-50 group"
                       >
                           <div className="flex items-center gap-4">
                               <span className="text-3xl group-hover:scale-110 transition-transform">🇬🇧</span>
                               <span className="font-bold text-gray-900 text-lg">English</span>
                           </div>
                           {currentLocale === 'en' && (
                               <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center shadow-lg">
                                   <Check className="w-5 h-5 text-white stroke-[3]" />
                               </div>
                           )}
                       </button>

                       <button 
                         onClick={() => handleLanguageChange('ru')}
                         className="w-full flex items-center justify-between p-4 active:bg-gray-50 transition-colors hover:bg-gray-50 group"
                       >
                           <div className="flex items-center gap-4">
                               <span className="text-3xl group-hover:scale-110 transition-transform">🇷🇺</span>
                               <span className="font-bold text-gray-900 text-lg">Русский</span>
                           </div>
                           {currentLocale === 'ru' && (
                               <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center shadow-lg">
                                   <Check className="w-5 h-5 text-white stroke-[3]" />
                               </div>
                           )}
                       </button>
                   </div>
                </div>

                {/* More Settings Link (Mockup) */}
                <div className="pt-4">
                    <button className="w-full bg-white rounded-[24px] p-4 flex items-center justify-between shadow-sm border border-gray-100 hover:bg-gray-50 active:scale-[0.98] transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                                <Settings className="w-5 h-5 text-gray-600" />
                            </div>
                            <span className="font-bold text-gray-900">App Settings</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}