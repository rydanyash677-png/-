export type OrderStatus =
  | 'طلب جديد'
  | 'قيد المراجعة'
  | 'تم تأكيد الطلب'
  | 'جارٍ تجهيز الطلب'
  | 'خرج للتوصيل'
  | 'تم التسليم'
  | 'تم الإلغاء';

export type PrescriptionStatus =
  | 'جديد'
  | 'قيد التدقيق'
  | 'تمت الموافقة'
  | 'مرفوضة'
  | 'تم التجهيز';

export type UserRole = 'customer' | 'pharmacist' | 'admin';

export interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  scientificName: string;
  activeIngredient: string;
  manufacturer: string;
  category: string;
  packageSize: string;
  strength: string;
  price: number;
  discountPrice?: number;
  stock: number;
  description: string;
  indications?: string;
  dosage?: string;
  imageUrl: string;
  requiresPrescription: boolean;
  isAvailable: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  expiryDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  description?: string;
  order?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DeliveryArea {
  id: string;
  governorate: string;
  areaName: string;
  fee: number;
  estimatedHours: string;
  isFreeAvailable: boolean;
  minFreeAmount?: number;
  isActive: boolean;
}

export interface Coupon {
  code: string;
  discountPercentage: number;
  minOrder: number;
  isActive: boolean;
  description: string;
}

export interface OrderItem {
  productId: string;
  nameAr: string;
  nameEn: string;
  price: number;
  quantity: number;
  subtotal: number;
  requiresPrescription: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  phone: string;
  governorate: string;
  district: string;
  detailedAddress: string;
  deliveryNotes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  currency: 'YER';
  paymentMethod: 'cash_on_delivery' | 'bank_transfer' | 'kuraimi_jawali';
  status: OrderStatus;
  orderedViaWhatsApp: boolean;
  hasPrescriptionItems: boolean;
  prescriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  customerId?: string;
  customerName: string;
  phone: string;
  patientAge?: string;
  imageUrl: string;
  notes?: string;
  status: PrescriptionStatus;
  pharmacistNotes?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PharmacySettings {
  pharmacyNameAr: string;
  pharmacyNameEn: string;
  location: string;
  whatsApp: string;
  phone: string;
  slogan: string;
  isOpen: boolean;
  emergencyNotice?: string;
}
