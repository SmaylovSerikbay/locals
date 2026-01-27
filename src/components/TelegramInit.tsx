'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';

export default function TelegramInit() {
  const { setUser } = useUserStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initTelegram = () => {
      // Check if running in Telegram WebApp
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        console.log('Telegram WebApp found:', tg);
        console.log('InitDataUnsafe:', tg.initDataUnsafe);

        tg.ready();
        tg.expand();

        // Attempt to get user from TG data
        if (tg.initDataUnsafe?.user) {
          console.log('User data found in Telegram:', tg.initDataUnsafe.user);
          setUser({
              id: tg.initDataUnsafe.user.id,
              firstName: tg.initDataUnsafe.user.first_name,
              lastName: tg.initDataUnsafe.user.last_name,
              username: tg.initDataUnsafe.user.username,
              languageCode: tg.initDataUnsafe.user.language_code || 'en',
              photoUrl: tg.initDataUnsafe.user.photo_url
          });
          setIsInitialized(true);
          return;
        }
      }
      
      // Fallback/Mock Data (Only if NOT in Telegram or NO User Data)
      if (!isInitialized) {
        console.log('Running in browser mode (Mock Data) or no user data available');
        setUser({
          id: 123456,
          firstName: 'Meirzhan (Mock)',
          lastName: 'Developer',
          username: 'local_hero',
          languageCode: 'ru',
          photoUrl: 'https://i.pravatar.cc/300?u=meirzhan'
        });
        setIsInitialized(true);
      }
    };

    // Small delay to ensure script loads
    const timer = setTimeout(initTelegram, 500);
    return () => clearTimeout(timer);
  }, [setUser, isInitialized]);

  return null;
}