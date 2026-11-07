import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Register service worker if supported
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration skipped:', err);
      });
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showBanner) return null;

  return (
    <div className="bg-emerald-900 text-white px-4 py-2.5 text-xs flex items-center justify-between gap-3 border-b border-emerald-700 shadow-sm text-right">
      <div className="flex items-center gap-2">
        <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          ثبّت تطبيق <strong className="font-bold">صيدلية ذو ريدان</strong> على هاتفك المحمول لطلب الأدوية بسهولة وسرعة وبدون إنترنت!
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstallClick}
          className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-bold flex items-center gap-1 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>تثبيت الآن</span>
        </button>
        <button
          onClick={() => setShowBanner(false)}
          className="text-emerald-300 hover:text-white p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
