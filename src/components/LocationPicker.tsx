import React, { useState } from 'react';
import { X, MapPin, Navigation, Search, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { normalizeLocation } from '../utils/locationUtils';

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (district: string) => void;
  selectedDistrict: string;
}

// Representative list of major Indian districts (Jila)
const DISTRICTS = [
  'Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 
  'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 
  'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad',
  'Ludhiana', 'Coimbatore', 'Agra', 'Madurai', 'Nashik', 'Faridabad', 'Meerut',
  'Rajkot', 'Kalyan-Dombivli', 'Vasai-Virar', 'Varanasi', 'Srinagar', 'Aurangabad',
  'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Ranchi', 'Howrah', 'Jabalpur',
  'Gwalior', 'Vijayawada', 'Jodhpur', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh',
  'Solapur', 'Hubli-Dharwad', 'Bareilly', 'Moradabad', 'Mysore', 'Gurgaon', 'Aligarh',
  'Jalandhar', 'Tiruchirappalli', 'Bhubaneswar', 'Salem', 'Warangal', 'Mira-Bhayandar',
  'Thiruvananthapuram', 'Bhiwandi', 'Saharanpur', 'Guntur', 'Amravati', 'Bikaner',
  'Noida', 'Jamshedpur', 'Bhilai', 'Cuttack', 'Firozabad', 'Kochi', 'Nellore',
  'Bhavnagar', 'Dehradun', 'Durgapur', 'Asansol', 'Rourkela', 'Nanded', 'Kolhapur',
  'Ajmer', 'Akola', 'Gulbarga', 'Jamnagar', 'Ujjain', 'Loni', 'Siliguri', 'Jhansi',
  'Ulhasnagar', 'Jammu', 'Sangli-Miraj & Kupwad', 'Belgaum', 'Mangalore',
  'Ambattur', 'Tirunelveli', 'Malegaon', 'Gaya', 'Jalgaon', 'Udaipur', 'Maheshtala',
  'Bhilwara'
].sort();

export default function LocationPicker({ isOpen, onClose, onSelect, selectedDistrict }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [permissionError, setPermissionError] = useState(false);

  const filteredDistricts = DISTRICTS.filter(d => 
    d.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDetectLocation = async () => {
    setIsDetecting(true);
    setPermissionError(false);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&accept-language=en`,
              { signal: controller.signal }
            );
            clearTimeout(timeoutId);
            const data = await response.json();
            
            const addr = data.address;
            if (!addr) {
              alert("Could not determine your district. Please select manually.");
              return;
            }
            
            const district = addr.district || addr.city_district || addr.city || addr.town || addr.county;
            const specificArea = addr.suburb || addr.neighbourhood || addr.residential || addr.industrial || addr.commercial || addr.village || addr.hamlet || addr.road || addr.amenity;
            
            if (district) {
              // Try to find the closest match in our DISTRICTS list or just use the detected name
              const matchedDistrict = DISTRICTS.find(d => 
                district.toLowerCase().includes(d.toLowerCase()) || 
                d.toLowerCase().includes(district.toLowerCase())
              ) || district;

              const normalizedDistrict = normalizeLocation(matchedDistrict);
              
              // If we have a specific area, combine it with the district for a more precise filter
              const finalLocation = specificArea 
                ? `${normalizeLocation(specificArea)}, ${normalizedDistrict}`
                : normalizedDistrict;

              onSelect(finalLocation);
              onClose();
            } else {
              alert("Could not determine your district. Please select manually.");
            }
          } catch (error) {
            console.error("Reverse geocoding error:", error);
            alert("Error detecting your district. Please select manually.");
          } finally {
            setIsDetecting(false);
          }
        },
        (error) => {
          setIsDetecting(false);
          console.error("Geolocation error:", error);
          if (error.code === error.PERMISSION_DENIED) {
            setPermissionError(true);
          } else {
            alert("Could not detect location. Please select manually.");
          }
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setIsDetecting(false);
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 bg-white z-[100] flex flex-col"
        >
          {/* Header */}
          <div className="pt-12 pb-4 px-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
              </button>
              <h2 className="text-xl font-black tracking-tight">Select District</h2>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search district (jila)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-black outline-none font-bold text-sm"
              />
            </div>
          </div>

          {/* Current Location Button */}
          <div className="px-4 pb-4">
            {permissionError ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-red-50 border border-red-100 rounded-2xl mb-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                    <Navigation size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-sm text-red-900">Location Access Blocked</p>
                    <p className="text-xs text-red-700 mt-1 leading-relaxed">
                      You've denied location access. Please enable it in your browser settings (click the lock icon in the URL bar) and try again.
                    </p>
                    <button 
                      onClick={handleDetectLocation}
                      className="mt-3 text-xs font-black uppercase tracking-widest text-red-900 underline"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <button
                onClick={handleDetectLocation}
                disabled={isDetecting}
                className="w-full flex items-center justify-between p-5 bg-black text-white rounded-2xl shadow-xl active:scale-95 transition-transform disabled:opacity-70"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Navigation size={20} className={isDetecting ? 'animate-pulse' : ''} />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-sm">{isDetecting ? 'Detecting Area & District...' : 'Use Current Location'}</p>
                    <p className="text-[10px] text-white/60 uppercase font-bold tracking-widest">Detects your district & sector automatically</p>
                  </div>
                </div>
                {!isDetecting && <ChevronRight size={20} className="text-white/40" />}
              </button>
            )}
          </div>

          {/* District List */}
          <div className="flex-1 overflow-y-auto px-4 pb-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 px-2">Popular Districts</h3>
            <div className="space-y-1">
              {/* Use Search Query as Location */}
              {searchQuery && !filteredDistricts.includes(searchQuery) && (
                <button
                  onClick={() => { onSelect(normalizeLocation(searchQuery)); onClose(); }}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-black/5 hover:bg-black/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                      <MapPin size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Use custom location</p>
                      <p className="font-bold text-sm">{searchQuery}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-300" />
                </button>
              )}

              <button
                onClick={() => { onSelect('All'); onClose(); }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-colors ${
                  selectedDistrict === 'All' ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                    <MapPin size={16} />
                  </div>
                  <span className="font-bold text-sm">All India</span>
                </div>
                {selectedDistrict === 'All' && <div className="w-2 h-2 rounded-full bg-black" />}
              </button>

              {filteredDistricts.map((district) => (
                <button
                  key={district}
                  onClick={() => { onSelect(district); onClose(); }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-colors ${
                    selectedDistrict === district ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      selectedDistrict === district ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <MapPin size={16} />
                    </div>
                    <span className="font-bold text-sm">{district}</span>
                  </div>
                  {selectedDistrict === district && <div className="w-2 h-2 rounded-full bg-black" />}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
