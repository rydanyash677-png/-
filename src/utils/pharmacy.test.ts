import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatYER,
  generateOrderNumber,
  calculateCartTotals,
  hasPrescriptionItem,
  validateYemeniPhone,
  generateWhatsAppOrderMessage,
} from './pharmacy';
import { CartItem, Coupon, Order, Product } from '../types/pharmacy';

test('formatYER formats amounts with Yemeni Rial symbol', () => {
  const result = formatYER(2500);
  assert.ok(result.includes('ر.ي'));
  assert.ok(result.includes('2,500') || result.includes('٢٬٥٠٠') || result.includes('2500'));
});

test('generateOrderNumber generates unique valid RAY prefix numbers', () => {
  const num1 = generateOrderNumber();
  const num2 = generateOrderNumber();
  assert.ok(num1.startsWith('RAY-'));
  assert.ok(num2.startsWith('RAY-'));
  assert.notEqual(num1, num2);
});

test('calculateCartTotals computes subtotal, coupon discounts and final total correctly', () => {
  const mockProduct1: Product = {
    id: 'p1',
    nameAr: 'بنادول إكسترا',
    nameEn: 'Panadol Extra',
    scientificName: 'Paracetamol + Caffeine',
    activeIngredient: 'Paracetamol 500mg, Caffeine 65mg',
    manufacturer: 'GSK',
    category: 'c1',
    packageSize: '24 قرص',
    strength: '500mg',
    price: 3000,
    stock: 50,
    description: 'مسكن للآلام وخافض للحرارة',
    imageUrl: '',
    requiresPrescription: false,
    isAvailable: true,
  };

  const mockProduct2: Product = {
    id: 'p2',
    nameAr: 'فيتامين سي فوار',
    nameEn: 'Vitamin C Effervescent',
    scientificName: 'Ascorbic Acid',
    activeIngredient: 'Vitamin C 1000mg',
    manufacturer: 'Bayer',
    category: 'c2',
    packageSize: '10 أقراص',
    strength: '1000mg',
    price: 4000,
    discountPrice: 3500, // discounted price
    stock: 20,
    description: 'مكمل لتقوية المناعة',
    imageUrl: '',
    requiresPrescription: false,
    isAvailable: true,
  };

  const items: CartItem[] = [
    { product: mockProduct1, quantity: 2 }, // 2 * 3000 = 6000
    { product: mockProduct2, quantity: 1 }, // 1 * 3500 = 3500
  ];

  // Total subtotal = 9500
  const coupon: Coupon = {
    code: 'RAYDAN10',
    discountPercentage: 10,
    minOrder: 5000,
    isActive: true,
    description: 'خصم 10%',
  };

  const totals = calculateCartTotals(items, 1000, coupon);
  assert.equal(totals.subtotal, 9500);
  assert.equal(totals.discount, 950); // 10% of 9500
  assert.equal(totals.deliveryFee, 1000);
  assert.equal(totals.totalAmount, 9500 - 950 + 1000); // 9550
});

test('hasPrescriptionItem identifies prescription requirements', () => {
  const safeItem: CartItem = {
    product: {
      id: 'p1',
      nameAr: 'فيتامينات',
      nameEn: 'Vitamins',
      scientificName: 'Multivitamin',
      activeIngredient: 'Zinc + C',
      manufacturer: 'Bayer',
      category: 'vitamins',
      packageSize: '30 كبسولة',
      strength: '500mg',
      price: 2000,
      stock: 10,
      description: '',
      imageUrl: '',
      requiresPrescription: false,
      isAvailable: true,
    },
    quantity: 1,
  };

  const prescriptionItem: CartItem = {
    product: {
      id: 'p2',
      nameAr: 'أوجمنتين 1 جم',
      nameEn: 'Augmentin 1g',
      scientificName: 'Amoxicillin + Clavulanate',
      activeIngredient: 'Amoxicillin 875mg, Clavulanic Acid 125mg',
      manufacturer: 'GSK',
      category: 'antibiotics',
      packageSize: '14 قرص',
      strength: '1g',
      price: 8000,
      stock: 15,
      description: 'مضاد حيوي واسع المجال',
      imageUrl: '',
      requiresPrescription: true,
      isAvailable: true,
    },
    quantity: 1,
  };

  assert.equal(hasPrescriptionItem([safeItem]), false);
  assert.equal(hasPrescriptionItem([safeItem, prescriptionItem]), true);
});

test('validateYemeniPhone correctly identifies Yemeni phone numbers', () => {
  assert.equal(validateYemeniPhone('770075032'), true);
  assert.equal(validateYemeniPhone('0770075032'), true);
  assert.equal(validateYemeniPhone('+967770075032'), true);
  assert.equal(validateYemeniPhone('731234567'), true);
  assert.equal(validateYemeniPhone('780987654'), true);
  assert.equal(validateYemeniPhone('712345678'), true);
  assert.equal(validateYemeniPhone('123456'), false);
  assert.equal(validateYemeniPhone('abc'), false);
});

test('generateWhatsAppOrderMessage formats complete order details for +967770075032', () => {
  const mockOrder: Order = {
    id: 'ord_1',
    orderNumber: 'RAY-2026-1234',
    customerName: 'أحمد علي',
    phone: '770075032',
    governorate: 'إب',
    district: 'شارع مفرق ميتم',
    detailedAddress: 'بجوار مدرسة النصر، عمارة الأمل الدور الثاني',
    items: [
      {
        productId: 'p1',
        nameAr: 'بنادول إكسترا',
        nameEn: 'Panadol Extra',
        price: 2500,
        quantity: 2,
        subtotal: 5000,
        requiresPrescription: false,
      },
    ],
    subtotal: 5000,
    deliveryFee: 500,
    discount: 0,
    totalAmount: 5500,
    currency: 'YER',
    paymentMethod: 'cash_on_delivery',
    status: 'طلب جديد',
    orderedViaWhatsApp: true,
    hasPrescriptionItems: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const message = generateWhatsAppOrderMessage(mockOrder);
  assert.ok(message.includes('صيدلية ذو ريدان'));
  assert.ok(message.includes('RAY-2026-1234'));
  assert.ok(message.includes('أحمد علي'));
  assert.ok(message.includes('بنادول إكسترا'));
  assert.ok(message.includes('شارع مفرق ميتم'));
});
