import React from 'react';
import { Product } from '../types/pharmacy';
import { usePharmacy } from '../context/PharmacyContext';
import { formatYER } from '../utils/pharmacy';
import {
  ShoppingCart,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Eye,
  Building2,
  FlaskConical,
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { addToCart, cart } = usePharmacy();

  const cartItem = cart.find((item) => item.product.id === product.id);
  const currentQtyInCart = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock <= 0 || !product.isAvailable;
  const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-200 transition-all flex flex-col group relative">
      {/* Badges Bar */}
      <div className="absolute top-2.5 right-2.5 left-2.5 z-10 flex justify-between items-start pointer-events-none">
        {/* Prescription Requirement Badge */}
        {product.requiresPrescription ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/95 text-white text-[11px] font-bold shadow-xs">
            <ShieldAlert className="w-3 h-3" />
            <span>يتطلب وصفة</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/90 text-white text-[10px] font-semibold shadow-xs">
            <CheckCircle2 className="w-3 h-3" />
            <span>بدون وصفة</span>
          </span>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[11px] font-black shadow-xs">
            خصم {Math.round(((product.price - (product.discountPrice || 0)) / product.price) * 100)}%
          </span>
        )}
      </div>

      {/* Product Image */}
      <div
        onClick={() => onOpenDetails(product)}
        className="relative h-44 sm:h-48 bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden cursor-pointer flex items-center justify-center p-4 group-hover:bg-emerald-50/30 transition-colors"
      >
        <img
          src={product.imageUrl}
          alt={product.nameAr}
          loading="lazy"
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Fallback medical placeholder
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="px-3 py-1.5 rounded-full bg-white/90 text-emerald-800 text-xs font-bold shadow-md flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>عرض التفاصيل الطبية</span>
          </span>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between text-right space-y-3">
        <div>
          {/* Manufacturer & Strength */}
          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
            <span className="flex items-center gap-1 truncate max-w-[65%]">
              <Building2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">{product.manufacturer}</span>
            </span>
            <span className="font-semibold px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">
              {product.strength}
            </span>
          </div>

          {/* Product Names */}
          <h3
            onClick={() => onOpenDetails(product)}
            className="font-bold text-gray-900 text-sm sm:text-base leading-snug line-clamp-2 hover:text-emerald-700 cursor-pointer"
          >
            {product.nameAr}
          </h3>
          <p className="text-[11px] text-gray-400 font-sans tracking-wide truncate mt-0.5">
            {product.nameEn}
          </p>

          {/* Active Ingredient */}
          <div className="mt-2 text-[11px] text-emerald-800 bg-emerald-50/70 p-1.5 rounded-lg flex items-center gap-1 truncate">
            <FlaskConical className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate font-medium">{product.activeIngredient}</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-gray-100 space-y-2">
          {/* Price display in YER */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-emerald-800">
                {formatYER(product.discountPrice ?? product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through">
                  {formatYER(product.price)}
                </span>
              )}
            </div>

            {/* Stock status */}
            <span
              className={`text-[10px] font-semibold ${
                product.stock > 10
                  ? 'text-emerald-600'
                  : product.stock > 0
                  ? 'text-amber-600'
                  : 'text-rose-600'
              }`}
            >
              {product.stock > 10
                ? 'متوفر'
                : product.stock > 0
                ? `متبقي ${product.stock}`
                : 'نفد من المخزن'}
            </span>
          </div>

          {/* Add to Cart button */}
          <button
            onClick={() => addToCart(product, 1)}
            disabled={isOutOfStock}
            aria-label={`أضف ${product.nameAr} إلى السلة`}
            data-testid={`add-to-cart-${product.id}`}
            className={`w-full py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : currentQtyInCart > 0
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>
              {isOutOfStock
                ? 'غير متوفر حالياً'
                : currentQtyInCart > 0
                ? `في السلة (${currentQtyInCart}) +`
                : 'أضف إلى السلة'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
