import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import {
  Product,
  Category,
  Order,
  OrderStatus,
  PrescriptionStatus,
  DeliveryArea,
  Coupon,
} from '../types/pharmacy';
import { formatYER, getWhatsAppOrderUrl } from '../utils/pharmacy';
import {
  X,
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  Tags,
  Truck,
  Percent,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  MessageCircle,
  TrendingUp,
  DollarSign,
  Printer,
  ShieldCheck,
  Stethoscope,
  Filter,
} from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

type AdminTab =
  | 'overview'
  | 'orders'
  | 'prescriptions'
  | 'products'
  | 'categories'
  | 'delivery'
  | 'coupons';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    orders,
    updateOrderStatus,
    prescriptions,
    reviewPrescription,
    deliveryAreas,
    updateDeliveryAreaFee,
    coupons,
    addCoupon,
    userRole,
    setUserRole,
    isAdmin,
    isPharmacist,
    showToast,
  } = usePharmacy();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [productSearch, setProductSearch] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');

  // Product Add/Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Pharmacist review prescription modal state
  const [reviewingPrescriptionId, setReviewingPrescriptionId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  // New Category State
  const [newCatNameAr, setNewCatNameAr] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');

  // New Coupon State
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState<number>(10);
  const [newCouponMin, setNewCouponMin] = useState<number>(5000);

  if (!isOpen) return null;

  // KPI Calculations
  const totalOrdersCount = orders.length;
  const newOrdersCount = orders.filter((o) => o.status === 'طلب جديد').length;
  const completedOrdersCount = orders.filter((o) => o.status === 'تم التسليم').length;
  const totalSalesYER = orders.reduce((sum, o) => (o.status !== 'تم الإلغاء' ? sum + o.totalAmount : sum), 0);
  const availableProductsCount = products.filter((p) => p.stock > 0 && p.isAvailable).length;
  const lowStockProducts = products.filter((p) => p.stock <= 15);
  const pendingPrescriptionsCount = prescriptions.filter((p) => p.status === 'جديد' || p.status === 'قيد التدقيق').length;

  const filteredOrders = orders.filter((o) => {
    if (orderFilterStatus === 'all') return true;
    return o.status === orderFilterStatus;
  });

  const filteredProducts = products.filter(
    (p) =>
      p.nameAr.includes(productSearch) ||
      p.nameEn.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.scientificName.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const productData = {
      nameAr: formData.get('nameAr') as string,
      nameEn: formData.get('nameEn') as string,
      scientificName: formData.get('scientificName') as string,
      activeIngredient: formData.get('activeIngredient') as string,
      manufacturer: formData.get('manufacturer') as string,
      category: formData.get('category') as string,
      packageSize: formData.get('packageSize') as string,
      strength: formData.get('strength') as string,
      price: Number(formData.get('price')),
      discountPrice: formData.get('discountPrice') ? Number(formData.get('discountPrice')) : undefined,
      stock: Number(formData.get('stock')),
      description: formData.get('description') as string,
      indications: formData.get('indications') as string,
      dosage: formData.get('dosage') as string,
      imageUrl: (formData.get('imageUrl') as string) || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
      requiresPrescription: formData.get('requiresPrescription') === 'true',
      isAvailable: formData.get('isAvailable') === 'true',
      isFeatured: formData.get('isFeatured') === 'true',
      isBestSeller: formData.get('isBestSeller') === 'true',
      expiryDate: formData.get('expiryDate') as string,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }

    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameAr.trim() || !newCatNameEn.trim()) return;
    addCategory({
      nameAr: newCatNameAr.trim(),
      nameEn: newCatNameEn.trim(),
      icon: 'Pill',
      description: 'تصنيف صيدلاني جديد',
      order: categories.length + 1,
    });
    setNewCatNameAr('');
    setNewCatNameEn('');
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    addCoupon({
      code: newCouponCode.trim().toUpperCase(),
      discountPercentage: Number(newCouponDiscount),
      minOrder: Number(newCouponMin),
      isActive: true,
      description: `خصم ${newCouponDiscount}% للطلبات فوق ${newCouponMin} ر.ي`,
    });
    setNewCouponCode('');
  };

  const handlePrescriptionAction = (id: string, status: PrescriptionStatus) => {
    reviewPrescription(id, status, reviewNotes || (status === 'تمت الموافقة' ? 'تمت مراجعة الوصفة وجاهزة للصرف' : 'مرفوضة لعدم وضوح الروشتة أو انتهاء صلاحيتها'));
    setReviewingPrescriptionId(null);
    setReviewNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 text-right">
      <div className="relative bg-white rounded-3xl w-full max-w-6xl h-[95vh] shadow-2xl overflow-hidden border border-emerald-100 flex flex-col">
        {/* Top Navbar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-700/80 rounded-xl">
              <Stethoscope className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg">
                لوحة التحكم الإدارية والصيدلانية - صيدلية ذو ريدان
              </h3>
              <p className="text-xs text-emerald-300">
                إدارة الطلبات، الأدوية، الوصفات، والمخزون في مدينة إب واليمن
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block px-3 py-1 bg-emerald-800/80 rounded-full text-xs font-bold border border-emerald-500/40">
              الدور الحالي: {userRole === 'admin' ? 'مدير عام النظام' : 'صيدلاني مناوب'}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50/80 px-4 flex items-center gap-2 overflow-x-auto text-xs font-bold no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-700 font-black'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>نظرة عامة ومؤشرات الأداء</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-emerald-600 text-emerald-700 font-black'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>إدارة الطلبات ({orders.length})</span>
            {newOrdersCount > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px]">
                {newOrdersCount} جديد
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'prescriptions'
                ? 'border-emerald-600 text-emerald-700 font-black'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>تدقيق الوصفات الطبية ({prescriptions.length})</span>
            {pendingPrescriptionsCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px]">
                {pendingPrescriptionsCount} معلق
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'products'
                ? 'border-emerald-600 text-emerald-700 font-black'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>كتالوج الأدوية والمنتجات ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'categories'
                ? 'border-emerald-600 text-emerald-700 font-black'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Tags className="w-4 h-4" />
            <span>التصنيفات ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('delivery')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'delivery'
                ? 'border-emerald-600 text-emerald-700 font-black'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>تسعيرة التوصيل للمناطق ({deliveryAreas.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'coupons'
                ? 'border-emerald-600 text-emerald-700 font-black'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>كوبونات الخصم ({coupons.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-1">
                  <div className="flex items-center justify-between text-emerald-700 text-xs font-bold">
                    <span>إجمالي المبيعات (ر.ي)</span>
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-950 font-mono">
                    {formatYER(totalSalesYER)}
                  </div>
                  <span className="text-[10px] text-emerald-600 block">من {orders.length} طلبات مسجلة</span>
                </div>

                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-1">
                  <div className="flex items-center justify-between text-blue-700 text-xs font-bold">
                    <span>إجمالي الطلبات</span>
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-blue-950 font-mono">
                    {totalOrdersCount}
                  </div>
                  <span className="text-[10px] text-blue-600 block">
                    {completedOrdersCount} مسلّم • {newOrdersCount} قيد المعالجة
                  </span>
                </div>

                <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100 space-y-1">
                  <div className="flex items-center justify-between text-teal-700 text-xs font-bold">
                    <span>المنتجات بالمخزن</span>
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-teal-950 font-mono">
                    {availableProductsCount}
                  </div>
                  <span className="text-[10px] text-teal-600 block">جاهزة للطلب والصرف</span>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 space-y-1">
                  <div className="flex items-center justify-between text-amber-700 text-xs font-bold">
                    <span>تنبيه نواقص المخزون</span>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-amber-950 font-mono">
                    {lowStockProducts.length}
                  </div>
                  <span className="text-[10px] text-amber-600 block">أدوية تتطلب إعادة طلب من الموردين</span>
                </div>
              </div>

              {/* Low Stock Warning Section */}
              {lowStockProducts.length > 0 && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>قائمة الأدوية والمستلزمات قليلة المخزون (تحتاج توريد):</span>
                    </h4>
                    <button
                      onClick={() => setActiveTab('products')}
                      className="text-xs text-amber-800 font-bold hover:underline"
                    >
                      تعديل الكميات في الكتالوج ➔
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {lowStockProducts.slice(0, 6).map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 bg-white rounded-xl border border-amber-100 flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-gray-800 truncate">{item.nameAr}</span>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-black shrink-0">
                          متبقي {item.stock}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Orders Overview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs sm:text-sm text-gray-800">
                    أحدث الطلبات الواردة للصيدلية:
                  </h4>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-emerald-700 font-bold hover:underline"
                  >
                    عرض جميع الطلبات ({orders.length}) ➔
                  </button>
                </div>

                <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100 text-xs">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="p-3 sm:p-4 bg-white flex flex-wrap items-center justify-between gap-3 hover:bg-gray-50"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-800">{order.orderNumber}</span>
                          <span className="font-bold text-gray-800">{order.customerName}</span>
                          <span className="text-gray-400 font-mono" dir="ltr">{order.phone}</span>
                        </div>
                        <span className="text-[11px] text-gray-500 block mt-0.5">
                          {order.governorate} - {order.district} • {order.items.length} أصناف
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-emerald-900">
                          {formatYER(order.totalAmount)}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="font-bold text-sm text-gray-900">
                  إدارة طلبات العملاء والتوصيل:
                </h4>

                {/* Filter by status */}
                <div className="flex items-center gap-2 text-xs">
                  <Filter className="w-3.5 h-3.5 text-gray-400" />
                  <select
                    value={orderFilterStatus}
                    onChange={(e) => setOrderFilterStatus(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-800"
                  >
                    <option value="all">جميع الحالات</option>
                    <option value="طلب جديد">طلب جديد</option>
                    <option value="قيد المراجعة">قيد المراجعة</option>
                    <option value="تم تأكيد الطلب">تم تأكيد الطلب</option>
                    <option value="جارٍ تجهيز الطلب">جارٍ تجهيز الطلب</option>
                    <option value="خرج للتوصيل">خرج للتوصيل</option>
                    <option value="تم التسليم">تم التسليم</option>
                    <option value="تم الإلغاء">تم الإلغاء</option>
                  </select>
                </div>
              </div>

              <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-400">
                    لا توجد طلبات تطابق هذا التصنيف.
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <div key={order.id} className="p-4 bg-white hover:bg-gray-50/80 transition-colors space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-mono font-bold text-xs rounded-lg">
                            {order.orderNumber}
                          </span>
                          <div>
                            <span className="font-black text-gray-900 text-sm block">
                              {order.customerName}
                            </span>
                            <span className="text-gray-500 text-xs font-mono" dir="ltr">
                              {order.phone}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Direct WhatsApp Contact Button */}
                          <a
                            href={`https://wa.me/${order.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                              `مرحباً بك يا ${order.customerName}، نتواصل معك من صيدلية ذو ريدان بخصوص طلبك رقم: *${order.orderNumber}*.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors text-xs font-bold flex items-center gap-1"
                            title="مراسلة العميل عبر واتساب"
                          >
                            <MessageCircle className="w-4 h-4 text-emerald-600" />
                            <span className="hidden sm:inline">واتساب</span>
                          </a>

                          {/* Status Selector */}
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-emerald-500"
                          >
                            <option value="طلب جديد">طلب جديد</option>
                            <option value="قيد المراجعة">قيد المراجعة</option>
                            <option value="تم تأكيد الطلب">تم تأكيد الطلب</option>
                            <option value="جارٍ تجهيز الطلب">جارٍ تجهيز الطلب</option>
                            <option value="خرج للتوصيل">خرج للتوصيل</option>
                            <option value="تم التسليم">تم التسليم</option>
                            <option value="تم الإلغاء">تم الإلغاء</option>
                          </select>
                        </div>
                      </div>

                      {/* Location & Items Summary */}
                      <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-gray-500">العنوان:</span>
                          <span className="font-semibold text-gray-800">
                            {order.governorate} - {order.district} ({order.detailedAddress})
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">الأدوية المطلوبة:</span>
                          <span className="text-gray-700">
                            {order.items.map((i) => `${i.nameAr} × ${i.quantity}`).join(' • ')}
                          </span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-gray-200 font-bold">
                          <span>المجموع الإجمالي:</span>
                          <span className="text-emerald-800 font-black">{formatYER(order.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PRESCRIPTIONS REVIEW */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-gray-900">
                  مراجعة وتدقيق الوصفات الطبية (عيادة الصيدلاني):
                </h4>
                <span className="text-xs text-gray-500">
                  {prescriptions.length} روشتة مسجلة
                </span>
              </div>

              {prescriptions.length === 0 ? (
                <div className="p-10 text-center border-2 border-dashed border-gray-200 rounded-2xl space-y-2">
                  <FileText className="w-8 h-8 text-gray-300 mx-auto" />
                  <p className="text-xs font-bold text-gray-600">لا توجد وصفات طبية مرفوعة حالياً</p>
                  <p className="text-[11px] text-gray-400">
                    يمكن للعملاء رفع الروشتات من الواجهة الرئيسية وسيتم تدقيقها هنا فورياً.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prescriptions.map((rx) => (
                    <div
                      key={rx.id}
                      className="p-4 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-gray-900">{rx.customerName}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                              rx.status === 'تمت الموافقة'
                                ? 'bg-emerald-100 text-emerald-800'
                                : rx.status === 'مرفوضة'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {rx.status}
                          </span>
                        </div>

                        <div className="text-xs text-gray-500 space-y-0.5">
                          <p>الهاتف: <span className="font-mono text-gray-800" dir="ltr">{rx.phone}</span></p>
                          {rx.patientAge && <p>العمر: <span className="text-gray-800">{rx.patientAge}</span></p>}
                          {rx.notes && <p>ملاحظات المريض: <span className="text-gray-800 font-medium">{rx.notes}</span></p>}
                        </div>

                        {/* Image Preview */}
                        <div className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50 p-2 text-center">
                          <img
                            src={rx.imageUrl}
                            alt="Prescription"
                            className="max-h-48 mx-auto rounded-lg object-contain cursor-pointer"
                            onClick={() => window.open(rx.imageUrl, '_blank')}
                          />
                          <span className="text-[10px] text-gray-400 block mt-1">اضغط للتكبير</span>
                        </div>

                        {rx.pharmacistNotes && (
                          <div className="p-2.5 bg-emerald-50 rounded-xl text-xs text-emerald-900">
                            <span className="font-bold block">ملاحظات الصيدلاني المعتمدة:</span>
                            <span>{rx.pharmacistNotes}</span>
                          </div>
                        )}
                      </div>

                      {/* Review Actions */}
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                        <a
                          href={`https://wa.me/${rx.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `مرحباً بك يا ${rx.customerName}، معك د. صيدلي صيدلية ذو ريدان بخصوص الوصفة الطبية التي أرفقتها.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>تواصل واتساب</span>
                        </a>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handlePrescriptionAction(rx.id, 'تمت الموافقة')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>موافقة وصرف</span>
                          </button>
                          <button
                            onClick={() => handlePrescriptionAction(rx.id, 'مرفوضة')}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>رفض</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PRODUCTS CATALOG MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="ابحث بالاسم العربي أو الإنجليزي أو المادة..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 pr-9 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة دواء / منتج جديد</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-right text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                    <tr>
                      <th className="p-3">المنتج</th>
                      <th className="p-3">المصنّع</th>
                      <th className="p-3">التركيز</th>
                      <th className="p-3">السعر (ر.ي)</th>
                      <th className="p-3">المخزون</th>
                      <th className="p-3">نوع الصرف</th>
                      <th className="p-3 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={p.imageUrl}
                              alt={p.nameAr}
                              className="w-9 h-9 rounded-lg object-contain bg-gray-50 border border-gray-100 p-0.5"
                            />
                            <div>
                              <span className="font-bold text-gray-900 block truncate max-w-[200px]">
                                {p.nameAr}
                              </span>
                              <span className="text-[10px] text-gray-400 block truncate max-w-[200px]">
                                {p.nameEn}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-gray-700">{p.manufacturer}</td>
                        <td className="p-3 text-gray-700 font-mono">{p.strength}</td>
                        <td className="p-3 font-mono font-black text-emerald-800">
                          {formatYER(p.discountPrice ?? p.price)}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded font-black text-[11px] ${
                              p.stock > 10
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'bg-rose-50 text-rose-800'
                            }`}
                          >
                            {p.stock}
                          </span>
                        </td>
                        <td className="p-3">
                          {p.requiresPrescription ? (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                              بوصفة
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                              حر
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setIsProductModalOpen(true);
                              }}
                              className="p-1.5 hover:bg-gray-100 rounded-lg text-emerald-700"
                              title="تعديل المنتج"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من حذف ${p.nameAr}؟`)) {
                                  deleteProduct(p.id);
                                }
                              }}
                              className="p-1.5 hover:bg-gray-100 rounded-lg text-rose-600"
                              title="حذف المنتج"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              {/* Add category form */}
              <form onSubmit={handleCreateCategory} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                <h4 className="font-bold text-xs text-gray-800">إضافة تصنيف دوائي جديد:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    value={newCatNameAr}
                    onChange={(e) => setNewCatNameAr(e.target.value)}
                    placeholder="اسم التصنيف بالعربية (مثال: أدوية القلب)"
                    className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    required
                    value={newCatNameEn}
                    onChange={(e) => setNewCatNameEn(e.target.value)}
                    placeholder="Category Name in English"
                    className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-sans"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    إضافة التصنيف
                  </button>
                </div>
              </form>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-3.5 bg-white border border-gray-200 rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">{cat.nameAr}</span>
                      <span className="text-[10px] text-gray-400 block font-sans">{cat.nameEn}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold block mt-1">
                        {products.filter((p) => p.category === cat.id).length} منتج
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`حذف تصنيف ${cat.nameAr}؟`)) deleteCategory(cat.id);
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: DELIVERY TARIFFS */}
          {activeTab === 'delivery' && (
            <div className="space-y-4">
              <h4 className="font-bold text-xs sm:text-sm text-gray-800">
                تسعيرة وأوقات التوصيل حسب المناطق والمحافظات اليمنية:
              </h4>

              <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
                {deliveryAreas.map((area) => (
                  <div key={area.id} className="p-4 bg-white flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded">
                          {area.governorate}
                        </span>
                        <span className="font-bold text-xs text-gray-900">{area.areaName}</span>
                      </div>
                      <span className="text-[11px] text-gray-400 block mt-1">
                        الوقت المقدر: {area.estimatedHours}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">الرسوم (ر.ي):</span>
                      <input
                        type="number"
                        defaultValue={area.fee}
                        onBlur={(e) => updateDeliveryAreaFee(area.id, Number(e.target.value))}
                        className="w-24 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs font-mono font-bold text-emerald-800 text-center"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              {/* Add Coupon Form */}
              <form onSubmit={handleCreateCoupon} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                <h4 className="font-bold text-xs text-gray-800">إنشاء كوبون خصم جديد:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    required
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    placeholder="كود الكوبون (مثل IBB20)"
                    className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 uppercase font-mono"
                  />
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={newCouponDiscount}
                    onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                    placeholder="نسبة الخصم %"
                    className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="number"
                    required
                    value={newCouponMin}
                    onChange={(e) => setNewCouponMin(Number(e.target.value))}
                    placeholder="الحد الأدنى للطلب (ر.ي)"
                    className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    إضافة الكوبون
                  </button>
                </div>
              </form>

              {/* Coupons List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {coupons.map((coupon) => (
                  <div key={coupon.code} className="p-4 bg-white border border-emerald-200 rounded-2xl shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-sm text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {coupon.code}
                      </span>
                      <span className="text-xs font-black text-emerald-700">
                        خصم {coupon.discountPercentage}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{coupon.description}</p>
                    <span className="text-[10px] text-gray-400 block">
                      الحد الأدنى: {formatYER(coupon.minOrder)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Product Add / Edit Modal Sub-dialog */}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 text-right">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl border border-emerald-100">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-bold text-sm text-gray-900">
                  {editingProduct ? 'تعديل بيانات الدواء / المنتج' : 'إضافة دواء / منتج جديد للكتالوج'}
                </h4>
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">الاسم بالعربية: *</label>
                    <input
                      name="nameAr"
                      required
                      defaultValue={editingProduct?.nameAr}
                      placeholder="مثال: باراسيتامول 500 مجم"
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">الاسم بالإنجليزية: *</label>
                    <input
                      name="nameEn"
                      required
                      defaultValue={editingProduct?.nameEn}
                      placeholder="Paracetamol 500mg"
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2 font-sans"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">الاسم العلمي: *</label>
                    <input
                      name="scientificName"
                      required
                      defaultValue={editingProduct?.scientificName}
                      placeholder="Acetaminophen"
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2 font-sans"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">المادة الفعالة: *</label>
                    <input
                      name="activeIngredient"
                      required
                      defaultValue={editingProduct?.activeIngredient}
                      placeholder="باراسيتامول 500 ملغ"
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">الشركة المصنعة: *</label>
                    <input
                      name="manufacturer"
                      required
                      defaultValue={editingProduct?.manufacturer}
                      placeholder="مثال: جلاكسو، باير، فارما..."
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">التصنيف: *</label>
                    <select
                      name="category"
                      defaultValue={editingProduct?.category || categories[0]?.id}
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nameAr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">سعر البيع (ر.ي): *</label>
                    <input
                      name="price"
                      type="number"
                      required
                      defaultValue={editingProduct?.price || 2000}
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">سعر التخفيض (اختياري):</label>
                    <input
                      name="discountPrice"
                      type="number"
                      defaultValue={editingProduct?.discountPrice}
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">المخزون المتوفر: *</label>
                    <input
                      name="stock"
                      type="number"
                      required
                      defaultValue={editingProduct?.stock ?? 50}
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">التركيز: *</label>
                    <input
                      name="strength"
                      required
                      defaultValue={editingProduct?.strength || '500mg'}
                      placeholder="مثال: 500mg, 1g, 100ml"
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">حجم العبوة: *</label>
                    <input
                      name="packageSize"
                      required
                      defaultValue={editingProduct?.packageSize || '20 قرص'}
                      placeholder="مثال: 20 قرص / 100 مل"
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">تاريخ الانتهاء:</label>
                    <input
                      name="expiryDate"
                      defaultValue={editingProduct?.expiryDate || '2027-12'}
                      placeholder="2027-12"
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-gray-700 block mb-1">رابط صورة المنتج (URL):</label>
                    <input
                      name="imageUrl"
                      defaultValue={editingProduct?.imageUrl}
                      placeholder="https://..."
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-gray-700 block mb-1">الوصف الطبي:</label>
                    <textarea
                      name="description"
                      rows={2}
                      defaultValue={editingProduct?.description}
                      placeholder="تفاصيل واستخدامات الدواء..."
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-gray-700 block mb-1">دواعي الاستعمال:</label>
                    <input
                      name="indications"
                      defaultValue={editingProduct?.indications}
                      placeholder="الصداع، آلام المفاصل، نزلات البرد..."
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-gray-700 block mb-1">إرشادات الجرعة:</label>
                    <input
                      name="dosage"
                      defaultValue={editingProduct?.dosage}
                      placeholder="قرص واحد كل 8 ساعات بعد الأكل..."
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2"
                    />
                  </div>

                  <div className="sm:col-span-2 flex flex-wrap gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="requiresPrescription"
                        value="true"
                        defaultChecked={editingProduct?.requiresPrescription}
                        className="rounded text-emerald-600"
                      />
                      <span className="font-bold text-amber-800">يتطلب وصفة طبية (روشتة)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isAvailable"
                        value="true"
                        defaultChecked={editingProduct?.isAvailable ?? true}
                        className="rounded text-emerald-600"
                      />
                      <span className="font-semibold text-gray-700">متوفر للطلب</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isFeatured"
                        value="true"
                        defaultChecked={editingProduct?.isFeatured}
                        className="rounded text-emerald-600"
                      />
                      <span className="font-semibold text-gray-700">دواء مميز</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isBestSeller"
                        value="true"
                        defaultChecked={editingProduct?.isBestSeller}
                        className="rounded text-emerald-600"
                      />
                      <span className="font-semibold text-gray-700">الأكثر مبيعاً</span>
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                  >
                    حفظ الدواء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
