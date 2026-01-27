// Тестовый скрипт для проверки создания топиков в Telegram
// Запуск: node test-telegram-topic.js

const BOT_TOKEN = '8537468832:AAEe00birYJ3I-2JWKzwe43LCj0ViniPUuQ';
const FORUM_CHAT_ID = '-1003836967887'; // BLINK group

async function createTestTopic() {
  console.log('🚀 Создаем тестовый топик в Telegram...\n');
  
  try {
    // 1. Создаем топик
    const createResponse = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/createForumTopic`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: FORUM_CHAT_ID,
          name: '🎉 Тест: Футбол на районе',
          icon_color: 0x6FB9F0, // Blue
        })
      }
    );

    const topicData = await createResponse.json();
    
    if (!topicData.ok) {
      console.error('❌ Ошибка создания топика:', topicData);
      return;
    }

    console.log('✅ Топик создан успешно!');
    console.log('📋 Данные топика:');
    console.log(JSON.stringify(topicData, null, 2));
    
    const messageThreadId = topicData.result.message_thread_id;
    console.log(`\n🆔 Topic ID: ${messageThreadId}`);

    // 2. Отправляем приветственное сообщение в топик
    const messageResponse = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: FORUM_CHAT_ID,
          message_thread_id: messageThreadId,
          text: `🎯 **Тест: Футбол на районе**\n\n🎉 Тестовое событие создано!\n\nОбсуждайте детали и договаривайтесь здесь.\n\n📍 Это сообщение отправлено из тестового скрипта LOCALS.`,
          parse_mode: 'Markdown'
        })
      }
    );

    const messageData = await messageResponse.json();
    
    if (!messageData.ok) {
      console.error('⚠️ Ошибка отправки сообщения:', messageData);
    } else {
      console.log('✅ Приветственное сообщение отправлено!');
    }

    // 3. Формируем ссылку на топик
    const chatIdNumeric = FORUM_CHAT_ID.replace('-100', '');
    const topicLink = `https://t.me/c/${chatIdNumeric}/${messageThreadId}`;
    
    console.log(`\n🔗 Ссылка на топик: ${topicLink}`);
    console.log(`🔗 Публичная ссылка: https://t.me/blinkappchat/${messageThreadId}`);
    
    console.log('\n✨ Откройте Telegram и проверьте группу BLINK!');
    console.log('   Вы должны увидеть новый топик "🎉 Тест: Футбол на районе"');

  } catch (error) {
    console.error('💥 Ошибка:', error);
  }
}

createTestTopic();