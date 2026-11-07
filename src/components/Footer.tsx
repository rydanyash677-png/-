import React from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import {
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  ShieldCheck,
  HeartHandshake,
  Truck,
  AlertTriangle,
  Stethoscope,
} from 'lucide-react';

export const Footer: React.FC<{
  onOpenPrescriptionModal: () => void;
  onOpenOrdersModal: () => void;
}> = ({ onOpenPrescriptionModal, onOpenOrdersModal }) => {
  const { settings, categories, setSelectedCategory } = usePharmacy();

  return (
    <footer className="bg-gradient-to-b from-gray-900 via-gray-900 to-black text-gray-300 border-t border-emerald-900/40 pt-12 pb-8 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Brand & Slogan */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                Rx
              </div>
              <div>
                <h3 className="font-black text-white text-lg leading-tight">
                  {settings.pharmacyNameAr}
                </h3>
                <span className="text-xs text-emerald-400 font-sans tracking-wider block">
                  {settings.pharmacyNameEn}
                </span>
              </div>
            </div>

            <p className="text-xs text-emerald-300 font-bold">
              "{settings.slogan}"
            </p>

            <p className="text-xs text-gray-400 leading-relaxed">
              صيدليتكم المعتمدة في قلب محافظة إب. نوفر لكم أفضل الأدوية والمستلزمات الطبية بجودة مضمونة وتوصيل فوري لجميع الأحياء والمحافظات.
            </p>

            {/* Official WhatsApp Button */}
            <a
              href="https://wa.me/967770075032"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-700/20"
            >
              <MessageCircle className="w-4 h-4" />
              <span>الطلب عبر واتساب: +967770075032</span>
            </a>
          </div>

          {/* Col 2: Categories */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white border-b border-gray-800 pb-2">
              الأقسام والتصنيفات الطبية
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              {categories.slice(0, 7).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                    className="hover:text-emerald-400 transition-colors text-right"
                  >
                    • {cat.nameAr}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Fast Services */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white border-b border-gray-800 pb-2">
              خدمات الصيدلية السريعة
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <button
                  onClick={onOpenPrescriptionModal}
                  className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-500" />
                  <span>طلب دواء بروشتة أو وصفة طبية</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenOrdersModal}
                  className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                >
                  <Truck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>تتبع حالة الطلب والتوصيل</span>
                </button>
              </li>
              <li>
                <a
                  href="https://wa.me/967770075032?text=السلام%20عليكم%20صيدلية%20ذو%20ريدان%20أرغب%20في%20استشارة%20دوائية"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>استشارة صيدلانية مجانية مع المناوب</span>
                </a>
              </li>
              <li>
                <span className="flex items-center gap-1.5 text-gray-400">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  <span>خدمة وتوصيل 24 ساعة طوال الأسبوع</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Location & Contact */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white border-b border-gray-800 pb-2">
              الموقع والتواصل المباشر
            </h4>
            <div className="space-y-2.5 text-xs text-gray-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>اليمن – محافظة إب – شارع مفرق ميتم (المركز الرئيسي).</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-mono" dir="ltr">+967 770 075 032</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>تغطية التوصيل: مدينة إب وسائر المحافظات اليمنية</span>
              </div>
            </div>

            {/* Quality Seal */}
            <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-800/40 text-xs text-emerald-200 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>أدوية أصلية مخزنة بدرجات حرارة مطابقة لمعايير منظمة الصحة العالمية.</span>
            </div>
          </div>
        </div>

        {/* Drug Safety Disclaimer Box */}
        <div className="p-4 bg-gray-950/80 rounded-2xl border border-gray-800 text-xs text-gray-400 space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>إخلاء مسؤولية وتنبيه طبي قانوني:</span>
          </div>
          <p className="text-[11px] leading-relaxed text-gray-400">
            المحتوى الطبي والمعلومات الدوائية المعروضة على منصة صيدلية ذو ريدان مخصصة لأغراض التثقيف والاسترشاد فقط ولا تغني بأي حال من الأحوال عن الاستشارة والتشخيص من قبل الطبيب المعالج أو الصيدلاني المرخص. لا تتناول أي دواء مقيد إلا بوصفة طبية معتمدة، ويُحظر صرف أي أدوية خاضعة للرقابة دون روشتة قانونية.
          </p>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} صيدلية ذو ريدان (DHU RAYDAN PHARMACY) – جميع الحقوق محفوظة.</p>
          <p className="text-[11px]">شارع مفرق ميتم – إب – الجمهورية اليمنية</p>
        </div>
      </div>
    </footer>
  );
};
