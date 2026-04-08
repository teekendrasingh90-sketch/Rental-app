import { useState, useRef, useEffect } from 'react';
import { Send, Globe, Languages, MoreVertical, Search, ArrowLeft, User, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLanguage, ChatSession, Message, Listing } from '../types';
import { getLandlordResponse } from '../geminiService';
import { cn } from '../lib/utils';

interface ChatViewProps {
  t: any;
  chatSessions: ChatSession[];
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  onSendMessage: (sessionId: string, text: string) => void;
  listings: Listing[];
  isTyping: boolean;
}

export default function ChatView({ t, chatSessions, activeChatId, setActiveChatId, onSendMessage, listings, isTyping }: ChatViewProps) {
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeSession = chatSessions.find(s => s.id === activeChatId);
  const activeListing = listings.find(l => l.id === activeSession?.listingId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeSession?.messages]);

  const handleSend = async () => {
    if (!message.trim() || !activeChatId) return;
    
    const text = message;
    setMessage('');
    onSendMessage(activeChatId, text);
  };

  if (activeChatId && activeSession) {
    return (
      <div className="absolute inset-0 bg-white z-10 flex flex-col pt-16 pb-24">
        {/* Chat Header */}
        <div className="py-4 px-4 flex items-center gap-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <button onClick={() => setActiveChatId(null)} className="p-2 bg-gray-50 rounded-full">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3 flex-1 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold">
              {activeListing?.landlordName[0] || 'L'}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold truncate">{activeListing?.landlordName || 'Landlord'}</h4>
              <p className="text-[10px] text-gray-400 truncate">{activeListing?.title}</p>
            </div>
          </div>
          <button className="p-2">
            <MoreVertical size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {activeSession.messages.map((msg) => (
            <div 
              key={msg.id} 
              className={cn(
                "max-w-[80%] p-4 rounded-3xl text-sm leading-relaxed",
                msg.senderId === 'user123' 
                  ? "ml-auto bg-black text-white rounded-tr-none" 
                  : "bg-white text-gray-800 shadow-sm rounded-tl-none border border-gray-100"
              )}
            >
              {msg.text}
            </div>
          ))}
          {isTyping && (
            <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none w-12 flex gap-1 justify-center">
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={t.typeMessage}
              className="flex-1 px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-black transition-all"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={!message.trim()}
              className="p-4 bg-black text-white rounded-2xl disabled:opacity-50 active:scale-95 transition-transform"
            >
              <Send size={24} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-16 h-screen flex flex-col">
      <div className="px-4 mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-black tracking-tight">{t.messages}</h2>
      </div>

      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder={t.searchChats}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-3">
        {chatSessions.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <MessageCircle size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm font-medium">No messages yet</p>
          </div>
        ) : (
          chatSessions.map((session) => {
            const listing = listings.find(l => l.id === session.listingId);
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setActiveChatId(session.id)}
                className="flex items-center gap-4 p-3 bg-white border border-gray-50 rounded-3xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center font-bold text-white text-xl">
                  {listing?.landlordName[0] || 'L'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className="font-bold truncate">{listing?.landlordName || 'Landlord'}</h4>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      {session.lastTimestamp ? new Date(session.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate font-medium">{session.lastMessage || 'No messages yet'}</p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
