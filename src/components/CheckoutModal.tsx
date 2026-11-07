import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { formatYER, validateYemeniPhone, getWhatsAppOrderUrl } from '../utils/pharmacy';
import { Order } from '../types/pharmacy';
import {
  X,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  FileText,
  CreditCard,
  MessageCircle,
  Truck,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const {
    cart,
    cartTotals,
    selectedDeliveryArea,
    createOrder,
    cartHasPrescriptionItems,
    showToast,
  } = usePharmacy();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState(selectedDeliveryArea.governorate || 'إب');
  const [district, setDistrict] = useState(
    selectedDeliveryArea.governorate === 'إب' ? 'شارع مفرق ميتم' : ''
  );
  const [detailedAddress, setDetailedAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'bank_transfer' | 'kuraimi_jawali'>('cash_on_delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (viaWhatsApp: boolean) => {
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('يرجى كتابة اسم العميل الكريم');
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

    if (!detailedAddress.trim()) {
      setErrorMsg('يرجى تحديد تفاصيل العنوان أو أقرب معلم واضح لتوصيل الأدوية');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await createOrder({
        customerName: customerName.trim(),
        phone: phone.trim(),
        governorate: governorate.trim(),
        district: district.trim() || 'وسط المدينة',
        detailedAddress: detailedAddress.trim(),
        deliveryNotes: deliveryNotes.trim() || undefined,
        paymentMethod,
        orderedViaWhatsApp: viaWhatsApp,
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      if (viaWhatsApp) {
        // Open WhatsApp order URL
        const waUrl = getWhatsAppOrderUrl(order, '967770075032');
        window.open(waUrl, '_blank');
      }

      onOrderSuccess(order);
      onClose();
    } catch (err: any) {
      setErrorMsg('حدث خطأ أثناء حفظ الطلب، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-emerald-100 max-h-[94vh] flex flex-col text-right">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <h3 className="font-bold text-gray-900 text-base">
              إتمام طلب الشراء والتوصيل - صيدلية ذو ريدان
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {cartHasPrescriptionItems && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                تنبيه: يحتوي طلبك على أدوية ملزمة بوصفة طبية معتمدة. سيقوم صيدلي صيدلية ذو ريدان المناوب بمراجعتها وتأكيدها معك هاتفياً أو عبر واتساب قبل خروج المندوب.
              </span>
            </div>
          )}

          {/* Customer info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-600" />
              <span>بيانات العميل المستلم:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  الاسم الكامل: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="مثال: د. محمد أحمد الخولاني"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  رقم الهاتف (يمن موبايل / يو / سبأفون): <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="770075032"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white font-mono text-right"
                />
              </div>
            </div>
          </div>

          {/* Delivery Location */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>عنوان التوصيل في اليمن:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  المحافظة: <span className="text-rose-500">*</span>
                </label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="إب">محافظة إب (نطاق الصيدلية ومفرق ميتم)</option>
                  <option value="صنعاء">صنعاء (أمانة العاصمة)</option>
                  <option value="تعز">تعز</option>
                  <option value="عدن">عدن</option>
                  <option value="ذمار">ذمار</option>
                  <option value="الحديدة">الحديدة</option>
                  <option value="حضرموت">حضرموت</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  المديرية أو المنطقة: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="مثال: شارع مفرق ميتم، الظهار، المشنة، يريم..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  العنوان التفصيلي وأقرب معلم: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={detailedAddress}
                  onChange={(e) => setDetailedAddress(e.target.value)}
                  placeholder="مثال: شارع مفرق ميتم - بجوار محطة النصر - عمارة الصقر الدور 2 شقة 4"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  ملاحظات التوصيل أو مواعيد الاستلام (اختياري):
                </label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="مثال: الاتصال قبل الوصول بـ 15 دقيقة، أو الاستلام مساءً"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>طريقة الدفع في اليمن:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label
                onClick={() => setPaymentMethod('cash_on_delivery')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-bold'
                    : 'border-gray-200 bg-gray-50 text-gray-700'
                }`}
              >
                <div>
                  <span className="block font-bold">الدفع عند الاستلام (نقدياً)</span>
                  <span className="text-[10px] text-gray-500">تسليم المبلغ لمندوب التوصيل بالريال اليمني</span>
                </div>
                {paymentMethod === 'cash_on_delivery' && (
                  <Check className="w-4 h-4 text-emerald-600" />
                )}
              </label>

              <label
                onClick={() => setPaymentMethod('kuraimi_jawali')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'kuraimi_jawali'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-bold'
                    : 'border-gray-200 bg-gray-50 text-gray-700'
                }`}
              >
                <div>
                  <span className="block font-bold">تحويل الكريمي / جوالي / ون كاش</span>
                  <span className="text-[10px] text-gray-500">تحويل فوري عبر المحافظ الإلكترونية</span>
                </div>
                {paymentMethod === 'kuraimi_jawali' && (
                  <Check className="w-4 h-4 text-emerald-600" />
                )}
              </label>
            </div>
          </div>

          {/* Order Summary Box */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>عدد الأصناف:</span>
              <span className="font-bold">{cart.length} أصناف</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>المجموع الفرعي:</span>
              <span className="font-bold">{formatYER(cartTotals.subtotal)}</span>
            </div>
            {cartTotals.discount > 0 && (
              <div className="flex justify-between text-rose-600 font-bold">
                <span>الخصم المطبق:</span>
                <span>-{formatYER(cartTotals.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>رسوم التوصيل ({selectedDeliveryArea.areaName}):</span>
              <span className="font-bold">{formatYER(cartTotals.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-200">
              <span>المبلغ الإجمالي للدفع (ر.ي):</span>
              <span className="text-emerald-800 font-black text-base">
                {formatYER(cartTotals.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/90 flex flex-wrap gap-3">
          {/* Submit via WhatsApp (Direct Official Integration) */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit(true)}
            className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-98"
          >
            <MessageCircle className="w-4 h-4 text-white" />
            <span>حفظ والطلب عبر واتساب (+967770075032)</span>
          </button>

          {/* Standard Order Confirmation */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit(false)}
            className="py-3 px-5 bg-gray-900 hover:bg-black text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm active:scale-98"
          >
            <span>تأكيد الطلب فقط</span>
          </button>
        </div>
      </div>
    </div>
  );
};
