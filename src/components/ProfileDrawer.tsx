'use client';

import { Drawer } from 'vaul';
import { useUserStore } from '@/store/useUserStore';
import { useTranslations } from 'next-intl';
import { Instagram, Star, Globe, ChevronRight } from 'lucide-react';
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
        <Drawer.Content className="bg-[#F2F2F7] flex flex-col rounded-t-[20px] h-[75vh] fixed bottom-0 left-0 right-0 z-[1001] outline-none shadow-2xl">
          
          {/* Handle */}
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mt-3 mb-2 z-20" />

          <div className="flex-1 overflow-y-auto pb-8">
            {/* Header / Avatar */}
            <div className="flex flex-col items-center pt-4 pb-8 bg-white rounded-b-[30px] shadow-sm mb-6">
              <div className="relative">
                 <div className="w-28 h-28 rounded-full bg-gray-100 p-1 shadow-lg overflow-hidden">
                    {user.photoUrl ? (
                        <img src={user.photoUrl} alt={user.firstName} className="w-full h-full object-cover rounded-full" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400 bg-gray-200 rounded-full">
                            {user.firstName[0]}
                        </div>
                    )}
                 </div>
                 <div className="absolute bottom-1 right-1 bg-black text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white shadow-md flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> 5.0
                 </div>
              </div>
              
              <h2 className="text-2xl font-bold mt-4 text-gray-900">{user.firstName} {user.lastName}</h2>
              <p className="text-gray-500 font-medium">@{user.username || 'username'}</p>
            </div>

            {/* Settings Group 1 */}
            <div className="px-4 space-y-6">
                
                {/* Instagram Section */}
                <div>
                   <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-4 mb-2">{t('instagram_label')}</h3>
                   <div className="bg-white rounded-2xl p-2 shadow-sm flex items-center gap-3 pr-4">
                       <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white shadow-md">
                          <Instagram className="w-6 h-6" />
                       </div>
                       <input 
                            className="flex-1 bg-transparent text-lg font-medium outline-none placeholder:text-gray-300"
                            placeholder="@username"
                            value={user.instagram || ''}
                            onChange={(e) => updateInstagram(e.target.value)}
                        />
                   </div>
                </div>

                {/* Language Section */}
                <div>
                   <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-4 mb-2">{t('language')}</h3>
                   <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                       <button 
                         onClick={() => handleLanguageChange('en')}
                         className="w-full flex items-center justify-between p-4 active:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                       >
                           <div className="flex items-center gap-3">
                               <span className="text-2xl">🇬🇧</span>
                               <span className="font-semibold text-gray-900">English</span>
                           </div>
                           {currentLocale === 'en' && <ChevronRight className="w-5 h-5 text-blue-500" />}
                       </button>

                       <button 
                         onClick={() => handleLanguageChange('ru')}
                         className="w-full flex items-center justify-between p-4 active:bg-gray-50 transition-colors"
                       >
                           <div className="flex items-center gap-3">
                               <span className="text-2xl">🇷🇺</span>
                               <span className="font-semibold text-gray-900">Русский</span>
                           </div>
                           {currentLocale === 'ru' && <ChevronRight className="w-5 h-5 text-blue-500" />}
                       </button>
                   </div>
                </div>

            </div>
            
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}