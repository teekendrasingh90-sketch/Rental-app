import { useState } from 'react';
import { Search, MapPin, Filter, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Listing } from '@/src/types';
import { cn } from '../lib/utils';

interface RenterViewProps {
  listings: Listing[];
  t: any;
  onListingClick: (listing: Listing) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export default function RenterView({ listings, t, onListingClick, favorites, onToggleFavorite }: RenterViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredListings = listings.filter(l => 
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-24 pt-20 px-4">
      <div className="sticky top-16 bg-white py-4 z-40">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 no-scrollbar">
          {[t.all, '1BHK', '2BHK', 'PG', 'Flat', 'Independent'].map((cat) => (
            <button key={cat} className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium whitespace-nowrap hover:border-black transition-colors">
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2">
        {filteredListings.map((listing) => (
          <motion.div
            key={listing.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group cursor-pointer"
            onClick={() => onListingClick(listing)}
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center">
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onToggleFavorite(listing.id);
                }}
                className={cn(
                  "absolute top-2 right-2 p-1.5 rounded-full shadow-sm transition-all active:scale-90",
                  favorites.includes(listing.id) ? "bg-red-500 text-white" : "bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500"
                )}
              >
                <Heart size={16} fill={favorites.includes(listing.id) ? "currentColor" : "none"} />
              </button>
              <div className="absolute bottom-2 left-2 bg-black text-white px-2 py-0.5 rounded-lg text-[10px] font-bold">
                ₹{listing.price}{t.perMo}
              </div>
            </div>
            
            <div className="mt-2 px-1">
              <h3 className="font-bold text-sm leading-tight truncate">{listing.title}</h3>
              <div className="flex items-center gap-1 text-gray-500 text-[10px] mt-0.5">
                <MapPin size={10} />
                <span className="truncate">{listing.location}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
