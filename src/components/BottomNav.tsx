import { Home, MessageCircle, UserCircle, PlusCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface BottomNavProps {
  activeTab: 'renter' | 'chat' | 'landlord';
  setActiveTab: (tab: 'renter' | 'chat' | 'landlord') => void;
  t: any;
}

export default function BottomNav({ activeTab, setActiveTab, t }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex justify-between items-center z-50">
      <button
        onClick={() => setActiveTab('renter')}
        className={cn(
          "flex flex-col items-center gap-1 transition-colors flex-1",
          activeTab === 'renter' ? "text-black" : "text-gray-400"
        )}
      >
        <Home size={28} strokeWidth={activeTab === 'renter' ? 2.5 : 2} />
        <span className="text-[11px] font-bold">{t.renter}</span>
      </button>

      <div className="relative -top-8 px-2">
        <button
          onClick={() => setActiveTab('chat')}
          className={cn(
            "w-16 h-16 rounded-full bg-black flex items-center justify-center shadow-xl transition-transform active:scale-95",
            activeTab === 'chat' ? "ring-4 ring-white" : ""
          )}
        >
          <MessageCircle size={32} color="white" strokeWidth={2} />
        </button>
      </div>

      <button
        onClick={() => setActiveTab('landlord')}
        className={cn(
          "flex flex-col items-center gap-1 transition-colors flex-1",
          activeTab === 'landlord' ? "text-black" : "text-gray-400"
        )}
      >
        <PlusCircle size={28} strokeWidth={activeTab === 'landlord' ? 2.5 : 2} />
        <span className="text-[11px] font-bold">{t.landlord}</span>
      </button>
    </nav>
  );
}
