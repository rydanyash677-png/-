import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { formatYER } from '../utils/pharmacy';
import {
  Search,
  ShoppingCart,
  FileText,
  User,
  ShieldAlert,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Menu,
  X,
  Stethoscope,
  ChevronDown,
  Sparkles,
  Package,
} from 'lucide-react';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenPrescriptionModal: () => void;
  onOpenOrdersModal: () => void;
  onOpenAdminModal: () => void;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  onOpenPrescriptionModal,
  onOpenOrdersModal,
  onOpenAdminModal,
  onOpenAuthModal,
}) => {
  const {
    settings,
    cart,
    cartTotals,
    userRole,
    setUserRole,
    currentUser,
    searchQuery,
    setSearchQuery,
    categories,
    selectedCategory,
    setSelectedCategory,
    onlyPrescriptionNeeded,
    setOnlyPrescriptionNeeded,
    isPharmacist,
    isAdmin,
  } = usePharmacy();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-emerald-100">
      {/* Top Announcement & Emergency Bar */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-300" />
              <span>{settings.location}</span>
            </span>
            <span className="hidden md:inline-block text-emerald-300/40">•</span>
            <span className="hidden md:flex items-center gap-1.5 text-emerald-100">
              <Clock className="w-3.5 h-3.5 text-emerald-300" />
              <span>خدمة وتوصيل 24 ساعة لجميع مديريات إب والمحافظات</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/967770075032"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-100 hover:text-white transition-colors bg-emerald-900/60 hover:bg-emerald-900 px-2.5 py-0.5 rounded-full"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-[11px] font-semibold" dir="ltr">+967 770 075 032</span>
            </a>

            {/* Role selector dropdown badge */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition-colors font-medium border border-emerald-400/40"
                title="تغيير صفة المستخدم لتجربة النظام"
              >
                <span>الوضع:</span>
                <span className="font-bold underline">
                  {userRole === 'admin' ? 'مدير النظام' : userRole === 'pharmacist' ? 'صيدلاني' : 'عميل'}
                </span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {roleMenuOpen && (
                <div className="absolute left-0 mt-1 w-44 bg-white rounded-lg shadow-xl border border-gray-100 py-1 text-gray-800 z-50 text-xs">
                  <div className="px-3 py-1.5 text-[10px] text-gray-400 font-semibold border-b">
                    تبديل الصلاحية للتجربة:
                  </div>
                  <button
                    onClick={() => {
                      setUserRole('customer');
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-right px-3 py-2 flex items-center justify-between hover:bg-emerald-50 ${
                      userRole === 'customer' ? 'text-emerald-700 font-bold bg-emerald-50/60' : ''
                    }`}
                  >
                    <span>عميل (متسوق)</span>
                    {userRole === 'customer' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
                  </button>
                  <button
                    onClick={() => {
                      setUserRole('pharmacist');
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-right px-3 py-2 flex items-center justify-between hover:bg-emerald-50 ${
                      userRole === 'pharmacist' ? 'text-emerald-700 font-bold bg-emerald-50/60' : ''
                    }`}
                  >
                    <span>صيدلاني مناوب</span>
                    {userRole === 'pharmacist' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
                  </button>
                  <button
                    onClick={() => {
                      setUserRole('admin');
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-right px-3 py-2 flex items-center justify-between hover:bg-emerald-50 ${
                      userRole === 'admin' ? 'text-emerald-700 font-bold bg-emerald-50/60' : ''
                    }`}
                  >
                    <span>مدير النظام الكامل</span>
                    {userRole === 'admin' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Brand & Actions Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-3 group focus:outline-none">
              {/* Unique Pharmacy Brand Icon */}
              <div className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
                {/* Medical Cross + Rx Symbol */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative">
                    <span className="text-xl sm:text-2xl font-black leading-none tracking-tight">Rx</span>
                    <span className="absolute -top-1 -right-2 text-xs font-bold text-emerald-200">✚</span>
                  </div>
                </div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-teal-400 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-teal-900 font-bold">
                  ✓
                </div>
              </div>

              {/* Brand Typography */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-tight group-hover:text-emerald-700 transition-colors">
                    {settings.pharmacyNameAr}
                  </h1>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] bg-emerald-100 text-emerald-800 font-bold rounded-md">
                    إلكترونية معتمدة
                  </span>
                </div>
                <span className="text-[11px] sm:text-xs font-semibold tracking-wider text-emerald-700 font-sans uppercase">
                  {settings.pharmacyNameEn}
                </span>
                <span className="text-[10px] text-gray-500 hidden lg:inline-block">
                  {settings.slogan}
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن دواء، الاسم العلمي، مادة فعالة، فيتامينات، أو مستلزمات..."
                className="w-full bg-gray-50 hover:bg-gray-100/80 focus:bg-white text-gray-800 text-sm pl-10 pr-11 py-2.5 rounded-full border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all placeholder:text-gray-400"
              />
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Upload Prescription Button */}
            <button
              onClick={onOpenPrescriptionModal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/90 rounded-xl transition-all border border-emerald-200/60 shadow-xs"
              title="أرسل وصفتك الطبية للصيدلاني"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">طلب بوصفة</span>
              <span className="sm:hidden text-xs">وصفة</span>
            </button>

            {/* Track Orders Button */}
            <button
              onClick={onOpenOrdersModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all border border-gray-200/70"
            >
              <Package className="w-4 h-4 text-gray-500" />
              <span>متابعة الطلبات</span>
            </button>

            {/* Admin / Pharmacist Portal Button */}
            {isPharmacist && (
              <button
                onClick={onOpenAdminModal}
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 rounded-xl transition-all shadow-sm shadow-emerald-800/20"
              >
                <Stethoscope className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isAdmin ? 'لوحة الإدارة' : 'لوحة الصيدلاني'}
                </span>
                <span className="sm:hidden text-xs">إدارة</span>
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              aria-label="سلة المشتريات"
              data-testid="cart-button"
              className="relative flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-sm shadow-emerald-600/30 active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="text-xs sm:text-sm hidden sm:inline">السلة</span>
              {cartItemCount > 0 && (
                <span className="bg-amber-400 text-gray-900 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="mt-2.5 md:hidden">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن أدوية، فيتامينات، مستلزمات..."
              className="w-full bg-gray-50 focus:bg-white text-gray-800 text-xs pl-8 pr-10 py-2 rounded-xl border border-gray-200 focus:border-emerald-500 focus:outline-none"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs font-semibold">
          <button
            onClick={() => {
              setSelectedCategory(null);
              setOnlyPrescriptionNeeded(null);
            }}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg transition-colors ${
              selectedCategory === null && onlyPrescriptionNeeded === null
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            كل المنتجات
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id === selectedCategory ? null : cat.id);
                setOnlyPrescriptionNeeded(null);
              }}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{cat.nameAr}</span>
            </button>
          ))}

          {/* Filter for Prescription required */}
          <button
            onClick={() => {
              setOnlyPrescriptionNeeded(onlyPrescriptionNeeded === true ? null : true);
              setSelectedCategory(null);
            }}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
              onlyPrescriptionNeeded === true
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>أدوية بوصفة طبية</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-2 shadow-lg">
          <div className="text-xs font-bold text-gray-500 mb-1">الوصول السريع:</div>
          <button
            onClick={() => {
              onOpenPrescriptionModal();
              setMobileMenuOpen(false);
            }}
            className="w-full text-right px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>طلب دواء عبر الوصفة الطبية</span>
            </span>
            <span className="text-[10px] bg-emerald-200/80 px-2 py-0.5 rounded-full">سريع</span>
          </button>

          <button
            onClick={() => {
              onOpenOrdersModal();
              setMobileMenuOpen(false);
            }}
            className="w-full text-right px-3 py-2 rounded-lg bg-gray-50 text-gray-800 text-xs font-semibold flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              <span>متابعة حالة طلباتي</span>
            </span>
          </button>

          <a
            href="https://wa.me/967770075032"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-right px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span>مراسلة الصيدلاني عبر واتساب</span>
            </span>
            <span className="font-mono text-[11px]">+967770075032</span>
          </a>

          {isPharmacist && (
            <button
              onClick={() => {
                onOpenAdminModal();
                setMobileMenuOpen(false);
              }}
              className="w-full text-right px-3 py-2 rounded-lg bg-teal-800 text-white text-xs font-bold flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                <span>{isAdmin ? 'لوحة إدارة الصيدلية' : 'لوحة مراجعة الصيدلاني'}</span>
              </span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
