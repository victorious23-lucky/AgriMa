import React, { useState, useRef, useEffect } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import {
  Sparkles,
  Send,
  Bot,
  User as UserIcon,
  RefreshCw,
  Lightbulb,
  TrendingUp,
  ShieldCheck,
  Scale,
  MapPin,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  { label: '🍅 Tomato Prices', prompt: 'What are current wholesale tomato prices across Nairobi, Mombasa, and Nakuru markets?' },
  { label: '🥑 Avocado Export Standards', prompt: 'What are the grading criteria and maturity standards for export-grade Hass avocados?' },
  { label: '💡 Counter-Offer Strategy', prompt: 'How should I formulate a counter-offer when a buyer bids 20% below my farmgate price?' },
  { label: '🛡️ Potato Blight Diagnostic', prompt: 'What is the recommended treatment and spraying schedule for late blight on Irish potatoes?' },
  { label: '🌽 Maize Moisture Limits', prompt: 'What are the maximum moisture content thresholds for commercial dry maize trading in Kenya?' },
  { label: '🚚 Eldoret to Nairobi Transit', prompt: 'What is the average transit duration and logistics considerations for transporting fresh produce from Eldoret to Nairobi?' }
];

export const GeminiAIChatbot: React.FC<{ initialCompact?: boolean; onClose?: () => void }> = ({
  initialCompact = false,
  onClose
}) => {
  const { currentUser, marketPrices, produceList } = useMarketplace();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello ${currentUser ? currentUser.name : 'there'}! 👋\n\nI am **AgriMa AI**, your intelligent agricultural advisor and market pricing specialist. I can assist you with:\n\n* **Live Market Price Intelligence** across Kenyan wholesale markets.\n* **Fair Price & Counter-Offer Guidance** for negotiations.\n* **Agronomic & Pest Management Advice** to protect your crop yields.\n* **Quality Grading & Post-Harvest Standards** (Avocado, Tomato, Maize, Potatoes).\n\nSelect a topic below or type your question!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build lightweight context from active market prices
      const contextSummary = marketPrices.slice(0, 5).map(
        (p) => `${p.crop} in ${p.county} (${p.market || 'Hub'}): Avg KES ${p.averagePrice}/${p.unit} (Trend: ${p.trend})`
      ).join('; ');

      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.sender === 'ai' ? 'model' : 'user',
        text: m.text
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
          userRole: currentUser?.role || 'buyer',
          context: `Top benchmark prices: ${contextSummary}`
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'Analysis completed.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      console.warn('Chat request failed, providing local agricultural response:', err);
      const fallbackAiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `### 🌾 AgriMa Agricultural Intelligence\n\nBased on regional market reports:\n\n* **Price Realism**: Average wholesale produce pricing currently reflects strong seasonal demand in Nairobi and coastal centers.\n* **Escrow Safety**: Always ensure your buyer or seller confirms the transaction through AgriMa's M-Pesa Escrow before dispatch.\n* **Quality Check**: Verify moisture levels, sorting consistency, and packaging hygiene to maximize trade value.\n\nPlease ask any specific question about crop varieties, pesticide control, or transport routes!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackAiReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-emerald-900 text-white p-4 flex items-center justify-between border-b border-emerald-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white">AgriMa AI Advisor</h3>
              <span className="bg-emerald-700/80 text-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-emerald-200">
              Crop Agronomy • Wholesale Benchmarks • Negotiation Strategy
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-800 transition"
          >
            ✕
          </button>
        )}
      </div>

      {/* Quick Prompts Carousel */}
      <div className="bg-stone-50 border-b border-stone-200 p-2.5 overflow-x-auto flex items-center gap-2 no-scrollbar">
        <span className="text-[11px] font-semibold text-stone-500 flex items-center gap-1 shrink-0 pl-1">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          Quick Questions:
        </span>
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp.prompt)}
            disabled={isLoading}
            className="text-xs bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 border border-stone-200 hover:border-emerald-300 px-2.5 py-1 rounded-full whitespace-nowrap transition shadow-2xs font-medium disabled:opacity-50"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50">
        {messages.map((m) => {
          const isAi = m.sender === 'ai';
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-3xl ${isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isAi
                    ? 'bg-emerald-800 text-emerald-200 border border-emerald-600'
                    : 'bg-stone-700 text-white'
                }`}
              >
                {isAi ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`relative group rounded-2xl px-4 py-3 shadow-xs text-sm ${
                  isAi
                    ? 'bg-white text-stone-800 border border-stone-200 rounded-tl-none'
                    : 'bg-emerald-700 text-white rounded-tr-none'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">{m.text}</div>

                <div
                  className={`mt-2 flex items-center justify-between text-[10px] ${
                    isAi ? 'text-stone-400' : 'text-emerald-200'
                  }`}
                >
                  <span>{m.timestamp}</span>

                  {isAi && (
                    <button
                      onClick={() => handleCopy(m.text, m.id)}
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1 hover:text-emerald-700 transition"
                      title="Copy response"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 mr-auto max-w-xl">
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-emerald-200 flex items-center justify-center shrink-0 border border-emerald-600">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-xs flex items-center gap-2 text-stone-500 text-xs">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
              </div>
              <span>AgriMa AI is consulting regional market rates and agronomy logs...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about crop prices, counter-offers, pest control, or logistics..."
          disabled={isLoading}
          className="flex-1 bg-stone-100 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition shadow-xs cursor-pointer text-sm"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};
