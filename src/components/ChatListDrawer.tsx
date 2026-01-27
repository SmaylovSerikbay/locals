'use client';

import { Drawer } from 'vaul';
import { useChatStore } from '@/store/useChatStore';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Send } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function ChatListDrawer() {
  const { isChatListOpen, setChatListOpen, chats, activeChatId, openChat, closeChat, sendMessage } = useChatStore();
  const t = useTranslations('Chats');
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find(c => c.id === activeChatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  const handleSend = () => {
    if (activeChatId && inputText.trim()) {
        sendMessage(activeChatId, inputText);
        setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSend();
  };

  return (
    <Drawer.Root open={isChatListOpen} onOpenChange={setChatListOpen} shouldScaleBackground>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[1000]" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[20px] h-[85vh] fixed bottom-0 left-0 right-0 z-[1001] outline-none shadow-2xl">
            
            {/* Header */}
            <div className="p-4 bg-white rounded-t-[20px] border-b border-gray-100 flex items-center justify-between z-10 sticky top-0">
                {activeChat ? (
                    <div className="flex items-center gap-3 w-full">
                         <button onClick={closeChat} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                         </button>
                         <div className="flex items-center gap-3">
                            <div className="relative">
                                <img src={activeChat.participant.avatarUrl} className="w-10 h-10 rounded-full bg-gray-200 object-cover" />
                                {activeChat.participant.isOnline && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-base leading-tight">{activeChat.participant.name}</h3>
                                <span className="text-xs text-gray-500">
                                    {activeChat.participant.isOnline ? t('online') : t('offline')}
                                </span>
                            </div>
                         </div>
                    </div>
                ) : (
                    <div className="w-full">
                         <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-200 mb-4" />
                         <h2 className="text-2xl font-bold px-2">{t('title')}</h2>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50/50">
                {!activeChat ? (
                    // Chat List
                    <div className="p-4 space-y-2">
                        {chats.map(chat => (
                            <button 
                                key={chat.id}
                                onClick={() => openChat(chat.id)}
                                className="w-full bg-white p-4 rounded-2xl flex items-center gap-4 hover:bg-gray-50 active:scale-[0.98] transition-all shadow-sm border border-gray-100"
                            >
                                <div className="relative flex-shrink-0">
                                    <img src={chat.participant.avatarUrl} className="w-14 h-14 rounded-full bg-gray-200 object-cover" />
                                    {chat.participant.isOnline && (
                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-[3px] border-white"></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-gray-900 truncate">{chat.participant.name}</h3>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">
                                            {new Date(chat.lastMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">{chat.lastMessage.senderId === 'me' && <span className="text-gray-400">You: </span>}{chat.lastMessage.text}</p>
                                </div>
                                {chat.unreadCount > 0 && (
                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                        {chat.unreadCount}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                ) : (
                    // Active Chat Room
                    <div className="p-4 space-y-4">
                        {activeChat.messages.map((msg, index) => {
                            const isMe = msg.senderId === 'me';
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div 
                                        className={`max-w-[75%] p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                                            isMe 
                                            ? 'bg-blue-500 text-white rounded-tr-none' 
                                            : 'bg-white text-gray-900 rounded-tl-none border border-gray-100'
                                        }`}
                                    >
                                        {msg.text}
                                        <div className={`text-[10px] mt-1 text-right opacity-70 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area (Only in Active Chat) */}
            {activeChat && (
                <div className="p-4 bg-white border-t border-gray-100 pb-8">
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-[2rem] border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <input 
                            className="flex-1 bg-transparent px-4 py-2 outline-none text-base placeholder:text-gray-400"
                            placeholder={t('type_message')}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyPress}
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!inputText.trim()}
                            className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 transition-all active:scale-95 shadow-md"
                        >
                            <Send className="w-5 h-5 ml-0.5" />
                        </button>
                    </div>
                </div>
            )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}