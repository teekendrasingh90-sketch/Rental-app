import React, { useState, useRef } from 'react';
import { 
  Camera, Plus, X, Check, Home, ChevronRight, MessageCircle, 
  ArrowLeft, MapPin, Loader2, MoreVertical, Edit, Trash2, 
  BarChart2, Eye, MousePointer2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Listing } from '../types';
import { normalizeLocation } from '../utils/locationUtils';
import { compressImage } from '../utils/imageUtils';

interface LandlordViewProps {
  onAddListing: (listing: Listing) => void;
  onUpdateListing: (listing: Listing) => void;
  onDeleteListing: (id: string) => void;
  listings: Listing[];
  t: any;
}

export default function LandlordView({ onAddListing, onUpdateListing, onDeleteListing, listings, t }: LandlordViewProps) {
  const [view, setView] = useState<'dashboard' | 'upload' | 'myListings'>('dashboard');
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [showMenuId, setShowMenuId] = useState<string | null>(null);
  
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState({
    water: false,
    garden: false,
    electricity: true,
    parking: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const myOwnListings = listings.filter(l => l.landlordId === 'user123'); // Mock current user

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setIsProcessingImages(true);
      try {
        for (let i = 0; i < files.length && images.length + i < 5; i++) {
          const file = files[i];
          // Even with compression, we should limit initial file size to avoid browser hang
          if (file.size > 5 * 1024 * 1024) { 
            setError("Each photo must be less than 5MB");
            setTimeout(() => setError(null), 3000);
            continue;
          }
          
          try {
            const compressed = await compressImage(file, 800, 0.6);
            setImages(prev => [...prev, compressed].slice(0, 5));
          } catch (err) {
            console.error("Compression error:", err);
            setError("Failed to process image");
            setTimeout(() => setError(null), 3000);
          }
        }
      } finally {
        setIsProcessingImages(false);
      }
    }
  };

  const handleDetectLocation = () => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by your browser");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=en`
          );
          const data = await response.json();
          const addr = data.address;
          
          // Construct a detailed address with nearby places
          const parts = [];
          
          // Most specific location info
          const specific = addr.suburb || addr.neighbourhood || addr.residential || addr.industrial || addr.commercial || addr.village || addr.hamlet || addr.road || addr.amenity;
          if (specific) parts.push(specific);
          
          // District/City info
          const district = addr.district || addr.city_district || addr.city || addr.town || addr.county;
          if (district) parts.push(district);
          
          const finalAddr = parts.join(', ');
          if (finalAddr) {
            setLocation(finalAddr);
          } else {
            // Fallback to display name if parts are missing
            setLocation(data.display_name.split(',').slice(0, 2).join(',').trim());
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          setError("Failed to get address. Please enter manually.");
          setTimeout(() => setError(null), 3000);
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setError("Location access denied. Please enter manually.");
        setTimeout(() => setError(null), 3000);
        setIsDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !location) {
      setError("Please fill all required fields");
      setTimeout(() => setError(null), 3000);
      return;
    }
    if (images.length === 0) {
      setError("Please add at least one photo");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const parsedPrice = parseInt(price);
    if (isNaN(parsedPrice)) {
      setError("Please enter a valid price");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (editingListingId) {
      const existing = listings.find(l => l.id === editingListingId);
      if (existing) {
        const updatedListing: Listing = {
          ...existing,
          title,
          description,
          price: parsedPrice,
          location: normalizeLocation(location),
          images,
          details,
        };
        onUpdateListing(updatedListing);
      }
    } else {
      const newListing: Listing = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        description,
        price: parsedPrice,
        location: normalizeLocation(location),
        images,
        landlordId: 'user123',
        landlordName: 'John Doe',
        landlordContact: '+91 9876543210',
        details,
        createdAt: Date.now(),
        views: 0,
        clicks: 0,
      };
      onAddListing(newListing);
    }

    // Reset form
    setTitle('');
    setPrice('');
    setLocation('');
    setDescription('');
    setImages([]);
    setDetails({ water: false, garden: false, electricity: true, parking: false });
    setEditingListingId(null);
    setView('dashboard');
  };

  const handleEdit = (listing: Listing) => {
    setEditingListingId(listing.id);
    setTitle(listing.title);
    setPrice(listing.price.toString());
    setLocation(listing.location);
    setDescription(listing.description);
    setImages(listing.images);
    setDetails({
      water: listing.details.water,
      garden: listing.details.garden,
      electricity: listing.details.electricity,
      parking: listing.details.parking,
    });
    setView('upload');
    setShowMenuId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      onDeleteListing(id);
      setShowMenuId(null);
    }
  };

  if (view === 'dashboard') {
    return (
      <div className="pb-40 pt-20 px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-black tracking-tight">{t.myDashboard}</h2>
          <p className="text-gray-500 text-sm">Manage your properties</p>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
              {error.toUpperCase()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Form Integrated into Dashboard */}
        <div className="mb-10 bg-gray-50 p-6 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center text-white">
              <Plus size={20} />
            </div>
            <h3 className="text-xl font-black tracking-tight">{t.postAd}</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Section */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">{t.photos}</label>
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
                    <img src={img} alt="upload" className="max-w-full max-h-full object-contain" />
                    <button 
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-black text-white rounded-full"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <button
                    type="button"
                    disabled={isProcessingImages}
                    onClick={() => fileInputRef.current?.click()}
                    className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                      isProcessingImages 
                        ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' 
                        : 'border-gray-200 text-gray-400 hover:border-black hover:text-black'
                    }`}
                  >
                    {isProcessingImages ? (
                      <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        <Camera size={24} />
                        <span className="text-[10px] mt-1 font-bold">{t.add}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                multiple 
                accept="image/*" 
              />
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-400">{t.title}</label>
                <input
                  type="text"
                  placeholder={t.titlePlaceholder}
                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-black outline-none text-sm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">{t.price}</label>
                  <input
                    type="number"
                    placeholder="15000"
                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-black outline-none text-sm"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">{t.location}</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t.locationPlaceholder}
                      className="w-full pl-4 pr-10 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-black outline-none text-sm"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isDetectingLocation}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
                        isDetectingLocation ? 'text-blue-500' : 'text-gray-400 hover:text-black hover:bg-gray-100'
                      }`}
                    >
                      {isDetectingLocation ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <MapPin size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-400">{t.description}</label>
                <textarea
                  placeholder={t.descPlaceholder}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-black outline-none resize-none text-sm"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Amenities Section */}
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase text-gray-400">{t.amenities}</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'water', label: t.waterFacility },
                  { id: 'garden', label: t.gardenFacility },
                  { id: 'electricity', label: t.electricity },
                  { id: 'parking', label: t.parkingFacility },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDetails(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof prev] }))}
                    className={`flex items-center justify-between px-4 py-4 rounded-2xl border transition-all active:scale-95 ${
                      details[item.id as keyof typeof details] 
                        ? 'bg-black border-black text-white shadow-lg' 
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    <span className="text-sm font-black">{item.label}</span>
                    {details[item.id as keyof typeof details] && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-black text-white rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-transform uppercase tracking-tight"
            >
              {t.publish}
            </button>
          </form>
        </div>

        {/* Dashboard Options */}
        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => setView('myListings')}
            className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-[32px] shadow-sm group active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-black">
                <Home size={24} />
              </div>
              <div className="text-left">
                <p className="font-black text-lg">{t.activeListings}</p>
                <p className="text-xs text-gray-400">{myOwnListings.length} rooms listed</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-300" />
          </button>
        </div>
      </div>
    );
  }

  if (view === 'myListings') {
    return (
      <div className="pb-24 pt-20 px-4">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setView('dashboard')} className="p-2 bg-gray-100 rounded-full">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-black tracking-tight">{t.activeListings}</h2>
        </div>

        <div className="space-y-4">
          {myOwnListings.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>{t.noListings}</p>
            </div>
          ) : (
            myOwnListings.map(listing => (
              <div key={listing.id} className="relative bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                <div className="flex gap-4 p-4">
                  <div className="w-24 h-24 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                    <img src={listing.images[0]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <h4 className="font-black text-lg truncate">{listing.title}</h4>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin size={10} />
                      {listing.location}
                    </p>
                    <p className="text-lg font-black mt-1 text-black">₹{listing.price}<span className="text-[10px] text-gray-400 font-bold">/MO</span></p>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1 text-blue-500">
                        <Eye size={12} />
                        <span className="text-[10px] font-black">{listing.views || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-500">
                        <MousePointer2 size={12} />
                        <span className="text-[10px] font-black">{listing.clicks || 0}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowMenuId(showMenuId === listing.id ? null : listing.id)}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-50 rounded-full transition-colors"
                  >
                    <MoreVertical size={20} className="text-gray-400" />
                  </button>

                  <AnimatePresence>
                    {showMenuId === listing.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute top-14 right-4 z-10 bg-white border border-gray-100 rounded-2xl shadow-2xl p-2 min-w-[140px]"
                      >
                        <button 
                          onClick={() => handleEdit(listing)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl text-sm font-bold transition-colors"
                        >
                          <Edit size={16} className="text-blue-500" />
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(listing.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl text-sm font-bold text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="bg-gray-50/50 px-6 py-3 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart2 size={14} className="text-gray-400" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Performance</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black text-green-600 uppercase">Active</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-40 pt-20 px-4">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => {
          setView('dashboard');
          setEditingListingId(null);
          setTitle('');
          setPrice('');
          setLocation('');
          setDescription('');
          setImages([]);
          setDetails({ water: false, garden: false, electricity: true, parking: false });
        }} className="p-2 bg-gray-100 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-black tracking-tight">{editingListingId ? 'Edit Listing' : t.postAd}</h2>
          <p className="text-gray-500 text-sm">{editingListingId ? 'Update your property details' : t.postAdSub}</p>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2"
          >
            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
            {error.toUpperCase()}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Section */}
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-gray-400">{t.photos}</label>
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
                <img src={img} alt="upload" className="max-w-full max-h-full object-contain" />
                <button 
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 p-1 bg-black text-white rounded-full"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <button
                type="button"
                disabled={isProcessingImages}
                onClick={() => fileInputRef.current?.click()}
                className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                  isProcessingImages 
                    ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' 
                    : 'border-gray-200 text-gray-400 hover:border-black hover:text-black'
                }`}
              >
                {isProcessingImages ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Camera size={24} />
                    <span className="text-[10px] mt-1 font-bold">{t.add}</span>
                  </>
                )}
              </button>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden" 
            multiple 
            accept="image/*" 
          />
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-400">{t.title}</label>
            <input
              type="text"
              placeholder={t.titlePlaceholder}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-400">{t.price}</label>
              <input
                type="number"
                placeholder="15000"
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black outline-none"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-400">{t.location}</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={t.locationPlaceholder}
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black outline-none"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
                    isDetectingLocation ? 'text-blue-500' : 'text-gray-400 hover:text-black hover:bg-gray-100'
                  }`}
                  title="Detect my location"
                >
                  {isDetectingLocation ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <MapPin size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-400">{t.description}</label>
            <textarea
              placeholder={t.descPlaceholder}
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black outline-none resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Amenities Section */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase text-gray-400">{t.amenities}</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'water', label: t.waterFacility },
              { id: 'garden', label: t.gardenFacility },
              { id: 'electricity', label: t.electricity },
              { id: 'parking', label: t.parkingFacility },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setDetails(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof prev] }))}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                  details[item.id as keyof typeof details] 
                    ? 'bg-black border-black text-white' 
                    : 'bg-white border-gray-100 text-gray-500'
                }`}
              >
                <span className="text-sm font-medium">{item.label}</span>
                {details[item.id as keyof typeof details] && <Check size={16} />}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-black text-white rounded-2xl font-bold text-lg shadow-xl active:scale-95 transition-transform"
        >
          {editingListingId ? 'UPDATE LISTING' : t.publish}
        </button>
      </form>
    </div>
  );
}
