import { User, MapPin, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import LocationPicker from './LocationPicker';

interface HeaderProps {
  onProfileClick: () => void;
  selectedArea: string;
  onAreaChange: (area: string) => void;
}

export default function Header({ onProfileClick, selectedArea, onAreaChange }: HeaderProps) {
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg italic">D</span>
            </div>
            <h1 className="font-bold text-xl tracking-tight hidden sm:block">Dera</h1>
          </div>

          <button 
            onClick={() => setShowLocationPicker(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MapPin size={16} className="text-black" />
            <span className="text-sm font-black truncate max-w-[100px]">{selectedArea === 'All' ? 'Select Jila' : selectedArea}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={onProfileClick}
            className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center overflow-hidden hover:bg-gray-50 transition-colors"
          >
            <User size={24} />
          </button>
        </div>
      </header>

      <LocationPicker 
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelect={onAreaChange}
        selectedDistrict={selectedArea}
      />
    </>
  );
}
