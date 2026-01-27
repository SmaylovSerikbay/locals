'use client';

import { Drawer } from 'vaul';
import { useUserStore } from '@/store/useUserStore';
import { useTranslations } from 'next-intl';
import { Instagram, Star, Globe } from 'lucide-react';
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
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[1000]" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[10px] h-[60vh] fixed bottom-0 left-0 right-0 z-[1001] outline-none">
          <div className="p-4 bg-white rounded-t-[10px] flex-1">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-6" />
            
            <h2 className="text-xl font-bold text-center mb-8">{t('title')}</h2>

            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-full bg-gray-200 mb-3 overflow-hidden border-4 border-white shadow-lg">
                {user.photoUrl ? (
                    <img src={user.photoUrl} alt={user.firstName} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">
                        {user.firstName[0]}
                    </div>
                )}
              </div>
              <h3 className="text-2xl font-bold">{user.firstName} {user.lastName}</h3>
              <div className="flex items-center text-yellow-500 mt-1">
                <Star className="w-4 h-4 fill-current mr-1" />
                <span className="font-semibold">5.0</span>
                <span className="text-gray-400 ml-1 text-sm">({t('reputation')})</span>
              </div>
            </div>

            <div className="space-y-6 px-2">
                {/* Instagram Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Instagram className="w-4 h-4" />
                        {t('instagram_label')}
                    </label>
                    <input 
                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder={t('instagram_placeholder')}
                        value={user.instagram || ''}
                        onChange={(e) => updateInstagram(e.target.value)}
                    />
                </div>

                {/* Language Switcher */}
                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        {t('language')}
                    </label>
                    <div className="flex bg-gray-100 rounded-xl p-1">
                        <button 
                            onClick={() => handleLanguageChange('en')}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${currentLocale === 'en' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                        >
                            English
                        </button>
                        <button 
                            onClick={() => handleLanguageChange('ru')}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${currentLocale === 'ru' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                        >
                            Русский
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