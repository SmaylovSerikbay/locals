'use client';

import { Drawer } from 'vaul';
import { useChatStore } from '@/store/useChatStore';
import { useUserStore } from '@/store/useUserStore';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Send, ExternalLink, MessageCircle, MoreVertical } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatListDrawer() {
  const { isChatListOpen, setChatListOpen, chats, activeChatId, openChat, closeChat, sendMessage } = useChatStore();
  const { user } = useUserStore();
  const t = useTranslations('Chats');
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find(c => c.id === activeChatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeChat) {
        scrollToBottom();
    }
  }, [activeChat?.messages, activeChatId]);

  const handleSend = async () => {
    if (activeChatId && inputText.trim() && activeChat?.itemId && user) {
        await sendMessage(activeChat.itemId, user.id, inputText);
        setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSend();
  };

  return (
    <Drawer.Root open={isChatListOpen} onOpenChange={setChatListOpen} shouldScaleBackground>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[1000] backdrop-blur-sm" />
        <Drawer.Content className="bg-[#F2F2F7] flex flex-col rounded-t-[32px] h-[92vh] fixed bottom-0 left-0 right-0 z-[1001] outline-none shadow-2xl overflow-hidden">
            
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mt-3 mb-2 z-20" />

            {/* Header Area */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 z-10 sticky top-0 px-4 py-3">
                {activeChat ? (
                    <div className="flex items-center gap-3 w-full">
                         <button 
                            onClick={closeChat} 
                            className="w-10 h-10 -ml-2 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors active:scale-90"
                         >
                            <ArrowLeft className="w-6 h-6 text-gray-900" />
                         </button>
                         <div className="flex-1 flex items-center gap-3 overflow-hidden">
                            <div className="relative flex-shrink-0">
                                <img 
                                    src={activeChat.isGroupChat ? activeChat.groupInfo?.avatarUrl : activeChat.participant?.avatarUrl} 
                                    className="w-10 h-10 rounded-full bg-gray-200 object-cover border border-gray-100" 
                                />
                                {!activeChat.isGroupChat && activeChat.participant?.isOnline && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-gray-900 leading-tight truncate">
                                    {activeChat.isGroupChat ? activeChat.groupInfo?.name : activeChat.participant?.name}
                                </h3>
                                <span className="text-xs text-gray-500 font-medium truncate block">
                                    {activeChat.isGroupChat 
                                        ? `${activeChat.groupInfo?.participantCount} members`
                                        : (activeChat.participant?.isOnline ? t('online') : t('offline'))
                                    }
                                </span>
                            </div>
                         </div>
                         <button className="w-10 h-10 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors">
                             <MoreVertical className="w-5 h-5 text-gray-600" />
                         </button>
                    </div>
                ) : (
                    <div className="w-full flex items-center justify-between pb-2 pt-2">
                         <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t('title')}</h2>
                         <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                            <MessageCircle className="w-5 h-5 text-gray-600" />
                         </button>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-[#F2F2F7] relative">
                {!activeChat ? (
                    // Chat List View
                    <div className="p-4 space-y-3">
                        {chats.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center opacity-60">
                                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                                    <MessageCircle className="w-10 h-10 text-gray-400" />
                                </div>
                                <p className="font-bold text-gray-900 text-lg">No messages yet</p>
                                <p className="text-sm text-gray-500">Start a conversation from map!</p>
                            </div>
                        ) : (
                            chats.map((chat, i) => (
                                <motion.button 
                                    key={chat.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => openChat(chat.id)}
                                    className="w-full bg-white p-4 rounded-[24px] flex items-center gap-4 hover:bg-white active:scale-[0.98] transition-all shadow-sm border border-transparent hover:border-gray-200 group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    
                                    <div className="relative flex-shrink-0 z-10">
                                        <img 
                                            src={chat.isGroupChat ? chat.groupInfo?.avatarUrl : chat.participant?.avatarUrl} 
                                            className="w-14 h-14 rounded-[20px] bg-gray-100 object-cover shadow-sm" 
                                        />
                                        {!chat.isGroupChat && chat.participant?.isOnline && (
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-[3px] border-white z-10"></div>
                                        )}
                                        {chat.isGroupChat && (
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white z-10">
                                                {chat.groupInfo?.participantCount}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 text-left z-10">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-bold text-gray-900 text-lg truncate pr-2">
                                                {chat.isGroupChat ? chat.groupInfo?.name : chat.participant?.name}
                                            </h3>
                                            <span className="text-xs font-bold text-gray-400 whitespace-nowrap bg-gray-50 px-2 py-1 rounded-full">
                                                {new Date(chat.lastMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                        <p className="text-[15px] text-gray-500 truncate font-medium leading-normal">
                                            {chat.lastMessage.senderId === 'me' && <span className="text-black font-bold">You: </span>}
                                            {chat.lastMessage.text}
                                        </p>
                                    </div>
                                    {chat.unreadCount > 0 && (
                                        <div className="absolute top-4 right-4 z-20">
                                            <div className="h-3 w-3 bg-[#5D5FEF] rounded-full ring-4 ring-[#5D5FEF]/20 animate-pulse"></div>
                                        </div>
                                    )}
                                </motion.button>
                            ))
                        )}
                    </div>
                ) : (
                    // Active Chat Room View
                    <div className="p-4 space-y-6 pb-4">
                        {/* Date Divider (Mock) */}
                        <div className="flex justify-center">
                            <span className="bg-gray-200/50 text-gray-500 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-sm">
                                Today
                            </span>
                        </div>

                        {activeChat.messages.map((msg, index) => {
                            const isMe = msg.senderId === 'me';
                            const isSystem = msg.senderId === 'system';
                            const showAvatar = !isMe && !isSystem && (index === 0 || activeChat.messages[index - 1].senderId !== msg.senderId);
                            
                            if (isSystem) {
                                return (
                                    <div key={msg.id} className="flex justify-center my-4">
                                        <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-xl text-xs font-medium border border-gray-200 shadow-sm max-w-[80%] text-center">
                                            {msg.text}
                                        </div>
                                    </div>
                                );
                            }
                            
                            return (
                                <motion.div 
                                    key={msg.id} 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    {!isMe && (
                                        <div className="w-8 flex-shrink-0">
                                            {showAvatar && (
                                                <img 
                                                    src={activeChat.isGroupChat ? activeChat.groupInfo?.avatarUrl : activeChat.participant?.avatarUrl} 
                                                    className="w-8 h-8 rounded-full bg-gray-200 object-cover border border-white shadow-sm"
                                                />
                                            )}
                                        </div>
                                    )}
                                    
                                    <div 
                                        className={`max-w-[75%] px-4 py-3 text-[16px] leading-relaxed shadow-sm relative group ${
                                            isMe 
                                            ? 'bg-black text-white rounded-[20px] rounded-br-sm' 
                                            : 'bg-white text-gray-900 rounded-[20px] rounded-bl-sm border border-gray-100'
                                        }`}
                                    >
                                        {msg.text}
                                        <div className={`text-[10px] mt-1 text-right font-medium opacity-60 ${isMe ? 'text-gray-300' : 'text-gray-400'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                        <div ref={messagesEndRef} className="h-2" />
                    </div>
                )}
            </div>

            {/* Input Area (Only in Active Chat) */}
            {activeChat && (
                <div className="p-3 bg-white border-t border-gray-100 pb-8 sticky bottom-0 z-20">
                    {/* Telegram Link Banner */}
                    {activeChat.isGroupChat && activeChat.telegramGroupLink && (
                        <motion.a 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            href={activeChat.telegramGroupLink}
                            className="flex items-center justify-center gap-2 bg-[#F0F2FF] text-[#5D5FEF] px-4 py-2 rounded-xl font-bold text-sm mb-3 hover:bg-[#E5E7FF] transition-colors border border-[#5D5FEF]/20"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Open in Telegram
                        </motion.a>
                    )}
                    
                    <div className="flex items-end gap-2 bg-[#F2F2F7] p-1.5 rounded-[28px] border border-transparent focus-within:border-black/10 focus-within:bg-white focus-within:shadow-lg transition-all">
                        <textarea 
                            className="flex-1 bg-transparent px-4 py-3 outline-none text-base placeholder:text-gray-400 min-h-[48px] max-h-[120px] resize-none text-gray-900 font-medium no-scrollbar"
                            placeholder={t('type_message')}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyPress}
                            rows={1}
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!inputText.trim()}
                            className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg shadow-black/20 mb-[1px] mr-[1px]"
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