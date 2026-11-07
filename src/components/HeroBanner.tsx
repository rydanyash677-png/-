import React from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import {
  MessageCircle,
  ShoppingBag,
  FileUp,
  Truck,
  ShieldCheck,
  Clock,
  MapPin,
  Sparkles,
  Award,
} from 'lucide-react';

interface HeroBannerProps {
  onShopNow: () => void;
  onOpenPrescriptionModal: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onShopNow,
  onOpenPrescriptionModal,
}) => {
  const { settings } = usePharmacy();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white rounded-3xl mx-4 my-4 shadow-xl border border-emerald-700/50">
      {/* Decorative background grid and medical circles */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-6 py-10 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-right">
            {/* Pharmacy Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-700/60 border border-emerald-400/40 text-emerald-200 text-xs font-semibold shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>الصيدلية الإلكترونية الأولى في محافظة إب – اليمن</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                {settings.pharmacyNameAr}
              </h2>
              <p className="text-emerald-300 font-sans text-lg sm:text-xl font-bold tracking-wide uppercase">
                {settings.pharmacyNameEn}
              </p>
            </div>

            {/* Slogan & Value Proposition */}
            <p className="text-emerald-100 text-base sm:text-lg font-medium leading-relaxed max-w-2xl">
              <span className="text-white font-bold block mb-1">"{settings.slogan}"</span>
              نوفر لك كافة الأدوية المعتمدة، الفيتامينات، حليب الأطفال والمستلزمات الطبية مع توصيل فوري ومباشر إلى باب منزلك في مدينة إب وكافة المحافظات اليمنية.
            </p>

            {/* Prominent Action Buttons (Required by prompt: "تسوق الآن" & "اطلب عبر واتساب") */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={onShopNow}
                className="px-6 py-3.5 bg-white hover:bg-emerald-50 text-emerald-900 rounded-xl font-black text-sm sm:text-base flex items-center gap-2.5 shadow-lg shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <ShoppingBag className="w-5 h-5 text-emerald-700" />
                <span>تسوق الآن</span>
              </button>

              <a
                href="https://wa.me/967770075032"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <MessageCircle className="w-5 h-5 text-white" />
                <span>اطلب عبر واتساب</span>
              </a>

              <button
                onClick={onOpenPrescriptionModal}
                className="px-5 py-3.5 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 rounded-xl font-bold text-sm flex items-center gap-2 border border-emerald-600/60 transition-all"
              >
                <FileUp className="w-4 h-4 text-emerald-300" />
                <span>صوّر وصفتك الطبية</span>
              </button>
            </div>

            {/* Highlights row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-emerald-700/60 text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-100 font-medium">توصيل سريع داخل إب وخارجها</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-100 font-medium">أدوية ومستلزمات أصلية 100%</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-100 font-medium">صيادلة مرخصون لخدمتكم 24/7</span>
              </div>
            </div>
          </div>

          {/* Quick Prescription & Pharmacy Card */}
          <div className="lg:col-span-5">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl space-y-4 text-right">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-xs font-bold text-emerald-300">الصيدلية المناوبة</span>
                </div>
                <span className="text-[11px] bg-emerald-600/60 px-2.5 py-0.5 rounded-full text-white font-mono">
                  +967 770 075 032
                </span>
              </div>

              <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-600/30 space-y-2">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-sm">موقعنا الميداني في إب:</h4>
                    <p className="text-xs text-emerald-200 leading-relaxed">
                      اليمن – محافظة إب – شارع مفرق ميتم (بالقرب من محطة التقاطع الرئيسية).
                    </p>
                  </div>
                </div>
              </div>

              {/* Prescription fast CTA */}
              <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white space-y-2.5 shadow-md">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>معك وصفة طبية أو روشتة علاجية؟</span>
                </div>
                <p className="text-xs text-emerald-100 leading-normal">
                  ارفع صورة الوصفة مباشرة وسيقوم الصيدلاني بمراجعتها وتجهيز الأدوية والتواصل معك لتأكيد التوصيل.
                </p>
                <button
                  onClick={onOpenPrescriptionModal}
                  className="w-full py-2.5 bg-white text-emerald-900 font-black text-xs rounded-lg hover:bg-emerald-50 transition-colors shadow-xs"
                >
                  رفع الوصفة الطبية الآن ➔
                </button>
              </div>

              {/* Security and drug safety note */}
              <p className="text-[11px] text-emerald-200/80 text-center">
                * تُصرف الأدوية الخاضعة للرقابة والوصفات بمسؤولية طبية كاملة بإشراف صيدلي معتمد.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
