import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 3000);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const onClick = (evt: any) => {
    evt.preventDefault();
    if (!promptInstall) return;
    promptInstall.prompt();
    promptInstall.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setShowBanner(false);
    });
  };

  if (!supportsPWA) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-24 left-4 right-4 z-[100] bg-black text-white p-4 rounded-3xl shadow-2xl border border-white/10 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
              <Download size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-black">Install Dera App</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Fast & Offline Access</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClick}
              className="bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-black active:scale-95 transition-transform"
            >
              INSTALL
            </button>
            <button
              onClick={() => setShowBanner(false)}
              className="p-2 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
