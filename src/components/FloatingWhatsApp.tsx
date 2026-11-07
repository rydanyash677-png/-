import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const [isOpenTooltip, setIsOpenTooltip] = useState(true);

  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-col items-start gap-2 select-none">
      {/* Tooltip bubble */}
      {isOpenTooltip && (
        <div className="relative bg-white text-gray-900 text-xs font-bold py-2 px-3.5 rounded-2xl shadow-xl border border-emerald-100 flex items-center gap-2 max-w-xs animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>الصيدلاني متاح للرد الفوري على واتساب! 💬</span>
          <button
            onClick={() => setIsOpenTooltip(false)}
            className="text-gray-400 hover:text-gray-700 ml-1 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="absolute -bottom-1.5 left-5 w-3 h-3 bg-white border-b border-r border-emerald-100 rotate-45"></div>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href="https://wa.me/967770075032?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%20%D9%88%D8%B1%D8%AD%D9%85%D8%A9%20%D8%A7%D9%84%D9%84%D9%87%D8%8C%20%D8%A3%D8%AA%D9%88%D8%A7%D8%B5%D9%84%20%D9%85%D8%B9%20%D8%B5%D9%8A%D8%AF%D9%84%D9%8A%D8%A9%20%D8%B0%D9%88%20%D8%B1%D9%8A%D8%AF%D8%A7%D9%86%20%D9%84%D8%B7%D9%84%D8%A8%20%D8%A7%D8%B3%D8%AA%D8%B4%D8%A7%D8%B1%D8%A9%20%D8%A3%D9%88%20%D8%AF%D9%88%D8%A7%D8%A1."
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-full shadow-lg shadow-emerald-600/40 hover:scale-105 active:scale-95 transition-all"
        title="تحدث مع صيدلية ذو ريدان مباشرة عبر واتساب: +967770075032"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <MessageCircle className="w-5 h-5" />
        <span className="text-xs font-black tracking-wide hidden sm:inline">
          اطلب عبر واتساب
        </span>
      </a>
    </div>
  );
};
