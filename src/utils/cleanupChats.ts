// Утилита для очистки дублирующихся чатов
// Используйте в консоли браузера: cleanupDuplicateChats()

export function cleanupDuplicateChats() {
  const storage = localStorage.getItem('locals-chat-storage');
  if (!storage) {
    console.log('No chat storage found');
    return;
  }

  const data = JSON.parse(storage);
  const chats = data.state?.chats || [];

  console.log('Total chats before cleanup:', chats.length);

  // Группируем чаты по itemId
  const chatsByItem = new Map<string, any[]>();
  
  chats.forEach((chat: any) => {
    if (chat.itemId && chat.isGroupChat) {
      const existing = chatsByItem.get(chat.itemId) || [];
      existing.push(chat);
      chatsByItem.set(chat.itemId, existing);
    }
  });

  // Находим дубликаты
  const duplicates: string[] = [];
  chatsByItem.forEach((itemChats, itemId) => {
    if (itemChats.length > 1) {
      console.log(`Found ${itemChats.length} chats for item ${itemId}`);
      // Оставляем первый чат, остальные помечаем для удаления
      itemChats.slice(1).forEach(chat => duplicates.push(chat.id));
    }
  });

  if (duplicates.length === 0) {
    console.log('✅ No duplicates found!');
    return;
  }

  // Удаляем дубликаты
  const cleanedChats = chats.filter((chat: any) => !duplicates.includes(chat.id));
  
  data.state.chats = cleanedChats;
  localStorage.setItem('locals-chat-storage', JSON.stringify(data));

  console.log(`✅ Removed ${duplicates.length} duplicate chats`);
  console.log('Total chats after cleanup:', cleanedChats.length);
  console.log('Please refresh the page');
}

// Экспортируем в window для использования в консоли
if (typeof window !== 'undefined') {
  (window as any).cleanupDuplicateChats = cleanupDuplicateChats;
}