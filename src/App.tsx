import { useState, useEffect } from 'react';
import { Listing, AppLanguage, ChatSession, Message } from './types';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import RenterView from './components/RenterView';
import LandlordView from './components/LandlordView';
import ChatView from './components/ChatView';
import ProfileView from './components/ProfileView';
import ListingDetail from './components/ListingDetail';
import InstallPWA from './components/InstallPWA';
import { AnimatePresence, motion } from 'motion/react';
import { MapPin } from 'lucide-react';
import { translations } from './translations';
import { normalizeLocation } from './utils/locationUtils';
import { getLandlordResponse } from './geminiService';
import { cn } from './lib/utils';

const INITIAL_LISTINGS: Listing[] = [
  {
    id: '1',
    title: 'Modern 1BHK with Balcony',
    description: 'Beautiful 1BHK in the heart of Mumbai. Close to metro station and market.',
    price: 18000,
    location: 'Andheri West, Mumbai',
    images: ['https://picsum.photos/seed/room1/800/600'],
    landlordId: 'landlord1',
    landlordName: 'Rajesh Kumar',
    landlordContact: '+91 98200 12345',
    details: { water: true, garden: false, electricity: true, parking: true },
    createdAt: Date.now(),
  },
  {
    id: '2',
    title: 'Spacious PG for Students',
    description: 'Fully furnished PG with all amenities. Includes food and laundry.',
    price: 8500,
    location: 'Kothrud, Pune',
    images: ['https://picsum.photos/seed/room2/800/600'],
    landlordId: 'landlord2',
    landlordName: 'Sunita Patil',
    landlordContact: '+91 98900 54321',
    details: { water: true, garden: true, electricity: true, parking: false },
    createdAt: Date.now(),
  },
  {
    id: '3',
    title: 'Luxury Flat near Tech Park',
    description: 'High-end flat with premium fittings. Ideal for IT professionals.',
    price: 35000,
    location: 'Whitefield, Bangalore',
    images: ['https://picsum.photos/seed/room3/800/600'],
    landlordId: 'landlord3',
    landlordName: 'Anil Reddy',
    landlordContact: '+91 98450 98765',
    details: { water: true, garden: true, electricity: true, parking: true },
    createdAt: Date.now(),
  },
  {
    id: '4',
    title: 'Cozy Studio in South Delhi',
    description: 'Perfect for solo travelers or students. Well connected to metro.',
    price: 12000,
    location: 'Hauz Khas, Delhi',
    images: ['https://picsum.photos/seed/room4/800/600'],
    landlordId: 'landlord4',
    landlordName: 'Amit Sharma',
    landlordContact: '+91 98111 22233',
    details: { water: true, garden: false, electricity: true, parking: false },
    createdAt: Date.now(),
  },
  {
    id: '5',
    title: 'Modern 2BHK near City Center',
    description: 'Beautiful 2BHK flat with modern amenities. Located in a prime area with easy access to markets and transport.',
    price: 12000,
    location: 'Sector 5, Bhilwara',
    images: ['https://picsum.photos/seed/room5/800/600'],
    landlordId: 'landlord5',
    landlordName: 'Rajesh Kumar',
    landlordContact: '+91 99887 76655',
    details: { water: true, garden: true, electricity: true, parking: true },
    createdAt: Date.now(),
  },
  {
    id: '6',
    title: 'Cozy Studio for Students',
    description: 'Perfect studio apartment for students or working professionals. Quiet neighborhood with all essentials nearby.',
    price: 5000,
    location: 'Shastri Nagar, Bhilwara',
    images: ['https://picsum.photos/seed/room6/800/600'],
    landlordId: 'landlord6',
    landlordName: 'Suresh Meena',
    landlordContact: '+91 91234 56789',
    details: { water: true, garden: false, electricity: true, parking: false },
    createdAt: Date.now(),
  },
  {
    id: '7',
    title: 'Spacious 3BHK Villa',
    description: 'Luxurious 3BHK villa with a private garden and 24/7 security. Ideal for large families.',
    price: 25000,
    location: 'Subhash Nagar, Bhilwara',
    images: ['https://picsum.photos/seed/room7/800/600'],
    landlordId: 'landlord7',
    landlordName: 'Vijay Singh',
    landlordContact: '+91 98765 43210',
    details: { water: true, garden: true, electricity: true, parking: true },
    createdAt: Date.now(),
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'renter' | 'chat' | 'landlord'>('renter');
  const [showProfile, setShowProfile] = useState(false);
  const [selectedArea, setSelectedArea] = useState<string>(() => {
    return localStorage.getItem('dera_selected_area') || 'All';
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<AppLanguage>('English');
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUpdateListing = (updatedListing: Listing) => {
    try {
      const updatedListings = listings.map(l => l.id === updatedListing.id ? updatedListing : l);
      setListings(updatedListings);
      localStorage.setItem('dera_listings', JSON.stringify(updatedListings));
    } catch (error) {
      console.error("Error updating listing:", error);
      setErrorMessage("Error updating listing. Storage might be full.");
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleDeleteListing = (id: string) => {
    const updatedListings = listings.filter(l => l.id !== id);
    setListings(updatedListings);
    localStorage.setItem('dera_listings', JSON.stringify(updatedListings));
  };

  const handleListingClick = (listing: Listing) => {
    setSelectedListing(listing);
    // Increment views
    const updatedListings = listings.map(l => 
      l.id === listing.id ? { ...l, views: (l.views || 0) + 1 } : l
    );
    setListings(updatedListings);
    localStorage.setItem('dera_listings', JSON.stringify(updatedListings));
  };

  const filteredListings = listings.filter(l => {
    if (selectedArea === 'All') return true;
    const area = normalizeLocation(selectedArea).toLowerCase().trim();
    const loc = normalizeLocation(l.location).toLowerCase().trim();
    
    // Check if either is a substring of the other
    if (loc.includes(area) || area.includes(loc)) return true;
    
    // Check for word-level matches
    const areaWords = area.split(/[\s,]+/).filter(w => w.length > 2);
    const locWords = loc.split(/[\s,]+/).filter(w => w.length > 2);
    
    return areaWords.some(aw => locWords.some(lw => lw.includes(aw) || aw.includes(lw)));
  });
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('dera_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('dera_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const t = translations[language];

  const handleSetSelectedArea = (area: string) => {
    setSelectedArea(area);
    localStorage.setItem('dera_selected_area', area);
    if (area !== 'All') {
      setLocationMessage(`Detected: ${area}`);
      setTimeout(() => setLocationMessage(null), 3000);
    }
  };

  // Load from localStorage if available
  useEffect(() => {
    const savedListings = localStorage.getItem('dera_listings');
    if (savedListings) {
      const parsed = JSON.parse(savedListings);
      // Merge: keep saved ones but ensure INITIAL_LISTINGS that aren't in saved are added
      const merged = [...parsed];
      INITIAL_LISTINGS.forEach(initial => {
        if (!merged.find(m => m.id === initial.id)) {
          merged.push(initial);
        }
      });
      setListings(merged);
    }
    const savedLang = localStorage.getItem('dera_lang');
    if (savedLang) {
      setLanguage(savedLang as AppLanguage);
    }
    const savedChats = localStorage.getItem('dera_chats');
    if (savedChats) {
      setChatSessions(JSON.parse(savedChats));
    }

    // Request location on mount (only if not already set)
    if (!localStorage.getItem('dera_selected_area') && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&accept-language=en`
            );
            const data = await response.json();
            const addr = data.address;
            const district = addr.district || addr.city_district || addr.city || addr.town || addr.county;
            const specificArea = addr.suburb || addr.neighbourhood || addr.residential || addr.industrial || addr.commercial || addr.village || addr.hamlet || addr.road || addr.amenity;
            
            if (district) {
              const normalizedDistrict = normalizeLocation(district);
              const finalLocation = specificArea 
                ? `${normalizeLocation(specificArea)}, ${normalizedDistrict}`
                : normalizedDistrict;
              handleSetSelectedArea(finalLocation);
            }
          } catch (error) {
            console.error("Initial reverse geocoding error:", error);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dera_chats', JSON.stringify(chatSessions));
  }, [chatSessions]);

  const handleAddListing = (newListing: Listing) => {
    try {
      const updatedListings = [{ ...newListing, views: 0, clicks: 0 }, ...listings];
      setListings(updatedListings);
      localStorage.setItem('dera_listings', JSON.stringify(updatedListings));
    } catch (error) {
      console.error("Error saving listing:", error);
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        setErrorMessage("Storage full! Go to Profile > Storage Management to clear old listings.");
      } else {
        setErrorMessage("Storage full! Try deleting old listings or using smaller photos.");
      }
      setTimeout(() => setErrorMessage(null), 7000);
    }
  };

  const handleSetLanguage = (lang: AppLanguage) => {
    setLanguage(lang);
    localStorage.setItem('dera_lang', lang);
    setShowProfile(false);
    setActiveTab('renter');
  };

  const handleContactLandlord = (listing: Listing) => {
    setSelectedListing(null);
    setActiveTab('chat');
    
    const existingSession = chatSessions.find(s => s.listingId === listing.id);
    if (existingSession) {
      setActiveChatId(existingSession.id);
    } else {
      const newSession: ChatSession = {
        id: Math.random().toString(36).substr(2, 9),
        participants: ['user123', listing.landlordId],
        listingId: listing.id,
        messages: [],
        lastMessage: '',
        lastTimestamp: Date.now()
      };
      setChatSessions([newSession, ...chatSessions]);
      setActiveChatId(newSession.id);
    }
  };

  const handleSendMessage = async (sessionId: string, text: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (!session) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: 'user123',
      text,
      timestamp: Date.now()
    };

    const updatedSession = {
      ...session,
      messages: [...session.messages, userMsg],
      lastMessage: text,
      lastTimestamp: Date.now()
    };

    setChatSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s));

    const listing = listings.find(l => l.id === session.listingId);
    if (listing) {
      setIsTyping(true);
      const aiResponseText = await getLandlordResponse(listing, updatedSession.messages, text);
      setIsTyping(false);
      
      const aiMsg: Message = {
        id: Math.random().toString(36).substr(2, 9),
        senderId: listing.landlordId,
        text: aiResponseText,
        timestamp: Date.now()
      };

      setChatSessions(prev => prev.map(s => s.id === sessionId ? {
        ...s,
        messages: [...s.messages, aiMsg],
        lastMessage: aiResponseText,
        lastTimestamp: Date.now()
      } : s));
    }
  };

  const handleSetActiveTab = (tab: 'renter' | 'chat' | 'landlord') => {
    setActiveTab(tab);
    setShowProfile(false);
    setSelectedListing(null);
    setActiveChatId(null); // Reset active chat when switching tabs
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <AnimatePresence>
        {locationMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-black text-white px-4 py-2 rounded-full text-[10px] font-black shadow-2xl flex items-center gap-2 border border-white/10"
          >
            <MapPin size={12} className="text-blue-400" />
            {locationMessage.toUpperCase()}
          </motion.div>
        )}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-red-600 text-white px-6 py-3 rounded-2xl text-xs font-black shadow-2xl flex items-center gap-2 border border-red-500"
          >
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            {errorMessage.toUpperCase()}
          </motion.div>
        )}
      </AnimatePresence>

      <Header 
        onProfileClick={() => setShowProfile(!showProfile)} 
        selectedArea={selectedArea}
        onAreaChange={handleSetSelectedArea}
      />

      <main className="max-w-md mx-auto relative min-h-screen">
        <AnimatePresence mode="wait">
          {showProfile ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <ProfileView 
                onBack={() => setShowProfile(false)} 
                language={language}
                setLanguage={handleSetLanguage}
                t={t}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
              />
            </motion.div>
          ) : selectedListing ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <ListingDetail 
                listing={selectedListing} 
                allListings={listings}
                onBack={() => setSelectedListing(null)}
                onChat={handleContactLandlord}
                onListingClick={handleListingClick}
                onUpdateListing={handleUpdateListing}
                t={t}
                isFavorite={favorites.includes(selectedListing.id)}
                onToggleFavorite={toggleFavorite}
              />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'renter' && (
                <RenterView 
                  listings={filteredListings} 
                  t={t} 
                  onListingClick={handleListingClick}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                />
              )}
              {activeTab === 'landlord' && (
                <LandlordView 
                  onAddListing={handleAddListing} 
                  onUpdateListing={handleUpdateListing}
                  onDeleteListing={handleDeleteListing}
                  listings={listings}
                  t={t} 
                />
              )}
              {activeTab === 'chat' && (
                <ChatView 
                  t={t} 
                  chatSessions={chatSessions}
                  activeChatId={activeChatId}
                  setActiveChatId={setActiveChatId}
                  onSendMessage={handleSendMessage}
                  listings={listings}
                  isTyping={isTyping}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={handleSetActiveTab} t={t} />
      <InstallPWA />
    </div>
  );
}
