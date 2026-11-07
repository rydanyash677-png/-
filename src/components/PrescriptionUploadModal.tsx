import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { validateYemeniPhone } from '../utils/pharmacy';
import {
  X,
  Upload,
  Camera,
  FileText,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Phone,
  User,
  Heart,
  Clock,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PrescriptionUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrescriptionUploadModal: React.FC<PrescriptionUploadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { uploadPrescription, currentUser, showToast } = usePharmacy();

  const [customerName, setCustomerName] = useState(currentUser?.displayName || '');
  const [phone, setPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 5 ميغابايت');
        return;
      }
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setErrorMsg('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseDemoRx = () => {
    setImageUrl('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80');
    setFileName('روشتة_طبية_تجريبية_عيادة_الباطنية.jpg');
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('يرجى إدخال اسم المريض أو العميل');
      return;
    }

    if (!phone.trim()) {
      setErrorMsg('يرجى إدخال رقم الهاتف للتواصل');
      return;
    }

    if (!validateYemeniPhone(phone)) {
      setErrorMsg('يرجى إدخال رقم هاتف يمني صحيح (مثال: 770075032)');
      return;
    }

    if (!imageUrl) {
      setErrorMsg('يرجى تصوير أو إرفاق صورة واضحة للروشتة أو الوصفة الطبية');
      return;
    }

    setIsSubmitting(true);
    try {
      await uploadPrescription({
        customerName: customerName.trim(),
        phone: phone.trim(),
        patientAge: patientAge.trim() || undefined,
        imageUrl,
        notes: notes.trim() || undefined,
      });

      confetti({
        particleCount: 70,
        spread: 60,
      });

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg('تعذر إرسال الوصفة، يرجى المحاولة لاحقاً');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-emerald-100 max-h-[94vh] flex flex-col text-right">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <h3 className="font-bold text-gray-900 text-base">
              رفع وصفة طبية (روشتة علاجية) 🩺
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-black text-gray-900">
              تم استلام وصفتك الطبية بنجاح!
            </h4>
            <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
              يقوم الصيدلاني المناوب في صيدلية ذو ريدان بمراجعة الوصفة الطبية حالياً والتأكد من توافق الجرعات والمواد الفعالة. سنتواصل معك عبر الهاتف / واتساب لتأكيد السعر وموعد التوصيل الفوري.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <a
                href={`https://wa.me/967770075032?text=${encodeURIComponent(
                  `السلام عليكم، قمت برفع وصفة طبية باسم (${customerName}) برقم هاتف (${phone}) وأرغب في متابعتها مع الصيدلاني.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
              >
                متابعة عبر واتساب مباشرة
              </a>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Safety policy note */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl text-blue-900 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">ميثاق السلامة الدوائية والأمانة:</span>
                <p className="text-[11px] text-blue-800 leading-normal">
                  تخضع جميع الوصفات للتدقيق السريري الصارم من قبل صيدلي مرخص. لن يتم صرف أي أدوية جدولية أو خاضعة للرقابة دون روشتة نظامية ومطابقة لأحكام وزارة الصحة.
                </p>
              </div>
            </div>

            {/* Prescription File Upload */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block">
                صورة الوصفة الطبية: <span className="text-rose-500">*</span>
              </label>

              <div className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl p-4 bg-emerald-50/20 text-center transition-colors">
                {imageUrl ? (
                  <div className="space-y-2">
                    <img
                      src={imageUrl}
                      alt="Prescription preview"
                      className="max-h-48 mx-auto rounded-xl object-contain border border-gray-200"
                    />
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xs text-emerald-800 font-semibold">{fileName}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setImageUrl('');
                          setFileName('');
                        }}
                        className="text-xs text-rose-600 hover:underline"
                      >
                        تغيير الصورة
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                      <Camera className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-semibold text-gray-700">
                      اضغط لتصوير الوصفة أو اختر صورة من المعرض
                    </p>
                    <p className="text-[10px] text-gray-400">
                      صيغ الصور المدعومة: JPG, PNG, WEBP (حتى 5 ميغابايت)
                    </p>
                    <div className="pt-2 flex justify-center gap-2">
                      <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors">
                        <span>اختر صورة</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleUseDemoRx}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors"
                      >
                        استخدام صورة تجريبية
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Patient Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  اسم المريض / العميل: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="الاسم الثلاثي للمريض"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  رقم الهاتف للتواصل: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="770075032"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono text-right"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  عمر المريض (بالسنوات / للأطفال بالشهور):
                </label>
                <input
                  type="text"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  placeholder="مثال: 35 سنة، أو 8 شهور"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  ملاحظات أو حساسية دوائية:
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: حساسية من البنسلين، مرض سكري..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>{isSubmitting ? 'جارٍ الرفع...' : 'إرسال الوصفة للصيدلاني'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
