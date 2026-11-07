import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { formatYER } from '../utils/pharmacy';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  Tag,
  ShieldAlert,
  Truck,
  Check,
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    deliveryAreas,
    selectedDeliveryArea,
    setSelectedDeliveryArea,
    cartTotals,
    cartHasPrescriptionItems,
  } = usePharmacy();

  const [couponInput, setCouponInput] = useState('');

  if (!isOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput);
      setCouponInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col text-right">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-gray-900 text-base">
              سلة المشتريات ({cart.reduce((t, i) => t + i.quantity, 0)})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prescription items safety warning */}
        {cartHasPrescriptionItems && (
          <div className="p-3 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              سلتك تحتوي على أدوية تتطلب وصفة طبية، سيتم التحقق منها عبر الصيدلاني عند إتمام الطلب.
            </span>
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 opacity-40" />
              </div>
              <p className="font-bold text-gray-700 text-base">سلة الأدوية فارغة حالياً</p>
              <p className="text-xs text-gray-400 max-w-xs">
                تصفح قائمة الأدوية والمستلزمات الطبية وأضف ما تحتاجه للبدء في التسوق.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                تصفح المنتجات الآن
              </button>
            </div>
          ) : (
            cart.map(({ product, quantity }) => {
              const unitPrice = product.discountPrice ?? product.price;
              const itemTotal = unitPrice * quantity;

              return (
                <div
                  key={product.id}
                  className="p-3 rounded-2xl border border-gray-100 bg-gray-50/60 flex items-center gap-3"
                >
                  {/* Thumbnail */}
                  <img
                    src={product.imageUrl}
                    alt={product.nameAr}
                    className="w-16 h-16 rounded-xl object-contain bg-white p-1 border border-gray-100 shrink-0"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                      {product.nameAr}
                    </h4>
                    <span className="text-[10px] text-gray-500 block">{product.strength}</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-black text-xs sm:text-sm text-emerald-800">
                        {formatYER(itemTotal)}
                      </span>
                      {quantity > 1 && (
                        <span className="text-[10px] text-gray-400">
                          ({formatYER(unitPrice)} للواحدة)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls & Remove */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-gray-400 hover:text-rose-600 p-1"
                      title="حذف من السلة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                      <button
                        onClick={() => updateCartQuantity(product.id, quantity - 1)}
                        className="p-1 hover:bg-gray-100 text-gray-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-gray-800">{quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(product.id, quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="p-1 hover:bg-gray-100 text-gray-600 disabled:opacity-40"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer & Calculations */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-gray-100 bg-white space-y-4 shadow-lg">
            {/* Delivery area selector */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>منطقة التوصيل:</span>
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">
                  {selectedDeliveryArea.estimatedHours}
                </span>
              </label>
              <select
                value={selectedDeliveryArea.id}
                onChange={(e) => {
                  const area = deliveryAreas.find((a) => a.id === e.target.value);
                  if (area) setSelectedDeliveryArea(area);
                }}
                className="w-full bg-gray-50 text-xs font-medium border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:border-emerald-500"
              >
                {deliveryAreas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.governorate} - {area.areaName} ({formatYER(area.fee)})
                  </option>
                ))}
              </select>
            </div>

            {/* Coupon Code Input */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>كوبون {appliedCoupon.code} (خصم {appliedCoupon.discountPercentage}%)</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-rose-600 hover:text-rose-800 text-[11px] font-bold"
                  >
                    إلغاء
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="كود الخصم (مثل RAYDAN10)"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    تطبيق
                  </button>
                </form>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs border-t border-gray-100 pt-3">
              <div className="flex justify-between text-gray-600">
                <span>المجموع الفرعي:</span>
                <span className="font-semibold">{formatYER(cartTotals.subtotal)}</span>
              </div>

              {cartTotals.discount > 0 && (
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>الخصم المطبق:</span>
                  <span>-{formatYER(cartTotals.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>رسوم التوصيل:</span>
                <span className="font-semibold">
                  {cartTotals.deliveryFee === 0 ? (
                    <span className="text-emerald-700 font-bold">توصيل مجاني 🎉</span>
                  ) : (
                    formatYER(cartTotals.deliveryFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-sm sm:text-base font-black text-gray-900 pt-2 border-t border-gray-100">
                <span>المبلغ الإجمالي (ر.ي):</span>
                <span className="text-emerald-800 font-black">{formatYER(cartTotals.totalAmount)}</span>
              </div>
            </div>

            {/* Proceed to Checkout Button */}
            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-98"
            >
              <span>متابعة إتمام الطلب</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
