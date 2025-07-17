// Export all services
export * from './products'
export * from './orders'
export * from './users'
export * from './analytics'
export * from './marquee'
export * from './billboard'

// Re-export commonly used types
export type {
  ProductWithDetails,
  ProductFilters,
  ProductSort
} from './products'

export type {
  ProductStatus
} from '@/types/database'

export type {
  OrderWithDetails,
  OrderFilters
} from './orders'

export type {
  OrderStatus,
  PaymentStatus,
  ShippingStatus
} from '@/types/database'

export type {
  UserWithDetails,
  CreateUserData,
  UpdateUserData,
  CreateAddressData
} from './users'

export type {
  UserRole,
  AddressType
} from '@/types/database'

export {
  AnalyticsService
} from './analytics'

export type {
  DashboardStats,
  SalesData,
  TopProduct,
  CategoryPerformance
} from './analytics'

export type {
  AnalyticsEventType
} from '@/types/database'

export type {
  MarqueeMessageWithCreator,
  CreateMarqueeData,
  UpdateMarqueeData
} from './marquee'

export type {
  MarqueeType
} from '@/types/database'

export type {
  BillboardWithCreator,
  CreateBillboardData,
  UpdateBillboardData
} from './billboard'

export type {
  BillboardPosition,
  BillboardType
} from '@/types/database'
