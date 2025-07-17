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
  ProductSort,
  ProductStatus
} from './products'

export type {
  OrderWithDetails,
  OrderFilters,
  OrderStatus,
  PaymentStatus,
  ShippingStatus
} from './orders'

export type {
  UserWithDetails,
  CreateUserData,
  UpdateUserData,
  CreateAddressData,
  UserRole,
  AddressType
} from './users'

export {
  AnalyticsService
} from './analytics'

export type {
  AnalyticsEventType,
  DashboardStats,
  SalesData,
  TopProduct,
  CategoryPerformance
} from './analytics'

export type {
  MarqueeMessageWithCreator,
  CreateMarqueeData,
  UpdateMarqueeData,
  MarqueeType
} from './marquee'

export type {
  BillboardWithCreator,
  CreateBillboardData,
  UpdateBillboardData,
  BillboardPosition,
  BillboardType
} from './billboard'
