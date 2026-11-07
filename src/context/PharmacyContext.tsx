import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Product,
  Category,
  CartItem,
  Order,
  Prescription,
  DeliveryArea,
  Coupon,
  UserRole,
  PharmacySettings,
  OrderStatus,
  PrescriptionStatus,
} from '../types/pharmacy';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_DELIVERY_AREAS,
  INITIAL_COUPONS,
  INITIAL_SETTINGS,
} from '../data/initialData';
import {
  calculateCartTotals,
  generateOrderNumber,
  hasPrescriptionItem,
} from '../utils/pharmacy';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  testConnection,
} from '../services/firebase';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface PharmacyContextType {
  // Brand & Settings
  settings: PharmacySettings;
  updateSettings: (newSettings: Partial<PharmacySettings>) => Promise<void>;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Delivery Areas
  deliveryAreas: DeliveryArea[];
  updateDeliveryAreaFee: (id: string, fee: number) => Promise<void>;

  // Coupons
  coupons: Coupon[];
  addCoupon: (coupon: Coupon) => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  selectedDeliveryArea: DeliveryArea;
  setSelectedDeliveryArea: (area: DeliveryArea) => void;
  cartTotals: {
    subtotal: number;
    discount: number;
    deliveryFee: number;
    totalAmount: number;
  };
  cartHasPrescriptionItems: boolean;

  // Orders
  orders: Order[];
  createOrder: (orderData: {
    customerName: string;
    phone: string;
    governorate: string;
    district: string;
    detailedAddress: string;
    deliveryNotes?: string;
    paymentMethod: 'cash_on_delivery' | 'bank_transfer' | 'kuraimi_jawali';
    orderedViaWhatsApp: boolean;
    prescriptionId?: string;
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;

  // Prescriptions
  prescriptions: Prescription[];
  uploadPrescription: (prescriptionData: {
    customerName: string;
    phone: string;
    patientAge?: string;
    imageUrl: string;
    notes?: string;
  }) => Promise<Prescription>;
  reviewPrescription: (
    id: string,
    status: PrescriptionStatus,
    pharmacistNotes: string
  ) => Promise<void>;

  // Auth & Roles
  currentUser: FirebaseUser | null;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isPharmacist: boolean;

  // Filter & Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  onlyPrescriptionNeeded: boolean | null;
  setOnlyPrescriptionNeeded: (v: boolean | null) => void;

  // Language & UI
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  dismissToast: (id: string) => void;
}

const PharmacyContext = createContext<PharmacyContextType | undefined>(undefined);

const ADMIN_EMAIL = 'rydanyash677@gmail.com';

export const PharmacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Base State with Seed fallbacks
  const [settings, setSettings] = useState<PharmacySettings>(() => {
    const saved = localStorage.getItem('dhu_raydan_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const CATALOG_VERSION = 'v2_complete_inventory_69';
    const savedVersion = localStorage.getItem('dhu_raydan_catalog_version');
    const saved = localStorage.getItem('dhu_raydan_products');

    if (savedVersion !== CATALOG_VERSION || !saved) {
      localStorage.setItem('dhu_raydan_catalog_version', CATALOG_VERSION);
      localStorage.setItem('dhu_raydan_products', JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }

    try {
      const parsed: Product[] = JSON.parse(saved);
      const initialMap = new Map(INITIAL_PRODUCTS.map((p) => [p.id, p]));
      parsed.forEach((p) => {
        if (!initialMap.has(p.id)) {
          initialMap.set(p.id, p);
        }
      });
      return Array.from(initialMap.values());
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('dhu_raydan_categories');
    if (!saved) return INITIAL_CATEGORIES;
    try {
      const parsed: Category[] = JSON.parse(saved);
      if (parsed.length < INITIAL_CATEGORIES.length) {
        localStorage.setItem('dhu_raydan_categories', JSON.stringify(INITIAL_CATEGORIES));
        return INITIAL_CATEGORIES;
      }
      return parsed;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>(() => {
    const saved = localStorage.getItem('dhu_raydan_delivery_areas');
    return saved ? JSON.parse(saved) : INITIAL_DELIVERY_AREAS;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('dhu_raydan_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('dhu_raydan_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    const saved = localStorage.getItem('dhu_raydan_prescriptions');
    return saved ? JSON.parse(saved) : [];
  });

  // Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('dhu_raydan_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [selectedDeliveryArea, setSelectedDeliveryArea] = useState<DeliveryArea>(
    INITIAL_DELIVERY_AREAS[0]
  );

  // Auth & Roles
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('customer');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [onlyPrescriptionNeeded, setOnlyPrescriptionNeeded] = useState<boolean | null>(null);

  // UI Language & Toasts
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('dhu_raydan_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('dhu_raydan_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('dhu_raydan_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('dhu_raydan_delivery_areas', JSON.stringify(deliveryAreas));
  }, [deliveryAreas]);

  useEffect(() => {
    localStorage.setItem('dhu_raydan_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('dhu_raydan_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('dhu_raydan_prescriptions', JSON.stringify(prescriptions));
  }, [prescriptions]);

  useEffect(() => {
    localStorage.setItem('dhu_raydan_settings', JSON.stringify(settings));
  }, [settings]);

  // Auth listener & Firebase connection test
  useEffect(() => {
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user?.email === ADMIN_EMAIL) {
        setUserRole('admin');
      }
    });

    return () => unsubscribe();
  }, []);

  // Try fetching products from Firestore if available
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'products'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Product[] = [];
            snapshot.forEach((doc) => {
              list.push({ ...doc.data(), id: doc.id } as Product);
            });
            if (list.length > 0) {
              setProducts(list);
            }
          }
        },
        (error) => {
          // If offline or rule permission check, fallback gracefully to seed
          console.warn('Firestore snapshot listener for products:', error.message);
        }
      );
      return () => unsub();
    } catch {
      // Ignore
    }
  }, []);

  // Cart Management
  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });
    showToast(`تمت إضافة "${product.nameAr}" إلى السلة بنجاح 🛒`, 'success');
  }, [showToast]);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    showToast('تم حذف المنتج من السلة', 'info');
  }, [showToast]);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          const validQty = Math.min(item.product.stock, quantity);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedCoupon(null);
  }, []);

  const applyCoupon = useCallback((code: string): boolean => {
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find(c => c.code.toUpperCase() === cleanCode && c.isActive);
    if (!found) {
      showToast('كوبون الخصم غير صحيح أو منتهي الصلاحية', 'error');
      return false;
    }
    setAppliedCoupon(found);
    showToast(`تم تطبيق الكوبون "${found.code}" بنجاح! خصم ${found.discountPercentage}%`, 'success');
    return true;
  }, [coupons, showToast]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    showToast('تم إلغاء الكوبون', 'info');
  }, [showToast]);

  // Cart calculations
  const cartTotals = useMemo(() => {
    const deliveryFee = selectedDeliveryArea?.isFreeAvailable &&
      selectedDeliveryArea.minFreeAmount &&
      cart.reduce((s, i) => s + (i.product.discountPrice ?? i.product.price) * i.quantity, 0) >= selectedDeliveryArea.minFreeAmount
        ? 0
        : (selectedDeliveryArea?.fee || 0);

    return calculateCartTotals(cart, deliveryFee, appliedCoupon);
  }, [cart, selectedDeliveryArea, appliedCoupon]);

  const cartHasPrescriptionItems = useMemo(() => {
    return hasPrescriptionItem(cart);
  }, [cart]);

  // Order creation
  const createOrder = useCallback(
    async (orderData: {
      customerName: string;
      phone: string;
      governorate: string;
      district: string;
      detailedAddress: string;
      deliveryNotes?: string;
      paymentMethod: 'cash_on_delivery' | 'bank_transfer' | 'kuraimi_jawali';
      orderedViaWhatsApp: boolean;
      prescriptionId?: string;
    }): Promise<Order> => {
      const orderNumber = generateOrderNumber();
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();

      const items = cart.map(item => ({
        productId: item.product.id,
        nameAr: item.product.nameAr,
        nameEn: item.product.nameEn,
        price: item.product.discountPrice ?? item.product.price,
        quantity: item.quantity,
        subtotal: (item.product.discountPrice ?? item.product.price) * item.quantity,
        requiresPrescription: item.product.requiresPrescription,
      }));

      const newOrder: Order = {
        id: orderId,
        orderNumber,
        customerId: currentUser?.uid || 'guest',
        customerName: orderData.customerName,
        phone: orderData.phone,
        governorate: orderData.governorate,
        district: orderData.district,
        detailedAddress: orderData.detailedAddress,
        deliveryNotes: orderData.deliveryNotes,
        items,
        subtotal: cartTotals.subtotal,
        deliveryFee: cartTotals.deliveryFee,
        discount: cartTotals.discount,
        totalAmount: cartTotals.totalAmount,
        currency: 'YER',
        paymentMethod: orderData.paymentMethod,
        status: 'طلب جديد',
        orderedViaWhatsApp: orderData.orderedViaWhatsApp,
        hasPrescriptionItems: cartHasPrescriptionItems,
        prescriptionId: orderData.prescriptionId,
        createdAt: now,
        updatedAt: now,
      };

      // Optimistic state update
      setOrders(prev => [newOrder, ...prev]);

      // Deduct product stock locally
      setProducts(prev =>
        prev.map(p => {
          const orderedItem = items.find(i => i.productId === p.id);
          if (orderedItem) {
            return { ...p, stock: Math.max(0, p.stock - orderedItem.quantity) };
          }
          return p;
        })
      );

      // Attempt Firestore write
      try {
        await setDoc(doc(db, 'orders', orderId), newOrder);
      } catch (err) {
        console.warn('Persisted locally. Firestore sync error:', err);
      }

      clearCart();
      showToast(`تم تسجيل الطلب بنجاح برقم: ${orderNumber}`, 'success');
      return newOrder;
    },
    [cart, cartTotals, cartHasPrescriptionItems, currentUser, clearCart, showToast]
  );

  const updateOrderStatus = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    const now = new Date().toISOString();
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus, updatedAt: now } : o))
    );

    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: now,
      });
    } catch (err) {
      console.warn('Status updated locally:', err);
    }
    showToast(`تم تحديث حالة الطلب إلى "${newStatus}"`, 'info');
  }, [showToast]);

  // Prescription creation
  const uploadPrescription = useCallback(
    async (prescriptionData: {
      customerName: string;
      phone: string;
      patientAge?: string;
      imageUrl: string;
      notes?: string;
    }): Promise<Prescription> => {
      const id = `rx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();

      const newRx: Prescription = {
        id,
        customerId: currentUser?.uid || 'guest',
        customerName: prescriptionData.customerName,
        phone: prescriptionData.phone,
        patientAge: prescriptionData.patientAge,
        imageUrl: prescriptionData.imageUrl,
        notes: prescriptionData.notes,
        status: 'جديد',
        createdAt: now,
        updatedAt: now,
      };

      setPrescriptions(prev => [newRx, ...prev]);

      try {
        await setDoc(doc(db, 'prescriptions', id), newRx);
      } catch (err) {
        console.warn('Prescription saved locally:', err);
      }

      showToast('تم إرسال الوصفة الطبية بنجاح! سيراجعها الصيدلاني الآن 🩺', 'success');
      return newRx;
    },
    [currentUser, showToast]
  );

  const reviewPrescription = useCallback(
    async (id: string, status: PrescriptionStatus, pharmacistNotes: string) => {
      const now = new Date().toISOString();
      setPrescriptions(prev =>
        prev.map(p =>
          p.id === id
            ? {
                ...p,
                status,
                pharmacistNotes,
                reviewedBy: currentUser?.displayName || 'د. صيدلي ذو ريدان',
                updatedAt: now,
              }
            : p
        )
      );

      try {
        await updateDoc(doc(db, 'prescriptions', id), {
          status,
          pharmacistNotes,
          reviewedBy: currentUser?.displayName || 'د. صيدلي ذو ريدان',
          updatedAt: now,
        });
      } catch (err) {
        console.warn('Prescription review saved locally:', err);
      }

      showToast(`تم تحديث الوصفة الطبية إلى: ${status}`, 'success');
    },
    [currentUser, showToast]
  );

  // Admin Product Actions
  const addProduct = useCallback(async (productData: Omit<Product, 'id'>) => {
    const id = `prod_${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts(prev => [newProduct, ...prev]);

    try {
      await setDoc(doc(db, 'products', id), newProduct);
    } catch (err) {
      console.warn('Product added locally:', err);
    }
    showToast(`تمت إضافة منتج "${newProduct.nameAr}" بنجاح`, 'success');
  }, [showToast]);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    const now = new Date().toISOString();
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates, updatedAt: now } : p))
    );

    try {
      await updateDoc(doc(db, 'products', id), { ...updates, updatedAt: now });
    } catch (err) {
      console.warn('Product updated locally:', err);
    }
    showToast('تم حفظ تعديلات المنتج', 'success');
  }, [showToast]);

  const deleteProduct = useCallback(async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      console.warn('Product deleted locally:', err);
    }
    showToast('تم حذف المنتج من القائمة', 'info');
  }, [showToast]);

  // Categories Actions
  const addCategory = useCallback(async (categoryData: Omit<Category, 'id'>) => {
    const id = `cat_${Date.now()}`;
    const newCat: Category = { ...categoryData, id };
    setCategories(prev => [...prev, newCat]);
    try {
      await setDoc(doc(db, 'categories', id), newCat);
    } catch (err) {
      console.warn('Category added locally:', err);
    }
    showToast(`تمت إضافة تصنيف "${newCat.nameAr}"`, 'success');
  }, [showToast]);

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
    try {
      await updateDoc(doc(db, 'categories', id), updates);
    } catch (err) {
      console.warn('Category updated locally:', err);
    }
    showToast('تم تحديث بيانات التصنيف', 'success');
  }, [showToast]);

  const deleteCategory = useCallback(async (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (err) {
      console.warn('Category deleted locally:', err);
    }
    showToast('تم حذف التصنيف', 'info');
  }, [showToast]);

  // Delivery Areas
  const updateDeliveryAreaFee = useCallback(async (id: string, fee: number) => {
    setDeliveryAreas(prev => prev.map(a => (a.id === id ? { ...a, fee } : a)));
    try {
      await updateDoc(doc(db, 'deliveryAreas', id), { fee });
    } catch (err) {
      console.warn('Delivery fee updated locally:', err);
    }
    showToast('تم تحديث تسعيرة التوصيل للمنطقة', 'success');
  }, [showToast]);

  // Coupons
  const addCoupon = useCallback(async (coupon: Coupon) => {
    setCoupons(prev => [coupon, ...prev.filter(c => c.code !== coupon.code)]);
    try {
      await setDoc(doc(db, 'coupons', coupon.code), coupon);
    } catch (err) {
      console.warn('Coupon saved locally:', err);
    }
    showToast(`تم إنشاء كوبون الخصم ${coupon.code}`, 'success');
  }, [showToast]);

  // Settings
  const updateSettings = useCallback(async (newSettings: Partial<PharmacySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    try {
      await setDoc(doc(db, 'settings', 'general'), newSettings, { merge: true });
    } catch (err) {
      console.warn('Settings updated locally:', err);
    }
    showToast('تم تحديث إعدادات الصيدلية العامة', 'success');
  }, [showToast]);

  // Google Login
  const loginWithGoogle = useCallback(async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      setCurrentUser(res.user);
      if (res.user.email === ADMIN_EMAIL) {
        setUserRole('admin');
      }
      showToast(`مرحباً بك يا ${res.user.displayName || 'عميلنا العزيز'} 👋`, 'success');
    } catch (err: any) {
      showToast(`تعذر تسجيل الدخول: ${err.message}`, 'error');
    }
  }, [showToast]);

  const logout = useCallback(async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserRole('customer');
    showToast('تم تسجيل الخروج بنجاح', 'info');
  }, [showToast]);

  const isAdmin = userRole === 'admin';
  const isPharmacist = userRole === 'pharmacist' || userRole === 'admin';

  return (
    <PharmacyContext.Provider
      value={{
        settings,
        updateSettings,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        deliveryAreas,
        updateDeliveryAreaFee,
        coupons,
        addCoupon,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        selectedDeliveryArea,
        setSelectedDeliveryArea,
        cartTotals,
        cartHasPrescriptionItems,
        orders,
        createOrder,
        updateOrderStatus,
        prescriptions,
        uploadPrescription,
        reviewPrescription,
        currentUser,
        userRole,
        setUserRole,
        loginWithGoogle,
        logout,
        isAdmin,
        isPharmacist,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        onlyPrescriptionNeeded,
        setOnlyPrescriptionNeeded,
        language,
        setLanguage,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
};

export const usePharmacy = () => {
  const ctx = useContext(PharmacyContext);
  if (!ctx) throw new Error('usePharmacy must be used within PharmacyProvider');
  return ctx;
};
