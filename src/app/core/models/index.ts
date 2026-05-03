// ─────────────────────────────────────────────────────────────
// src/app/core/models/index.ts
// ─────────────────────────────────────────────────────────────

// ── AUTH ─────────────────────────────────────────────────────

export interface RegisterRequest {
  fullName: string;
  email:    string;
  password: string;
}

export interface LoginRequest {
  email:    string;
  password: string;
}

export interface AuthResponse {
  accessToken:  string;
  refreshToken: string;
  tokenType:    string;
  expiresIn:    number;
  user:         UserInfo;
}

export interface UserInfo {
  id:       string;
  email:    string;
  fullName: string;
  role:     string;
}

// ── PRODUCT ───────────────────────────────────────────────────

export interface CategorySummary {
  id:   number;
  name: string;
  slug: string;
}

export interface Category {
  id:          number;
  name:        string;
  slug:        string;
  description: string;
  imageUrl:    string;
  parentId:    number | null;
  parentName:  string | null;
  children:    Category[];
  active:      boolean;
  createdAt:   string;
}

export interface Product {
  id:              string;
  name:            string;
  description:     string;
  sku:             string;
  price:           number;
  discountedPrice: number | null;
  discountPercent: number | null;
  category:        CategorySummary;
  imageUrls:       string[];
  attributes:      Record<string, any>;
  stockQuantity:   number;
  inStock:         boolean;
  averageRating:   number;
  reviewCount:     number;
  active:          boolean;
  createdAt:       string;
  updatedAt:       string;
}

export interface ProductPage {
  content:          Product[];
  totalElements:    number;
  totalPages:       number;
  size:             number;
  number:           number;
  first:            boolean;
  last:             boolean;
}

export interface ProductFilter {
  categoryId?: number;
  minPrice?:   number;
  maxPrice?:   number;
  keyword?:    string;
  sortBy?:     string;
  page?:       number;
  size?:       number;
}

export interface CreateProductRequest {
  name:            string;
  description?:    string;
  sku:             string;
  price:           number;
  discountPercent?: number;
  categoryId:      number;
  initialStock:    number;
  imageUrls?:      string[];
  attributes?:     Record<string, any>;
}

// ── CART ──────────────────────────────────────────────────────

export interface CartItem {
  product:  Product;
  quantity: number;
}

// ── ORDER ─────────────────────────────────────────────────────

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PAYMENT_FAILED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUND_INITIATED'
  | 'REFUNDED';

export type PaymentMethod = 'CARD' | 'UPI' | 'NET_BANKING' | 'COD';

export interface ShippingAddressRequest {
  recipientName: string;
  phone:         string;
  addressLine1:  string;
  addressLine2?: string;
  city:          string;
  state:         string;
  pincode:       string;
  country:       string;
}

export interface CreateOrderRequest {
  items:           OrderItemRequest[];
  shippingAddress: ShippingAddressRequest;
  paymentMethod:   PaymentMethod;
  customerNotes?:  string;
}

export interface OrderItemRequest {
  productId: string;
  quantity:  number;
}

export interface OrderItemDTO {
  id:              string;
  productId:       string;
  productName:     string;
  productSku:      string;
  productImageUrl: string;
  unitPrice:       number;
  quantity:        number;
  lineTotal:       number;
}

export interface ShippingAddressDTO {
  recipientName:    string;
  phone:            string;
  addressLine1:     string;
  addressLine2:     string;
  city:             string;
  state:            string;
  pincode:          string;
  country:          string;
  formattedAddress: string;
}

export interface Order {
  id:                   string;
  userId:               string;
  status:               OrderStatus;
  statusLabel:          string;
  subtotal:             number;
  discountAmount:       number;
  shippingCharge:       number;
  taxAmount:            number;
  totalAmount:          number;
  items:                OrderItemDTO[];
  totalItems:           number;
  shippingAddress:      ShippingAddressDTO;
  trackingNumber:       string;
  courierName:          string;
  expectedDeliveryDate: string;
  deliveredAt:          string;
  paymentId:            string;
  paymentMethod:        string;
  cancellationReason:   string;
  cancelledAt:          string;
  customerNotes:        string;
  cancellable:          boolean;
  createdAt:            string;
  updatedAt:            string;
}

export interface OrderSummary {
  id:                  string;
  status:              OrderStatus;
  statusLabel:         string;
  totalAmount:         number;
  itemCount:           number;
  primaryProductName:  string;
  primaryProductImage: string;
  createdAt:           string;
  cancellable:         boolean;
}

export interface OrderPage {
  content:       OrderSummary[];
  totalElements: number;
  totalPages:    number;
  size:          number;
  number:        number;
}

export interface CancelOrderRequest {
  reason: string;
}

export interface TimelineStep {
  status: OrderStatus;
  label:  string;
  state:  'COMPLETED' | 'ACTIVE' | 'PENDING' | 'CANCELLED';
}

export interface OrderTracking {
  orderId:              string;
  status:               OrderStatus;
  statusLabel:          string;
  trackingNumber:       string;
  courierName:          string;
  shippingAddress:      ShippingAddressDTO;
  expectedDeliveryDate: string;
  deliveredAt:          string;
  timeline:             TimelineStep[];
  createdAt:            string;
  updatedAt:            string;
}

export interface OrderStatusHistoryDTO {
  id:              string;
  orderId:         string;
  fromStatus:      OrderStatus;
  fromStatusLabel: string;
  toStatus:        OrderStatus;
  toStatusLabel:   string;
  changedBy:       string;
  remarks:         string;
  createdAt:       string;
}

// ── API ERROR ─────────────────────────────────────────────────

export interface ApiError {
  error:     string;
  message:   string;
  status:    number;
  timestamp: string;
}
