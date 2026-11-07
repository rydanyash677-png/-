import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { Order, OrderStatus } from '../types/pharmacy';
import { formatYER, getWhatsAppOrderUrl } from '../utils/pharmacy';
import {
  X,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  Phone,
  MessageCircle,
  AlertCircle,
  Search,
  ExternalLink,
} from 'lucide-react';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeOrder?: Order | null;
}

const STATUS_STEPS: OrderStatus[] = [
  'طلب جديد',
  'قيد المراجعة',
  'تم تأكيد الطلب',
  'جارٍ تجهيز الطلب',
  'خرج للتوصيل',
  'تم التسليم',
];

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
  activeOrder,
}) => {
  const { orders } = usePharmacy();
  const [searchCode, setSearchCode] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(activeOrder || null);

  if (!isOpen) return null;

  const currentDisplayOrder =
    selectedOrder || (orders.length > 0 ? orders[0] : null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    const found = orders.find(
      (o) =>
        o.orderNumber.toLowerCase() === searchCode.trim().toLowerCase() ||
        o.phone.includes(searchCode.trim())
    );
    if (found) {
      setSelectedOrder(found);
    }
  };

  const getStepIndex = (status: OrderStatus) => {
    return STATUS_STEPS.indexOf(status);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-emerald-100 max-h-[92vh] flex flex-col text-right">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-gray-900 text-base">
              متابعة حالة الطلبات والتوصيل 🚚
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Search by Order Number or Phone */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="ابحث برقم الطلب (مثل RAY-2026-...) أو رقم الهاتف..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>بحث</span>
            </button>
          </form>

          {currentDisplayOrder ? (
            <div className="space-y-6">
              {/* Order Meta Header */}
              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-100 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-800 font-bold">رقم الطلب:</span>
                    <span className="font-mono text-sm font-black text-gray-900 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                      {currentDisplayOrder.orderNumber}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500 block mt-1">
                    تاريخ الطلب:{' '}
                    {new Date(currentDisplayOrder.createdAt).toLocaleString('ar-YE')}
                  </span>
                </div>

                <div className="text-left">
                  <span className="text-xs text-gray-500 block">المبلغ الإجمالي:</span>
                  <span className="text-base font-black text-emerald-800 font-mono">
                    {formatYER(currentDisplayOrder.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Status Timeline Progress Bar */}
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-700">مراحل معالجة وتوصيل الطلب:</h4>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black ${
                      currentDisplayOrder.status === 'تم التسليم'
                        ? 'bg-emerald-100 text-emerald-800'
                        : currentDisplayOrder.status === 'تم الإلغاء'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    الحالة الحالية: {currentDisplayOrder.status}
                  </span>
                </div>

                {/* Steps Visual */}
                <div className="relative pt-2 pb-2">
                  <div className="grid grid-cols-6 gap-1 text-center">
                    {STATUS_STEPS.map((step, idx) => {
                      const currentIdx = getStepIndex(currentDisplayOrder.status);
                      const isCompleted = currentIdx >= idx;
                      const isCurrent = currentIdx === idx;

                      return (
                        <div key={step} className="flex flex-col items-center space-y-2">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                              isCurrent
                                ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                                : isCompleted
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-200 text-gray-400'
                            }`}
                          >
                            {isCompleted ? '✓' : idx + 1}
                          </div>
                          <span
                            className={`text-[10px] leading-tight line-clamp-2 ${
                              isCurrent
                                ? 'font-black text-emerald-800'
                                : isCompleted
                                ? 'font-semibold text-gray-700'
                                : 'text-gray-400'
                            }`}
                          >
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Customer and Delivery info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                  <span className="font-bold text-gray-700 block">المستلم وجهة الاتصال:</span>
                  <p className="text-gray-900 font-semibold">{currentDisplayOrder.customerName}</p>
                  <p className="text-gray-600 font-mono" dir="ltr">{currentDisplayOrder.phone}</p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                  <span className="font-bold text-gray-700 block">العنوان وموقع التسليم:</span>
                  <p className="text-gray-900 font-semibold">
                    محافظة {currentDisplayOrder.governorate} - {currentDisplayOrder.district}
                  </p>
                  <p className="text-gray-500">{currentDisplayOrder.detailedAddress}</p>
                </div>
              </div>

              {/* Ordered Items List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-700">الأدوية والمنتجات في هذا الطلب:</h4>
                <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 overflow-hidden text-xs">
                  {currentDisplayOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between bg-white">
                      <div>
                        <span className="font-bold text-gray-900 block">{item.nameAr}</span>
                        <span className="text-[10px] text-gray-400">
                          {formatYER(item.price)} × {item.quantity}
                        </span>
                      </div>
                      <span className="font-black text-emerald-800 font-mono">
                        {formatYER(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* WhatsApp direct contact button */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-emerald-950">
                    هل تحتاج إلى تعديل أو استفسار عاجل عن هذا الطلب؟
                  </h5>
                  <p className="text-[11px] text-emerald-800">
                    تواصل مباشرة مع صيدلي صيدلية ذو ريدان عبر واتساب
                  </p>
                </div>
                <a
                  href={`https://wa.me/967770075032?text=${encodeURIComponent(
                    `السلام عليكم ورحمة الله، أستفسر عن طلبي رقم: *${currentDisplayOrder.orderNumber}* باسم (${currentDisplayOrder.customerName}) في صيدلية ذو ريدان.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>محادثة واتساب</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 space-y-2">
              <Package className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-700">لا توجد طلبات سابقة مسجلة</p>
              <p className="text-xs text-gray-400">
                عند إتمام أي عملية شراء أو طلب عبر الموقع أو واتساب، ستظهر تفاصيلها وحالتها هنا مباشرة.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
