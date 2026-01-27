'use client';

import { useEffect } from 'react';
import { cleanupDuplicateChats } from '@/utils/cleanupChats';

// Компонент для инициализации инструментов разработчика
export default function DevTools() {
  useEffect(() => {
    // Экспортируем утилиты в window для использования в консоли
    if (typeof window !== 'undefined') {
      (window as any).cleanupDuplicateChats = cleanupDuplicateChats;
      
      // Показываем подсказку в консоли
      console.log('🛠️ LOCALS Dev Tools available:');
      console.log('  - cleanupDuplicateChats() - Remove duplicate group chats');
    }
  }, []);

  return null; // Ничего не рендерим
}