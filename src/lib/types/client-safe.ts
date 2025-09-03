/**
 * Client-safe type definitions that mirror Prisma types
 * but are safe for use in client components without server dependencies
 */

// Import and re-export safe enum types (these are just strings/numbers, no server dependencies)
import type {
  UserRole,
  ProductStatus,
  OrderStatus,
  PaymentStatus,
  ShippingStatus,
  AddressType,
  AnalyticsEventType,
  MarqueeType,
  BillboardType,
  BillboardPosition,
  PaymentMethod
} from '@prisma/client'

export {
  UserRole,
  ProductStatus,
  OrderStatus,
  PaymentStatus,
  ShippingStatus,
  AddressType,
  AnalyticsEventType,
  MarqueeType,
  BillboardType,
  BillboardPosition,
  PaymentMethod
}

// Client-safe base types with proper serialization
export interface ClientUser {
  id: string
  email: string
  emailVerified: string | null // Date serialized as string
  firstName: string | null
  lastName: string | null
  imageUrl: string | null
  role: UserRole
  createdAt: string // Date serialized as string
  updatedAt: string // Date serialized as string
}

export interface ClientCustomer {
  id: string
  email: string
  emailVerified: string | null
  firstName: string | null
  lastName: string | null
  imageUrl: string | null
  image: string | null
  phone: string | null
  createdAt: string
  updatedAt: string
}

export interface ClientProductVariant {
  id: string
  productId: string
  size: string
  color: string
  material: string | null
  sku: string
  price: number // Converted from Decimal
  comparePrice: number | null // Converted from Decimal
  costPrice: number | null // Converted from Decimal
  stock: number
  lowStockThreshold: number
  weight: number | null // Converted from Decimal
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ClientProduct {
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
  averageRating: number // Converted from Decimal
  reviewCount: number
  createdAt: string
  updatedAt: string
}

export interface ClientOrder {
  id: string
  orderNumber: string
  customerId: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  shippingStatus: ShippingStatus
  subtotal: number // Converted from Decimal
  taxAmount: number // Converted from Decimal
  shippingAmount: number // Converted from Decimal
  discountAmount: number // Converted from Decimal
  totalAmount: number // Converted from Decimal
  shippingAddressId: string
  billingAddressId: string
  trackingNumber: string | null
  shippedAt: string | null
  deliveredAt: string | null
  customerNotes: string | null
  adminNotes: string | null
  createdAt: string
  updatedAt: string
}

// Complex types with relations
export interface ClientProductWithDetails extends ClientProduct {
  category: {
    id: string
    name: string
    slug: string
    description: string | null
  }
  brand: {
    id: string
    name: string
    slug: string
    description: string | null
  }
  variants: ClientProductVariant[]
  images: Array<{
    id: string
    url: string
    altText: string | null
    isPrimary: boolean
    sortOrder: number
  }>
  _count: {
    reviews: number
  }
}
