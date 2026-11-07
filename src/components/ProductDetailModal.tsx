import React, { useState } from 'react';
import { Product } from '../types/pharmacy';
import { usePharmacy } from '../context/PharmacyContext';
import { formatYER } from '../utils/pharmacy';
import {
  X,
  ShoppingCart,
  ShieldAlert,
  Building2,
  FlaskConical,
  Package,
  Calendar,
  AlertCircle,
  MessageCircle,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenPrescriptionModal: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOpenPrescriptionModal,
}) => {
  const { addToCart, settings } = usePharmacy();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;
  const isOutOfStock = product.stock <= 0 || !product.isAvailable;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
  };

  const whatsappInquiryUrl = `https://wa.me/967770075032?text=${encodeURIComponent(
    `السلام عليكم ورحمة الله، أستفسر من صيدلية ذو ريدان عن توفر دواء/منتج: *${product.nameAr}* (${product.nameEn}) - تركيز: ${product.strength}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-emerald-100 max-h-[92vh] flex flex-col">
        {/* Header bar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-emerald-50/40">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span className="text-xs font-bold text-emerald-900">
              بيانات الدواء والمنتج الصيدلاني المعتمد
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-right">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
            {/* Product Image */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <img
                src={product.imageUrl}
                alt={product.nameAr}
                className="max-h-56 max-w-full object-contain"
              />
              {product.requiresPrescription && (
                <div className="mt-3 w-full p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs text-center flex items-center justify-center gap-1.5 font-bold">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>دواء بوصفة طبية معتمدة</span>
                </div>
              )}
            </div>

            {/* Core Info */}
            <div className="sm:col-span-7 space-y-3">
              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  {product.manufacturer}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-gray-900 mt-1.5 leading-snug">
                  {product.nameAr}
                </h2>
                <p className="text-xs text-gray-400 font-sans tracking-wide">
                  {product.nameEn}
                </p>
              </div>

              {/* Price */}
              <div className="p-3 bg-gray-50 rounded-xl flex items-baseline justify-between border border-gray-100">
                <span className="text-xs text-gray-500 font-medium">سعر البيع:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-emerald-800">
                    {formatYER(product.discountPrice ?? product.price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs text-gray-400 line-through">
                      {formatYER(product.price)}
                    </span>
                  )}
                </div>
              </div>

              {/* Key Specs Pills */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-400 block text-[10px]">التركيز:</span>
                  <span className="font-bold text-gray-800">{product.strength}</span>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-400 block text-[10px]">حجم العبوة:</span>
                  <span className="font-bold text-gray-800">{product.packageSize}</span>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-400 block text-[10px]">المخزون المتوفر:</span>
                  <span
                    className={`font-bold ${
                      product.stock > 10
                        ? 'text-emerald-700'
                        : product.stock > 0
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {product.stock > 0 ? `${product.stock} عبوة` : 'غير متوفر'}
                  </span>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-400 block text-[10px]">تاريخ الانتهاء:</span>
                  <span className="font-bold text-gray-800" dir="ltr">
                    {product.expiryDate || 'تاريخ جديد'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Scientific Info & Medical Description */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            {/* Scientific name & Active ingredient */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                  <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
                  <span>المادة الفعالة:</span>
                </span>
                <p className="text-emerald-800 font-medium">{product.activeIngredient}</p>
              </div>

              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>الاسم العلمي:</span>
                </span>
                <p className="text-emerald-800 font-medium font-sans">{product.scientificName}</p>
              </div>
            </div>

            {/* Product Description */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 mb-1">وصف الدواء / المنتج:</h4>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                {product.description}
              </p>
            </div>

            {/* Indications & Dosage */}
            {product.indications && (
              <div>
                <h4 className="text-xs font-bold text-gray-500 mb-1">دواعي الاستعمال:</h4>
                <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {product.indications}
                </p>
              </div>
            )}

            {product.dosage && (
              <div>
                <h4 className="text-xs font-bold text-gray-500 mb-1">إرشادات وطريقة الاستخدام:</h4>
                <p className="text-xs text-gray-700 leading-relaxed bg-amber-50/60 p-3 rounded-xl border border-amber-100 text-amber-900">
                  {product.dosage}
                </p>
              </div>
            )}

            {/* Medical safety notice */}
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-blue-900 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                تنبيه دوائي: يرجى الالتزام بتعليمات الطبيب أو الصيدلاني المختص بشأن الجرعات وتجنب مضاعفة الجرعة دون استشارة.
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/80 flex flex-wrap items-center justify-between gap-3">
          {/* Quantity selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-600">الكمية:</span>
            <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 font-bold"
              >
                -
              </button>
              <span className="px-3 py-1.5 text-xs font-bold text-gray-800 min-w-[32px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock}
                className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 font-bold disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <a
              href={whatsappInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors"
              title="استفسار سريع عبر واتساب"
            >
              <MessageCircle className="w-5 h-5 text-emerald-700" />
            </a>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex-1 sm:flex-initial px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{isOutOfStock ? 'غير متوفر' : `أضف للسلة (${formatYER((product.discountPrice ?? product.price) * quantity)})`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
