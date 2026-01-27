'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';

export default function TelegramInit() {
  const { setUser } = useUserStore();

  useEffect(() => {
    // Check if running in Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      // Set user from TG data
      if (tg.initDataUnsafe?.user) {
        setUser({
            id: tg.initDataUnsafe.user.id,
            firstName: tg.initDataUnsafe.user.first_name,
            lastName: tg.initDataUnsafe.user.last_name,
            username: tg.initDataUnsafe.user.username,
            languageCode: tg.initDataUnsafe.user.language_code || 'en',
            photoUrl: tg.initDataUnsafe.user.photo_url
        });
      }
    } else {
      // Mock Data for Localhost Development
      console.log('Running in browser mode (Mock Data)');
      setUser({
        id: 123456,
        firstName: 'Meirzhan',
        lastName: 'Developer',
        username: 'local_hero',
        languageCode: 'ru',
        photoUrl: 'https://i.pravatar.cc/300?u=meirzhan'
      });
    }
  }, [setUser]);

  return null;
}