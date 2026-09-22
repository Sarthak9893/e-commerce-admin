export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: any;
  requestId?: string;
  timestamp?: string;
  error?: any;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface PaginatedResponse<T> {
  items?: T[];
  data?: T[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  meta?: PaginatedMeta;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ================= AUTH =================
export interface AdminUser {
  id: string;
  email: string;
  phone?: string;
  role: 'admin' | 'staff' | 'customer';
  isActive: boolean;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: string;
}

// ================= DASHBOARD =================
export interface DashboardSummary {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  revenuePercentageChange: number;
  pendingOrdersCount: number;
}

export interface SalesChartItem {
  date: string;
  revenue: number;
  orders: number;
}

export interface BestSellingProduct {
  productId: string;
  productName: string;
  name?: string;
  sku: string;
  totalQuantitySold: number;
  totalRevenue: number;
  imageUrl?: string;
  price?: number;
}

// ================= CATEGORIES =================
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: 'active' | 'inactive';
  sortOrder: number;
  parentId?: string | null;
  metaTitle?: string;
  metaDescription?: string;
  imageUrl?: string;
  image?: string;
  isActive?: boolean;
  productsCount?: number;
  children?: Category[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryDto {
  name: string;
  slug?: string;
  parentId?: string | null;
  description?: string;
  status?: 'active' | 'inactive';
  sortOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
  image?: string;
  isActive?: boolean;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

// ================= PRODUCTS & VARIANTS =================
export interface ProductVariant {
  id?: string;
  productId?: string;
  sku: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  stock?: number;
  size?: string;
  color?: string;
  isActive?: boolean;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  title?: string;
  slug: string;
  description?: string;
  categoryId: string;
  category?: Category;
  basePrice: number;
  price?: number;
  discountPrice?: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku: string;
  status: 'active' | 'inactive' | 'ACTIVE' | 'DRAFT' | 'OUT_OF_STOCK' | 'ARCHIVED';
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  variants?: ProductVariant[];
  images?: string[] | ProductImage[];
  stock?: number;
  lowStockThreshold?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilterParams extends PaginationParams {
  categoryId?: string;
  status?: string;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface CreateVariantDto {
  sku: string;
  price: number;
  discountPrice?: number;
  stockQuantity?: number;
  size?: string;
  color?: string;
  isActive?: boolean;
}

export interface CreateProductDto {
  name: string;
  categoryId: string;
  basePrice: number;
  discountPrice?: number;
  sku?: string;
  status?: 'active' | 'inactive';
  isFeatured?: boolean;
  description?: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  variants?: CreateVariantDto[];
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

// ================= ORDERS =================
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string;
  productName?: string;
  title?: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  price?: number;
  totalPrice: number;
  total?: number;
  imageUrl?: string;
  image?: string;
}

export interface OrderAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount?: number;
  discount?: number;
  shippingCharge?: number;
  shippingFee?: number;
  taxAmount?: number;
  tax?: number;
  totalAmount: number;
  total?: number;
  status: OrderStatus | string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded' | string;
  paymentMethod: 'razorpay' | 'cod' | 'online' | 'upi' | 'card' | string;
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  trackingNumber?: string;
  carrier?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilterParams extends PaginationParams {
  status?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateOrderStatusDto {
  status: string;
  note?: string;
}

// ================= PAYMENTS =================
export interface Payment {
  id: string;
  orderId: string;
  orderNumber?: string;
  customerName?: string;
  amount: number;
  currency: string;
  method: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | string;
  transactionId?: string;
  razorpayPaymentId?: string;
  gatewayResponse?: any;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentFilterParams extends PaginationParams {
  status?: string;
  method?: string;
  orderId?: string;
  startDate?: string;
  endDate?: string;
}

// ================= INVENTORY =================
export interface InventorySummary {
  totalVariants: number;
  totalStockUnits: number;
  outOfStockCount: number;
  lowStockCount: number;
}

export interface LowStockItem {
  id?: string;
  variantId?: string;
  productId: string;
  productName?: string;
  variantName?: string;
  sku: string;
  stockQuantity: number;
  currentStock?: number;
  threshold?: number;
  lowStockThreshold?: number;
  availableStock?: number;
  reservedStock?: number;
  isLowStock?: boolean;
  size?: string;
  color?: string;
  price?: string | number;
  discountPrice?: string | number;
  isActive?: boolean;
  product?: {
    id: string;
    name: string;
    slug?: string;
    description?: string;
    categoryId?: string;
    basePrice?: string | number;
    discountPrice?: string | number;
    sku?: string;
    status?: string;
    isFeatured?: boolean;
    category?: {
      id?: string;
      name?: string;
      slug?: string;
    };
  };
}

export interface AdjustStockDto {
  variantId: string;
  changeQty: number;
  reason?: 'purchase' | 'sale' | 'return' | 'manual_adjustment' | 'cancellation' | 'damage';
  reference?: string;
}

// ================= COLLECTIONS =================
export interface Collection {
  id: string;
  name: string;
  title?: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  image?: string;
  isFeatured?: boolean;
  status: 'active' | 'inactive';
  isActive?: boolean;
  sortOrder?: number;
  productCount?: number;
  products?: Product[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCollectionDto {
  name: string;
  title?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  image?: string;
  isFeatured?: boolean;
  status?: 'active' | 'inactive';
  isActive?: boolean;
  sortOrder?: number;
  productIds?: string[];
}

export interface UpdateCollectionDto extends Partial<CreateCollectionDto> {}

// ================= COUPONS =================
export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  discountType?: 'PERCENTAGE' | 'FIXED';
  value: number;
  discountValue?: number;
  minOrderValue?: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startsAt: string;
  startDate?: string;
  expiresAt: string;
  endDate?: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCouponDto {
  code: string;
  type: 'percentage' | 'fixed';
  discountType?: 'PERCENTAGE' | 'FIXED';
  value: number;
  discountValue?: number;
  minOrderValue?: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startsAt: string;
  startDate?: string;
  expiresAt: string;
  endDate?: string;
  usageLimit?: number;
  isActive?: boolean;
  description?: string;
}

export interface UpdateCouponDto extends Partial<CreateCouponDto> {}

// ================= REVIEWS =================
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | string;

export interface Review {
  id: string;
  productId: string;
  product?: Product;
  userId?: string;
  customerName?: string;
  customerEmail?: string;
  rating: number;
  title?: string;
  comment: string;
  status: ReviewStatus;
  rejectionReason?: string;
  isVerifiedPurchase?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateReviewStatusDto {
  status: ReviewStatus;
  rejectionReason?: string;
}

// ================= BANNERS =================
export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  linkUrl?: string;
  position: 'homepage_hero' | 'category_top' | 'promo_strip' | string;
  sortOrder: number;
  displayOrder?: number;
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
  imageUrl?: string;
  image?: string;
  publicId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBannerDto {
  title: string;
  subtitle?: string;
  linkUrl?: string;
  position?: 'homepage_hero' | 'category_top' | 'promo_strip' | string;
  sortOrder?: number;
  displayOrder?: number;
  isActive?: boolean;
  startsAt?: string;
  endsAt?: string;
  imageUrl?: string;
  image?: string;
  publicId?: string;
}

export interface UpdateBannerDto extends Partial<CreateBannerDto> {}

// ================= SHIPPING =================
export interface Pincode {
  id: string;
  pincode: string;
  city: string;
  state: string;
  isServiceable?: boolean;
  isDeliverable?: boolean;
  codAvailable?: boolean;
  isCodAvailable?: boolean;
  estimatedDays?: number;
  applicableZone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePincodeDto {
  pincode: string;
  city: string;
  state: string;
  isServiceable?: boolean;
  codAvailable?: boolean;
  estimatedDays?: number;
  applicableZone?: string;
}

export interface UpdatePincodeDto extends Partial<CreatePincodeDto> {}

export interface ShippingRule {
  id: string;
  name: string;
  minOrderValue?: number;
  maxOrderValue?: number;
  flatRate?: number;
  rate?: number;
  applicableZone?: string;
  isActive: boolean;
  isFree?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateShippingRuleDto {
  name: string;
  minOrderValue?: number;
  maxOrderValue?: number;
  flatRate?: number;
  rate?: number;
  applicableZone?: string;
  isActive?: boolean;
  isFree?: boolean;
}

export interface UpdateShippingRuleDto extends Partial<CreateShippingRuleDto> {}

// ================= NOTIFICATIONS =================
export interface NotificationLog {
  id: string;
  type: string;
  status: 'PENDING' | 'SENT' | 'FAILED' | string;
  recipientEmail?: string;
  recipientPhone?: string;
  title?: string;
  subject?: string;
  message?: string;
  content?: string;
  metadata?: any;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  createdAt: string;
}

// ================= SETTINGS =================
export interface StoreInfoSettings {
  name?: string;
  logoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  currency?: string;
  description?: string;
}

export interface TaxSettings {
  percentage?: number;
  isTaxInclusive?: boolean;
  taxLabel?: string;
}

export interface PaymentSettings {
  enabledGateways?: string[];
  codAvailable?: boolean;
  minCodOrderValue?: number;
  maxCodOrderValue?: number;
}

export interface ShippingSettings {
  defaultFreeShippingThreshold?: number;
  defaultFlatRate?: number;
}

export interface StoreSettings {
  store_info?: StoreInfoSettings;
  tax_settings?: TaxSettings;
  payment_settings?: PaymentSettings;
  shipping_settings?: ShippingSettings;
  email_settings?: any;
  social_links?: any;
  // Legacy / Direct access compatibility
  storeName?: string;
  supportEmail?: string;
  supportPhone?: string;
  currency?: string;
  currencySymbol?: string;
  taxRate?: number;
  enableCod?: boolean;
  freeShippingThreshold?: number;
  maintenanceMode?: boolean;
  address?: string;
}
