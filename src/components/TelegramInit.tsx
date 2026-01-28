'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useItemsStore } from '@/store/useItemsStore';

export default function TelegramInit() {
  const { syncUserWithAPI } = useUserStore();
  const { subscribeToItems } = useItemsStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initTelegram = async () => {
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
          
          // Sync user with API (upsert)
          await syncUserWithAPI({
            id: tg.initDataUnsafe.user.id,
            username: tg.initDataUnsafe.user.username,
            first_name: tg.initDataUnsafe.user.first_name,
            last_name: tg.initDataUnsafe.user.last_name,
            photo_url: tg.initDataUnsafe.user.photo_url,
            language_code: tg.initDataUnsafe.user.language_code || 'ru',
          });
          
          setIsInitialized(true);
          return;
        }
      }
      
      // Fallback/Mock Data (Only if NOT in Telegram or NO User Data)
      if (!isInitialized) {
        console.log('Running in browser mode (Mock Data) or no user data available');
        
        // Sync mock user with API
        await syncUserWithAPI({
          id: 123456,
          username: 'local_hero',
          first_name: 'Meirzhan (Mock)',
          last_name: 'Developer',
          photo_url: 'https://i.pravatar.cc/300?u=meirzhan',
          language_code: 'ru',
        });
        
        setIsInitialized(true);
      }
    };

    // Small delay to ensure script loads
    const timer = setTimeout(initTelegram, 500);
    return () => clearTimeout(timer);
  }, [syncUserWithAPI, isInitialized]);
  
  // Subscribe to real-time updates
  useEffect(() => {
    if (!isInitialized) return;
    
    console.log('Setting up real-time subscriptions...');
    const unsubscribeItems = subscribeToItems();
    
    return () => {
      console.log('Cleaning up subscriptions...');
      unsubscribeItems();
    };
  }, [isInitialized, subscribeToItems]);

  return null;
}