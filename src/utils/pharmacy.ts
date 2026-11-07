import { CartItem, Coupon, Order } from '../types/pharmacy';

/**
 * Format currency in Yemeni Rial (YER)
 */
export function formatYER(amount: number): string {
  const rounded = Math.round(amount || 0);
  return `${rounded.toLocaleString('ar-YE')} ر.ي`;
}

/**
 * Generate a unique, professional order number
 * Example: RAY-2026-9842
 */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `RAY-${year}-${randomSuffix}`;
}

/**
 * Check if the cart contains any prescription-required medicines
 */
export function hasPrescriptionItem(items: CartItem[]): boolean {
  return items.some(item => item.product.requiresPrescription);
}

/**
 * Calculate cart subtotal, discount, delivery, and total in YER
 */
export function calculateCartTotals(
  items: CartItem[],
  deliveryFee: number = 0,
  coupon?: Coupon | null
) {
  const subtotal = items.reduce((acc, item) => {
    const itemPrice = item.product.discountPrice ?? item.product.price;
    return acc + itemPrice * item.quantity;
  }, 0);

  let discount = 0;
  if (coupon && coupon.isActive && subtotal >= (coupon.minOrder || 0)) {
    discount = Math.round((subtotal * coupon.discountPercentage) / 100);
  }

  const finalDeliveryFee = Math.max(0, deliveryFee);
  const totalAmount = Math.max(0, subtotal - discount + finalDeliveryFee);

  return {
    subtotal,
    discount,
    deliveryFee: finalDeliveryFee,
    totalAmount,
  };
}

/**
 * Format a polite, professional WhatsApp message for Dhu Raydan Pharmacy orders
 * Integrates official number +967770075032
 */
export function generateWhatsAppOrderMessage(order: Order): string {
  const itemsText = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.nameAr}* × ${item.quantity} (${formatYER(item.subtotal)})`
    )
    .join('\n');

  const message = `السلام عليكم ورحمة الله وبركاته،
أود تأكيد طلبي من *صيدلية ذو ريدان* 🏥

📋 *رقم الطلب:* ${order.orderNumber}
👤 *اسم العميل:* ${order.customerName}
📱 *رقم الهاتف:* ${order.phone}
📍 *العنوان:* محافظة ${order.governorate} - ${order.district}
🏠 *تفاصيل العنوان:* ${order.detailedAddress}
${order.deliveryNotes ? `📝 *ملاحظات التوصيل:* ${order.deliveryNotes}\n` : ''}
🛒 *المنتجات المطلوبة:*
${itemsText}

━━━━━━━━━━━━━━━━━━━━
💰 *المجموع الفرعي:* ${formatYER(order.subtotal)}
🚚 *رسوم التوصيل:* ${formatYER(order.deliveryFee)}
${order.discount > 0 ? `🎁 *الخصم:* -${formatYER(order.discount)}\n` : ''}
✨ *المبلغ الإجمالي:* *${formatYER(order.totalAmount)}*
💳 *طريقة الدفع:* ${
    order.paymentMethod === 'cash_on_delivery'
      ? 'الدفع عند الاستلام'
      : order.paymentMethod === 'kuraimi_jawali'
      ? 'تحويل عبر الكريمي / جوالي / ون كاش'
      : 'تحويل بنكي'
  }

${order.hasPrescriptionItems ? '⚠️ *ملاحظة:* يحتوي الطلب على أدوية تتطلب وصفة طبية وتم إرفاقها للمراجعة.\n' : ''}
شاكرين لكم حسن الرعاية، وبانتظار تأكيد التجهيز والتوصيل.`;

  return message;
}

/**
 * Get direct WhatsApp ordering link
 */
export function getWhatsAppOrderUrl(order: Order, phone: string = '967770075032'): string {
  const text = encodeURIComponent(generateWhatsAppOrderMessage(order));
  return `https://wa.me/${phone}?text=${text}`;
}

/**
 * Validate customer phone number (accepts standard Yemen mobile formats: 77..., 78..., 73..., 71..., 70...)
 */
export function validateYemeniPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  // Matches 77XXXXXXX, 78XXXXXXX, 73XXXXXXX, 71XXXXXXX, 70XXXXXXX (9 digits)
  // Or with 967 country code: 96777XXXXXXX (12 digits)
  // Or with leading 0: 077XXXXXXX (10 digits)
  return /^((\+?967)|0)?7[01378][0-9]{7}$/.test(cleaned);
}
