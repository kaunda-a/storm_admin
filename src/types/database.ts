/**
 * Database model types - Independent of Prisma client generation
 * This file defines all database model types locally to avoid Prisma client export issues
 */

// Base types
export type Decimal = {
  toNumber(): number
  toString(): string
}

// Enum types
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF' | 'CUSTOMER'
export type AddressType = 'SHIPPING' | 'BILLING' | 'BOTH'
export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
export type ShippingStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'RETURNED'
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY'
export type BillboardType = 'PROMOTIONAL' | 'ANNOUNCEMENT' | 'PRODUCT_LAUNCH' | 'SALE' | 'SEASONAL' | 'SYSTEM_MESSAGE' | 'BRAND_CAMPAIGN'
export type BillboardPosition = 'HEADER' | 'SIDEBAR' | 'FOOTER' | 'MODAL' | 'DASHBOARD_TOP' | 'DASHBOARD_BOTTOM' | 'PRODUCT_PAGE' | 'CHECKOUT'
export type MarqueeType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'ALERT' | 'PROMOTION' | 'SYSTEM' | 'INVENTORY' | 'ORDER'
export type AnalyticsEventType = 'PAGE_VIEW' | 'PRODUCT_VIEW' | 'ADD_TO_CART' | 'REMOVE_FROM_CART' | 'CHECKOUT_START' | 'CHECKOUT_COMPLETE' | 'PURCHASE' | 'SEARCH' | 'FILTER' | 'SORT'

// User models
export type User = {
  id: string
  clerkId: string
  email: string
  firstName: string | null
  lastName: string | null
  imageUrl: string | null
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export type Address = {
  id: string
  userId: string
  type: AddressType
  firstName: string
  lastName: string
  company: string | null
  addressLine1: string
  addressLine2: string | null
  city: string
  province: string
  postalCode: string
  country: string
  phone: string | null
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

// Product models
export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export type Brand = {
  id: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  website: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  shortDescription: string | null
  sku: string
  categoryId: string
  brandId: string
  status: ProductStatus
  isActive: boolean
  isFeatured: boolean
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export type ProductVariant = {
  id: string
  productId: string
  size: string
  color: string
  material: string | null
  sku: string
  price: Decimal
  comparePrice: Decimal | null
  costPrice: Decimal | null
  stock: number
  lowStockThreshold: number
  weight: Decimal | null
  isActive: boolean
  isDefault: boolean | null
  createdAt: Date
  updatedAt: Date
}

export type ProductImage = {
  id: string
  productId: string
  url: string
  altText: string | null
  isPrimary: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

// Order models
export type Order = {
  id: string
  orderNumber: string
  userId: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  shippingStatus: ShippingStatus
  subtotal: Decimal
  taxAmount: Decimal
  shippingAmount: Decimal
  discountAmount: Decimal
  totalAmount: Decimal
  shippingAddressId: string
  billingAddressId: string
  trackingNumber: string | null
  shippedAt: Date | null
  deliveredAt: Date | null
  customerNotes: string | null
  adminNotes: string | null
  createdAt: Date
  updatedAt: Date
}

export type OrderItem = {
  id: string
  orderId: string
  productId: string
  productVariantId: string
  quantity: number
  unitPrice: Decimal
  totalPrice: Decimal
  createdAt: Date
  updatedAt: Date
}

export type Payment = {
  id: string
  orderId: string
  amount: Decimal
  currency: string
  method: PaymentMethod
  status: PaymentStatus
  transactionId: string | null
  gatewayResponse: any
  processedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// Content models
export type Billboard = {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  videoUrl: string | null
  linkUrl: string | null
  linkText: string | null
  type: BillboardType
  position: BillboardPosition
  isActive: boolean
  startDate: Date | null
  endDate: Date | null
  sortOrder: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export type MarqueeMessage = {
  id: string
  title: string
  message: string
  type: MarqueeType
  priority: number
  isActive: boolean
  startDate: Date | null
  endDate: Date | null
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

// Review model
export type Review = {
  id: string
  userId: string
  productId: string
  rating: number
  title: string | null
  comment: string | null
  isVerified: boolean
  isApproved: boolean
  createdAt: Date
  updatedAt: Date
}

// Analytics model
export type AnalyticsEvent = {
  id: string
  eventType: AnalyticsEventType
  userId: string | null
  sessionId: string | null
  productId: string | null
  orderId: string | null
  data: any
  userAgent: string | null
  ipAddress: string | null
  createdAt: Date
}
