import React, { useState, useEffect, useRef } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Message, Conversation } from '../../types';
import {
  Send,
  MessageSquare,
  Search,
  User,
  ShoppingBag,
  Package,
  Calendar,
  CheckCheck,
  Sparkles,
  Phone,
  Scale
} from 'lucide-react';
import { NegotiationModal } from '../negotiation/NegotiationModal';

export const ChatView: React.FC = () => {
  const {
    currentUser,
    conversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    sendMessage,
    produceList,
    orders
  } = useMarketplace();

  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];

  // Messages in this conversation
  const activeMessages = messages.filter((m) => {
    if (!activeConv || !currentUser) return false;
    const isSender = m.senderId === currentUser.id && m.receiverId === activeConv.otherUserId;
    const isReceiver = m.senderId === activeConv.otherUserId && m.receiverId === currentUser.id;
    return isSender || isReceiver;
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, activeConversationId]);

  if (!currentUser) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConv) return;

    sendMessage(activeConv.otherUserId, inputMessage, activeConv.produceName, activeConv.orderId);
    setInputMessage('');
  };

  const filteredConversations = conversations.filter((c) => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return true;
    return (
      (c.otherUserName || '').toLowerCase().includes(q) ||
      (c.produceName ? (c.produceName || '').toLowerCase().includes(q) : false)
    );
  });

  const quickPrompts = [
    'Is this produce still available for dispatch this week?',
    'What is the minimum quantity you can pack per bag/crate?',
    'Can we arrange transport or do you have a local collection depot?',
    'Would you accept KES 2,200 per bag if I take 50 bags?'
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
          Direct Messages & Farmer Inquiries
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Communicate directly without middlemen to coordinate harvesting, collection logistics, and prices.
        </p>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden h-[700px] grid grid-cols-1 md:grid-cols-3">
        {/* Left Col: Conversations List */}
        <div className="border-r border-stone-200 flex flex-col h-full bg-stone-50/50">
          {/* Search bar */}
          <div className="p-3.5 border-b border-stone-200 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400">
                No active conversations yet.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === activeConv?.id;
                const unread = conv.unreadCount?.[currentUser.id] || 0;

                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                      isSelected ? 'bg-emerald-50/80 border-l-4 border-emerald-600' : 'hover:bg-stone-100/60'
                    }`}
                  >
                    <img
                      src={conv.otherUserAvatar}
                      alt={conv.otherUserName}
                      className="w-10 h-10 rounded-full object-cover border border-stone-200 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-stone-900 truncate">
                          {conv.otherUserName}
                        </p>
                        <span className="text-[10px] text-stone-400">{conv.lastMessageTime}</span>
                      </div>

                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[9px] uppercase font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                          {conv.otherUserRole}
                        </span>
                        {conv.produceName && (
                          <span className="text-[10px] text-stone-500 truncate">
                            • {conv.produceName}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-stone-500 truncate mt-1">{conv.lastMessage}</p>
                    </div>

                    {unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Cols: Active Chat Room */}
        <div className="md:col-span-2 flex flex-col h-full bg-white">
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
                <div className="flex items-center gap-3">
                  <img
                    src={activeConv.otherUserAvatar}
                    alt={activeConv.otherUserName}
                    className="w-10 h-10 rounded-full object-cover border border-stone-200"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <span>{activeConv.otherUserName}</span>
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-stone-200 text-stone-700">
                        {activeConv.otherUserRole}
                      </span>
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Active conversation • Direct platform contact
                    </p>
                  </div>
                </div>

                {/* Context Badge & AI Advisor Link */}
                <div className="flex items-center gap-2">
                  {activeConv.produceName && (
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                      <Package className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="font-semibold truncate max-w-[150px]">
                        {activeConv.produceName}
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setInputMessage(
                        activeConv.produceName
                          ? `Hello ${activeConv.otherUserName}, is the batch of ${activeConv.produceName} still ready for immediate collection/dispatch?`
                          : `Hello ${activeConv.otherUserName}, what are your best terms for this order?`
                      );
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-100/70 hover:bg-emerald-200/80 text-emerald-800 text-[11px] font-semibold transition cursor-pointer"
                    title="Draft AI Message"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span className="hidden sm:inline">AI Quick Suggest</span>
                  </button>
                </div>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50/20">
                {activeMessages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                          isMe
                            ? 'bg-emerald-700 text-white rounded-br-xs'
                            : 'bg-white border border-stone-200 text-stone-900 rounded-bl-xs'
                        }`}
                      >
                        {msg.produceName && (
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold mb-1 ${
                              isMe ? 'bg-emerald-800 text-emerald-100' : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            Re: {msg.produceName}
                          </span>
                        )}
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                            isMe ? 'text-emerald-200' : 'text-stone-400'
                          }`}
                        >
                          <span>{msg.timestamp.split(' ')[1] || msg.timestamp}</span>
                          {isMe && <CheckCheck className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Bar */}
              <div className="p-2 px-4 bg-stone-50 border-t border-stone-100 overflow-x-auto flex gap-2">
                {quickPrompts.map((qp, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setInputMessage(qp)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-lg text-[10px] font-medium bg-white border border-stone-200 hover:border-emerald-600 hover:text-emerald-700 text-stone-600 transition-colors flex-shrink-0 shadow-2xs"
                  >
                    "{qp}"
                  </button>
                ))}
              </div>

              {/* Message Input Footer */}
              <form
                onSubmit={handleSend}
                className="p-3.5 border-t border-stone-200 bg-white flex items-center gap-2"
              >
                <input
                  id="input-chat-message"
                  type="text"
                  placeholder={`Reply to ${activeConv.otherUserName}...`}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                />

                <button
                  id="btn-send-message"
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="p-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-40 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400">
              <MessageSquare className="w-12 h-12 mb-2 text-stone-300" />
              <p className="text-xs font-semibold">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
