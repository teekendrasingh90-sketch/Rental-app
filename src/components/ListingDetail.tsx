import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, MapPin, MessageCircle, Check, ShieldCheck, Heart, Camera } from 'lucide-react';
import { motion } from 'motion/react';
import { Listing } from '../types';
import { cn } from '../lib/utils';

interface ListingDetailProps {
  listing: Listing;
  allListings: Listing[];
  onBack: () => void;
  onChat: (listing: Listing) => void;
  onListingClick: (listing: Listing) => void;
  onUpdateListing: (listing: Listing) => void;
  t: any;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export default function ListingDetail({ listing, allListings, onBack, onChat, onListingClick, onUpdateListing, t, isFavorite, onToggleFavorite }: ListingDetailProps) {
  const moreListings = allListings.filter(l => l.id !== listing.id).slice(0, 3);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to top when listing changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [listing.id]);
  
  const handleContactClick = () => {
    // Increment clicks
    const updatedListing = { ...listing, clicks: (listing.clicks || 0) + 1 };
    onUpdateListing(updatedListing);
    onChat(listing);
  };

  return (
    <div ref={containerRef} className="pb-[200px] pt-20 px-0 bg-white min-h-screen">
      <div className="fixed top-20 left-4 right-4 z-50 flex justify-between items-center">
        <button 
          onClick={onBack}
          className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-100"
        >
          <ArrowLeft size={24} />
        </button>
        <button 
          onClick={() => onToggleFavorite(listing.id)}
          className={cn(
            "p-2 rounded-full shadow-lg border border-gray-100 transition-all active:scale-90",
            isFavorite ? "bg-red-500 text-white border-red-500" : "bg-white/90 backdrop-blur-sm text-black"
          )}
        >
          <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="relative w-full bg-gray-100">
        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
          {listing.images.map((img, idx) => (
            <div key={idx} className="min-w-full aspect-[4/3] snap-center bg-black flex items-center justify-center">
              <img 
                src={img} 
                alt={`${listing.title} ${idx + 1}`} 
                className="max-w-full max-h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-2">
          <Camera size={12} />
          {listing.images.length}
        </div>
        <div className="absolute bottom-4 right-4 bg-black text-white px-4 py-2 rounded-2xl font-black text-xl shadow-xl">
          ₹{listing.price}{t.perMo}
        </div>
        {/* Carousel Indicators */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {listing.images.map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/50" />
          ))}
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-black leading-tight mb-2">{listing.title}</h2>
          <div className="flex items-center gap-1 text-gray-500">
            <MapPin size={16} />
            <span className="text-sm font-medium">{listing.location}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-3xl">
          <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white font-bold text-xl">
            {listing.landlordName[0]}
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Landlord</p>
            <p className="font-bold">{listing.landlordName}</p>
          </div>
          <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-lg text-[10px] font-bold">
            <ShieldCheck size={12} />
            VERIFIED
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-black text-lg uppercase tracking-tight">{t.description}</h3>
          <p className="text-gray-600 leading-relaxed text-sm">
            {listing.description || "No description provided."}
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-black text-lg uppercase tracking-tight">{t.facilities}</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(listing.details).map(([key, value]) => (
              value && (
                <div key={key} className="flex items-center gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                    <Check size={14} color="white" />
                  </div>
                  <span className="text-xs font-bold capitalize">{key}</span>
                </div>
              )
            ))}
          </div>
        </div>

        <div className="pt-8 pb-12">
          <button 
            onClick={handleContactClick}
            className="w-full py-5 bg-black text-white rounded-3xl font-black text-xl shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
          >
            <MessageCircle size={28} />
            {t.contactLandlord}
          </button>
        </div>

        {/* More Rooms Section */}
        <div className="pt-10 border-t border-gray-100">
          <h3 className="font-black text-xl uppercase tracking-tight mb-6">More Rooms for You</h3>
          <div className="space-y-4">
            {moreListings.map(l => (
              <div 
                key={l.id} 
                onClick={() => onListingClick(l)}
                className="flex gap-4 p-3 bg-white border border-gray-100 rounded-3xl shadow-sm active:scale-95 transition-transform"
              >
                <div className="w-24 h-24 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden">
                  <img src={l.images[0]} className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="font-bold truncate">{l.title}</h4>
                  <p className="text-xs text-gray-400 font-medium mb-2">{l.location}</p>
                  <p className="text-lg font-black">₹{l.price}{t.perMo}</p>
                </div>
              </div>
            ))}
            <p className="text-center text-xs text-gray-400 font-bold uppercase tracking-widest pt-4">End of results</p>
          </div>
        </div>
      </div>
    </div>
  );
}
