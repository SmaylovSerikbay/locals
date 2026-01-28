'use client';

import { Drawer } from 'vaul';
import { useItemsStore } from '@/store/useItemsStore';
import { Calendar, MapPin, DollarSign, Users, MessageCircle, CheckCircle, X } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { useState } from 'react';
import SlideButton from '@/components/ui/SlideButton';
import { useChatStore } from '@/store/useChatStore';

export default function ItemDrawer() {
  const { selectedItem, setSelectedItem, addResponse, updateResponseStatus, completeItem } = useItemsStore();
  const { user } = useUserStore();
  const { openChat, chats } = useChatStore();
  
  const [activeTab, setActiveTab] = useState<'info' | 'responses'>('info');

  const isOpen = !!selectedItem;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedItem(null);
      setActiveTab('info');
    }
  };

  if (!selectedItem) return null;

  const isTask = selectedItem.type === 'TASK';
  const isOwner = user ? String(user.id) === String(selectedItem.author?.id) : false;
  const hasResponded = selectedItem.responses?.some(r => String(r.userId) === String(user?.id));
  const pendingCount = selectedItem.responses?.filter(r => r.status === 'PENDING').length || 0;
  
  // Автор из API: author: { id, username, first_name, last_name, avatar_url, reputation }
  const author = selectedItem.author;
  const authorName = author?.first_name 
    ? `${author.first_name}${author.last_name ? ' ' + author.last_name : ''}` 
    : author?.name || author?.username || 'Unknown';
  const authorAvatar = author?.avatar_url || author?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author?.id}`;
  const authorReputation = author?.reputation || 5.0;

  const handleRespond = async () => {
    if (!user) return;
    await addResponse(selectedItem.id, user.id, 'I can help with this!');
  };

  const handleChat = () => {
    if (!selectedItem) return;
    
    if (isTask) {
      let privateChat = chats.find(
        c => !c.isGroupChat && c.participant?.id === String(selectedItem.author?.id)
      );
      
      if (!privateChat) {
        const { createPrivateChat } = useChatStore.getState();
        privateChat = createPrivateChat(
          String(selectedItem.author?.id),
          authorName,
          authorAvatar,
          selectedItem.id,
          selectedItem.title
        );
      }
      
      setSelectedItem(null);
      openChat(privateChat.id);
    } else {
      let groupChat = chats.find(c => c.itemId === selectedItem.id && c.isGroupChat);
      
      if (!groupChat) {
        const { createGroupChat } = useChatStore.getState();
        groupChat = createGroupChat(selectedItem.id, selectedItem.title, selectedItem.type);
      }
      
      setSelectedItem(null);
      openChat(groupChat.id);
    }
  };

  return (
    <Drawer.Root 
      open={isOpen} 
      onOpenChange={handleOpenChange} 
      shouldScaleBackground
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/50 z-[1000]" />
        <Drawer.Content 
          className="bg-white flex flex-col rounded-t-[32px] fixed bottom-0 left-0 right-0 z-[1001] outline-none shadow-2xl"
          style={{ maxHeight: '90vh' }}
        >
          {/* Drag Handle */}
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-4" />
          
          {/* Header */}
          <div className="px-6 pb-4 border-b border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isTask 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {isTask ? '📦 Task' : '🎉 Event'}
                  </span>
                  {selectedItem.status === 'IN_PROGRESS' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      In Progress
                    </span>
                  )}
                  {selectedItem.status === 'COMPLETED' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                      Completed
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                  {selectedItem.title}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors shrink-0"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Tabs for owner's tasks */}
          {isOwner && isTask && selectedItem.responses && selectedItem.responses.length > 0 && (
            <div className="px-6 pt-4 flex gap-2 border-b border-gray-100">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-4 py-2 rounded-t-xl font-semibold transition-all ${
                  activeTab === 'info'
                    ? 'bg-white text-gray-900 border-b-2 border-black'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Info
              </button>
              <button
                onClick={() => setActiveTab('responses')}
                className={`px-4 py-2 rounded-t-xl font-semibold transition-all relative ${
                  activeTab === 'responses'
                    ? 'bg-white text-gray-900 border-b-2 border-black'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Responses
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Scrollable Content */}
          <div 
            className="flex-1 overflow-y-auto px-6 py-6"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 100px)' }}
          >
            {activeTab === 'info' ? (
              <div className="space-y-6">
                {/* Author Section */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4">
                  <div className="flex items-center gap-4">
                    <img 
                      src={authorAvatar}
                      alt={authorName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                      onError={(e) => {
                        e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${author?.id}`;
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">{authorName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500 text-lg">★</span>
                          <span className="font-semibold text-gray-700">{authorReputation.toFixed(1)}</span>
                        </div>
                        {!isOwner && (
                          <button 
                            onClick={handleChat}
                            className="ml-auto px-4 py-1.5 bg-blue-500 text-white rounded-full text-sm font-semibold hover:bg-blue-600 transition-colors flex items-center gap-1"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Chat
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {isTask && selectedItem.price && (
                    <div className="col-span-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-green-700">
                          <DollarSign className="w-5 h-5" />
                          <span className="font-semibold">Payment</span>
                        </div>
                        <span className="text-2xl font-bold text-green-700">
                          {selectedItem.price} {selectedItem.currency}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {selectedItem.eventDate && (
                    <div className="col-span-2 bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-center gap-2 text-blue-700 mb-1">
                        <Calendar className="w-5 h-5" />
                        <span className="font-semibold text-sm">Date & Time</span>
                      </div>
                      <p className="font-bold text-gray-900">
                        {new Date(selectedItem.eventDate).toLocaleDateString('ru-RU', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <MapPin className="w-5 h-5" />
                      <span className="font-semibold text-sm">Location</span>
                    </div>
                    <p className="font-bold text-gray-900">Nearby</p>
                  </div>

                  {!isTask && (
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                      <div className="flex items-center gap-2 text-purple-700 mb-1">
                        <Users className="w-5 h-5" />
                        <span className="font-semibold text-sm">Going</span>
                      </div>
                      <p className="font-bold text-gray-900">
                        {selectedItem.responses?.filter(r => r.status === 'ACCEPTED').length || 0} people
                      </p>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-3">Description</h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {selectedItem.description}
                  </p>
                </div>
              </div>
            ) : (
              /* Responses Tab */
              <div className="space-y-4">
                {selectedItem.responses && selectedItem.responses.length > 0 ? (
                  selectedItem.responses.map((response) => (
                    <div 
                      key={response.id}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        response.status === 'ACCEPTED' 
                          ? 'bg-green-50 border-green-200' 
                          : response.status === 'REJECTED'
                          ? 'bg-gray-50 border-gray-200 opacity-50'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <img 
                          src={response.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.userId}`}
                          alt={response.userName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-gray-900">{response.userName}</h4>
                            <div className="flex items-center gap-1 text-sm">
                              <span className="text-yellow-500">★</span>
                              <span className="font-semibold">{response.userReputation}</span>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{response.message}</p>
                          
                          {response.status === 'PENDING' && user && (
                            <div className="flex gap-2">
                              <button 
                                onClick={() => updateResponseStatus(response.id, 'ACCEPTED', user.id)}
                                className="flex-1 py-2 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
                              >
                                ✓ Accept
                              </button>
                              <button 
                                onClick={() => updateResponseStatus(response.id, 'REJECTED', user.id)}
                                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                              >
                                ✗ Decline
                              </button>
                            </div>
                          )}
                          
                          {response.status === 'ACCEPTED' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                              <CheckCircle className="w-3 h-3" />
                              Accepted
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No responses yet</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Action Button */}
          {!isOwner && selectedItem.status === 'OPEN' && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pb-safe">
              {isTask ? (
                hasResponded ? (
                  <button 
                    onClick={handleChat}
                    className="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-blue-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-6 h-6" />
                    Open Chat
                  </button>
                ) : (
                  <SlideButton 
                    text="Slide to Respond"
                    onSuccess={handleRespond}
                    className="bg-gradient-to-r from-amber-400 to-orange-400"
                    icon={<span className="text-2xl">👋</span>}
                  />
                )
              ) : (
                <button 
                  onClick={handleChat}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  🎉 Join Event
                </button>
              )}
            </div>
          )}

          {/* Owner Complete Button */}
          {isOwner && selectedItem.status === 'IN_PROGRESS' && user && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pb-safe">
              <SlideButton 
                text="Slide to Complete"
                onSuccess={() => completeItem(selectedItem.id, user.id)}
                className="bg-gradient-to-r from-green-400 to-emerald-400"
                icon={<CheckCircle className="w-6 h-6 text-white" />}
              />
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
