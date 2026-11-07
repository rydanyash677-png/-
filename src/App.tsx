import React, { useState, useMemo } from 'react';
import { PharmacyProvider, usePharmacy } from './context/PharmacyContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { PrescriptionUploadModal } from './components/PrescriptionUploadModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { ToastContainer } from './components/ToastContainer';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { Product, Order } from './types/pharmacy';
import {
  Sparkles,
  Flame,
  Percent,
  Clock,
  ShieldCheck,
  Truck,
  MapPin,
  Phone,
  MessageCircle,
  Stethoscope,
  FileText,
  Search,
  Filter,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

function StorefrontContent() {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    onlyPrescriptionNeeded,
    setOnlyPrescriptionNeeded,
    deliveryAreas,
    settings,
  } = usePharmacy();

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);

  // Active Category Object
  const currentCategoryObj = categories.find((c) => c.id === selectedCategory);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (selectedCategory && product.category !== selectedCategory) {
        return false;
      }

      // Prescription filter
      if (onlyPrescriptionNeeded !== null && product.requiresPrescription !== onlyPrescriptionNeeded) {
        return false;
      }

      // Search query filter (matches Arabic name, English name, scientific name, active ingredient)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesAr = product.nameAr.toLowerCase().includes(query);
        const matchesEn = product.nameEn.toLowerCase().includes(query);
        const matchesScientific = product.scientificName.toLowerCase().includes(query);
        const matchesIngredient = product.activeIngredient.toLowerCase().includes(query);
        const matchesManufacturer = product.manufacturer.toLowerCase().includes(query);
        const matchesIndications = (product.indications || '').toLowerCase().includes(query);
        return (
          matchesAr ||
          matchesEn ||
          matchesScientific ||
          matchesIngredient ||
          matchesManufacturer ||
          matchesIndications
        );
      }

      return true;
    });
  }, [products, selectedCategory, onlyPrescriptionNeeded, searchQuery]);

  // Featured, Best Sellers, Offers, and Newest sets
  const featuredProducts = useMemo(
    () => products.filter((p) => p.isFeatured).slice(0, 4),
    [products]
  );
  const bestSellers = useMemo(
    () => products.filter((p) => p.isBestSeller).slice(0, 4),
    [products]
  );
  const specialOffers = useMemo(
    () => products.filter((p) => p.discountPrice && p.discountPrice < p.price).slice(0, 4),
    [products]
  );

  const handleOrderSuccess = (order: Order) => {
    setActiveTrackingOrder(order);
    setIsOrdersModalOpen(true);
  };

  const handleScrollToProducts = () => {
    const el = document.getElementById('products-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* PWA Install Notification Bar */}
      <PWAInstallBanner />

      {/* Main Sticky Header */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenPrescriptionModal={() => setIsPrescriptionModalOpen(true)}
        onOpenOrdersModal={() => setIsOrdersModalOpen(true)}
        onOpenAdminModal={() => setIsAdminDashboardOpen(true)}
        onOpenAuthModal={() => {}}
      />

      {/* Hero Banner Section */}
      <main className="flex-1">
        <HeroBanner
          onShopNow={handleScrollToProducts}
          onOpenPrescriptionModal={() => setIsPrescriptionModalOpen(true)}
        />

        {/* Category Icons Showcase */}
        <section className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span>الأقسام الدوائية والطبية</span>
            </h3>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs text-emerald-700 font-bold hover:underline"
              >
                عرض كل الأصناف
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5">
            {categories.map((cat) => {
              const count = products.filter((p) => p.category === cat.id).length;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(isSelected ? null : cat.id);
                    setOnlyPrescriptionNeeded(null);
                    handleScrollToProducts();
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 shadow-2xs group ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white hover:bg-emerald-50/50 border-gray-100 text-gray-800 hover:border-emerald-200'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-transform group-hover:scale-110 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    Rx
                  </div>
                  <span className="text-[11px] font-bold leading-tight line-clamp-2">
                    {cat.nameAr}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isSelected ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {count} صنف
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Featured Section (when no search or specific filter is active) */}
        {!searchQuery && !selectedCategory && onlyPrescriptionNeeded === null && (
          <div className="space-y-8 max-w-7xl mx-auto px-4 py-4">
            {/* Special Offers Banner */}
            {specialOffers.length > 0 && (
              <section className="p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/60 rounded-3xl border border-emerald-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-rose-600 text-white rounded-lg">
                      <Percent className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-gray-900">
                        العروض الخاصة والتخفيضات الدوائية
                      </h3>
                      <p className="text-xs text-gray-500">
                        أسعار مخفضة على باقة مختارة من الفيتامينات ومنتجات العناية بالبشرة
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-block px-3 py-1 bg-white text-emerald-800 text-xs font-bold rounded-full shadow-2xs border border-emerald-200">
                    كوبون خصم إضافي: RAYDAN10
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {specialOffers.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpenDetails={(p) => setSelectedProduct(p)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Best Sellers */}
            {bestSellers.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-500" />
                    <h3 className="text-base sm:text-lg font-black text-gray-900">
                      الأدوية والمنتجات الأكثر طلباً في إب
                    </h3>
                  </div>
                  <span className="text-xs text-gray-500">الأعلى طلباً هذا الأسبوع</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {bestSellers.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpenDetails={(p) => setSelectedProduct(p)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Featured Medicines */}
            {featuredProducts.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-base sm:text-lg font-black text-gray-900">
                      أدوية موصى بها من صيادلة ذو ريدان
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {featuredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpenDetails={(p) => setSelectedProduct(p)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Main Product Catalog Section */}
        <section id="products-section" className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
                <span>
                  {searchQuery
                    ? `نتائج البحث عن: "${searchQuery}"`
                    : currentCategoryObj
                    ? currentCategoryObj.nameAr
                    : onlyPrescriptionNeeded
                    ? 'الأدوية التي تتطلب وصفة طبية'
                    : 'كتالوج الأدوية والمستلزمات الطبية'}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  {filteredProducts.length} صنف
                </span>
              </h2>
              {currentCategoryObj?.description && (
                <p className="text-xs text-gray-500 mt-1">{currentCategoryObj.description}</p>
              )}
            </div>

            {/* Filters quick clear */}
            {(selectedCategory || searchQuery || onlyPrescriptionNeeded !== null) && (
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchQuery('');
                  setOnlyPrescriptionNeeded(null);
                }}
                className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1"
              >
                <span>إعادة تعيين الفلاتر</span>
                <span>✕</span>
              </button>
            )}
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-gray-100 p-8">
              <Search className="w-10 h-10 text-gray-300 mx-auto" />
              <h4 className="text-base font-bold text-gray-800">
                لم نجد أدوية مطابقة لبحثك الحالي
              </h4>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                يمكنك كتابة اسم الدواء أو مادته الفعالة، أو الاستفسار عنه مباشرة مع صيدلي صيدلية ذو ريدان عبر واتساب لتأمينه لك فورياً.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <a
                  href={`https://wa.me/967770075032?text=${encodeURIComponent(
                    `السلام عليكم صيدلية ذو ريدان، أبحث عن دواء (${searchQuery}) هل هو متوفر لديكم؟`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>اسأل الصيدلاني عبر واتساب</span>
                </a>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchQuery('');
                    setOnlyPrescriptionNeeded(null);
                  }}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                >
                  عرض جميع الأدوية
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetails={(p) => setSelectedProduct(p)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Location & Delivery Coverage Section */}
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-8 shadow-xs grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Location Card */}
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="font-bold text-base text-gray-900">
                مقرنا الرئيسي في مدينة إب
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {settings.location}
                <br />
                نرحب بزيارتكم الكريمة للاستشارات الدوائية المباشرة والفحوصات الروتينية لضغط الدم والسكر.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-mono font-bold text-emerald-700" dir="ltr">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>+967 770 075 032</span>
              </div>
            </div>

            {/* Delivery Coverage */}
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Truck className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="font-bold text-base text-gray-900">
                خدمة التوصيل السريع
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                توصيل فوري خلال 30 دقيقة لأحياء مفرق ميتم ومركز مدينة إب، وتوصيل خلال 24 ساعة لبقية المحافظات اليمنية عبر وسائل الشحن المبرد والآمن.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {deliveryAreas.slice(0, 5).map((a) => (
                  <span
                    key={a.id}
                    className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] rounded-md font-semibold"
                  >
                    {a.governorate}
                  </span>
                ))}
              </div>
            </div>

            {/* Safe Storage & Guarantee */}
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="font-bold text-base text-gray-900">
                ضمان الجودة والسلامة الطبية
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                جميع الأدوية والمحاليل والمكملات أصلية من وكلاء معتمدين رسمياً ومخزنة تحت درجات حرارة ورطوبة مضبوطة ومعايرة دورياً.
              </p>
              <span className="text-[11px] text-emerald-700 font-bold block pt-1">
                صيدلية مرخصة رسمياً من وزارة الصحة العامة والسكان.
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer
        onOpenPrescriptionModal={() => setIsPrescriptionModalOpen(true)}
        onOpenOrdersModal={() => setIsOrdersModalOpen(true)}
      />

      {/* Floating WhatsApp Action Button */}
      <FloatingWhatsApp />

      {/* Real-time Toast Alerts Container */}
      <ToastContainer />

      {/* Modals */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOpenPrescriptionModal={() => {
          setSelectedProduct(null);
          setIsPrescriptionModalOpen(true);
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      <PrescriptionUploadModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
      />

      <OrderTrackerModal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
        activeOrder={activeTrackingOrder}
      />

      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <PharmacyProvider>
      <StorefrontContent />
    </PharmacyProvider>
  );
}
