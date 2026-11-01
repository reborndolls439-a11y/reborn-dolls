// ─── User & Auth ─────────────────────────────────────────────────────────────

export type UserRole = "GUEST" | "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  emailVerified: boolean;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Products ────────────────────────────────────────────────────────────────

export type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type ProductBadge = "NEW" | "FEATURED" | "SALE" | "LIMITED" | "SOLD_OUT";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  price: number;
  salePrice: number | null;
  sku: string | null;
  status: ProductStatus;
  badge: ProductBadge | null;
  isFeatured: boolean;
  isNewArrival: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  images: ProductImage[];
  category: Category | null;
  categoryId: string | null;
  materials: string | null;
  dimensions: string | null;
  weight: string | null;
  whatsIncluded: string | null;
  careInstructions: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  tags: string[];
  sourceUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  badge: ProductBadge | null;
  isFeatured: boolean;
  isNewArrival: boolean;
  stockQuantity: number;
  primaryImage: string | null;
  category: { name: string; slug: string } | null;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  salePrice: number | null;
  image: string | null;
  slug: string;
  quantity: number;
  stockQuantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "PENDING"
  | "PAYMENT_CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface Address {
  id?: string;
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  guestEmail: string | null;
  status: OrderStatus;
  items: OrderItem[];
  shippingAddress: Address;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  notes: string | null;
  trackingNumber: string | null;
  shippingCarrier: string | null;
  internalNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string | null;
  body: string;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: Date;
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

export type BlogStatus = "DRAFT" | "PUBLISHED";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  author: string;
  status: BlogStatus;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: Date | null;
  createdAt: Date;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export type ConversationStatus = "OPEN" | "PENDING" | "RESOLVED" | "CLOSED";

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string | null;
  senderName: string;
  senderType: "CUSTOMER" | "ADMIN" | "SYSTEM";
  content: string;
  createdAt: Date;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  userId: string | null;
  guestName: string | null;
  guestEmail: string | null;
  subject: string | null;
  status: ConversationStatus;
  assignedToId: string | null;
  lastMessage: string | null;
  lastMessageAt: Date | null;
  unreadCount: number;
  createdAt: Date;
  messages?: ChatMessage[];
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationType =
  | "NEW_ORDER"
  | "LOW_STOCK"
  | "NEW_MESSAGE"
  | "NEW_REVIEW"
  | "ORDER_UPDATE"
  | "SYSTEM";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link: string | null;
  createdAt: Date;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export interface WishlistItem {
  id: string;
  productId: string;
  product: ProductSummary;
  addedAt: Date;
}

// ─── Discounts ────────────────────────────────────────────────────────────────

export type DiscountType = "PERCENTAGE" | "FIXED";

export interface Coupon {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: Date | null;
}

// ─── SEO ──────────────────────────────────────────────────────────────────────

export interface SEOSettings {
  title: string | null;
  description: string | null;
  ogImage: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  canonicalUrl: string | null;
}
