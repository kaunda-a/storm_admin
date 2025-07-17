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
  OrderWithDetails,
  OrderFilters
} from './orders'

export type {
  UserWithDetails,
  CreateUserData,
  UpdateUserData,
  CreateAddressData
} from './users'

export type {
  DashboardStats,
  SalesData,
  TopProduct,
  CategoryPerformance
} from './analytics'

export type {
  MarqueeMessageWithCreator,
  CreateMarqueeData,
  UpdateMarqueeData
} from './marquee'

export type {
  BillboardWithCreator,
  CreateBillboardData,
  UpdateBillboardData
} from './billboard'
