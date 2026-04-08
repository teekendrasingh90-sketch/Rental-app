import { User, Phone, Mail, Shield, LogOut, ChevronRight, MapPin, Globe, Check, Moon, Sun, Trash2, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLanguage } from '@/src/types';
import { useState, useEffect } from 'react';

const LANGUAGES: AppLanguage[] = [
  'English', 'Hindi', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Punjabi', 'Malayalam'
];

interface ProfileViewProps {
  onBack: () => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: any;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function ProfileView({ onBack, language, setLanguage, t, isDarkMode, toggleDarkMode }: ProfileViewProps) {
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [storageUsage, setStorageUsage] = useState<string>('0 KB');

  useEffect(() => {
    const calculateStorage = () => {
      let total = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += (localStorage[key].length + key.length) * 2;
        }
      }
      setStorageUsage((total / 1024).toFixed(1) + ' KB');
    };
    calculateStorage();
  }, []);

  const clearAllListings = () => {
    if (window.confirm("Are you sure you want to delete ALL your listings? This cannot be undone.")) {
      localStorage.removeItem('dera_listings');
      window.location.reload();
    }
  };

  return (
    <div className="pb-24 pt-20 px-4 min-h-screen bg-white">
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full border-4 border-black p-1 mb-4">
          <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
            <User size={48} />
          </div>
        </div>
        <h2 className="text-2xl font-black">John Doe</h2>
        <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
          <Phone size={14} />
          <span>+91 98765 43210</span>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-2 mb-2">{t.accountSettings}</h3>
        
        <button 
          onClick={() => setShowLangPicker(!showLangPicker)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gray-100 rounded-xl group-hover:bg-black group-hover:text-white transition-colors">
              <Globe size={20} />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm">{t.language}</p>
              <p className="text-xs text-gray-400">{language}</p>
            </div>
          </div>
          <ChevronRight size={18} className={`text-gray-300 transition-transform ${showLangPicker ? 'rotate-90' : ''}`} />
        </button>

        <AnimatePresence>
          {showLangPicker && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-gray-50 rounded-2xl mx-2 mb-4"
            >
              <div className="p-2 grid grid-cols-2 gap-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      language === lang ? 'bg-black text-white' : 'hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    {lang}
                    {language === lang && <Check size={12} />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {[
          { 
            icon: <User size={20} />, 
            label: t.personalInfo, 
            sub: t.personalInfoSub,
            details: [
              { label: 'Full Name', value: 'John Doe' },
              { label: 'Email', value: 'jaatcj4@gmail.com' },
              { label: 'Phone', value: '+91 98765 43210' },
              { label: 'Location', value: 'Delhi, India' },
              { label: 'Member Since', value: 'April 2026' }
            ]
          },
          { icon: <Shield size={20} />, label: t.security, sub: t.securitySub },
          { 
            icon: isDarkMode ? <Sun size={20} /> : <Moon size={20} />, 
            label: isDarkMode ? 'Light Mode' : 'Dark Mode', 
            sub: isDarkMode ? 'Switch to light theme' : 'Switch to dark theme',
            isToggle: true
          },
          {
            icon: <Database size={20} />,
            label: 'Storage Management',
            sub: `Using ${storageUsage} of browser storage`,
            isStorage: true
          }
        ].map((item, idx) => (
          <div key={idx} className="space-y-2">
            <button 
              onClick={item.isToggle ? toggleDarkMode : undefined}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-100 rounded-xl group-hover:bg-black group-hover:text-white transition-colors">
                  {item.icon}
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.sub}</p>
                </div>
              </div>
              {item.isToggle ? (
                <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-black' : 'bg-gray-200'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-6' : ''}`} />
                </div>
              ) : item.isStorage ? (
                <div className="text-[10px] font-black text-gray-400">{storageUsage}</div>
              ) : (
                <ChevronRight size={18} className="text-gray-300" />
              )}
            </button>
            
            {item.isStorage && (
              <div className="mx-4 p-4 bg-red-50 rounded-2xl space-y-3">
                <p className="text-[10px] text-red-600 font-bold uppercase leading-tight">
                  If you are getting "Storage Quota Exceeded" errors, try clearing your listings.
                </p>
                <button 
                  onClick={clearAllListings}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-xl text-xs font-black shadow-lg active:scale-95 transition-transform"
                >
                  <Trash2 size={14} />
                  CLEAR ALL LISTINGS
                </button>
              </div>
            )}
            
            {item.label === t.personalInfo && (
              <div className="mx-4 p-4 bg-gray-50 rounded-2xl space-y-3">
                {item.details?.map((detail, dIdx) => (
                  <div key={dIdx} className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                    <span className="text-[10px] font-bold uppercase text-gray-400">{detail.label}</span>
                    <span className="text-xs font-bold text-gray-700">{detail.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="pt-6">
          <button className="w-full flex items-center gap-4 p-4 text-red-500 hover:bg-red-50 rounded-2xl transition-colors">
            <div className="p-2 bg-red-50 rounded-xl">
              <LogOut size={20} />
            </div>
            <span className="font-bold text-sm">{t.logout}</span>
          </button>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Dera v1.0.0</p>
      </div>
    </div>
  );
}
