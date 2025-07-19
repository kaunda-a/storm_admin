import { db } from '@/lib/prisma'
import type { Order, OrderItem, User, Address, OrderStatus, PaymentStatus, ShippingStatus } from '@/types/database'

export type OrderWithDetails = Order & {
  user: User
  shippingAddress: Address
  billingAddress: Address
  items: (OrderItem & {
    product: {
      name: string
      slug: string
      images: { url: string }[]
    }
    productVariant: {
      size: string
      color: string
      sku: string
    }
  })[]
  payments: {
    id: string
    amount: number
    status: PaymentStatus
    method: string
    processedAt: Date | null
  }[]
}

export type OrderFilters = {
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  shippingStatus?: ShippingStatus
  userId?: string
  dateFrom?: Date
  dateTo?: Date
  search?: string
}

export class OrderService {
  static async getOrders({
    filters = {},
    page = 1,
    limit = 10
  }: {
    filters?: OrderFilters
    page?: number
    limit?: number
  } = {}) {
    const skip = (page - 1) * limit

    const where: any = {}

    // Apply filters
    if (filters.status) where.status = filters.status
    if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus
    if (filters.shippingStatus) where.shippingStatus = filters.shippingStatus
    if (filters.userId) where.userId = filters.userId

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {
        ...(filters.dateFrom && { gte: filters.dateFrom }),
        ...(filters.dateTo && { lte: filters.dateTo })
      }
    }

    if (filters.search) {
      where.OR = [
        { orderNumber: { contains: filters.search, mode: 'insensitive' } },
        { trackingNumber: { contains: filters.search, mode: 'insensitive' } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } }
      ]
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          user: true,
          shippingAddress: true,
          billingAddress: true,
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  slug: true,
                  images: {
                    where: { isPrimary: true },
                    select: { url: true },
                    take: 1
                  }
                }
              },
              productVariant: {
                select: {
                  size: true,
                  color: true,
                  sku: true
                }
              }
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              method: true,
              processedAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.order.count({ where })
    ])

    return {
      orders: orders as OrderWithDetails[],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  static async getOrderById(id: string): Promise<OrderWithDetails | null> {
    return db.order.findUnique({
      where: { id },
      include: {
        user: true,
        shippingAddress: true,
        billingAddress: true,
        items: {
          include: {
            product: {
              select: {
                name: true,
                slug: true,
                images: {
                  where: { isPrimary: true },
                  select: { url: true },
                  take: 1
                }
              }
            },
            productVariant: {
              select: {
                size: true,
                color: true,
                sku: true
              }
            }
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            method: true,
            processedAt: true
          }
        }
      }
    }) as Promise<OrderWithDetails | null>
  }

  static async getOrderByNumber(orderNumber: string): Promise<OrderWithDetails | null> {
    return db.order.findUnique({
      where: { orderNumber },
      include: {
        user: true,
        shippingAddress: true,
        billingAddress: true,
        items: {
          include: {
            product: {
              select: {
                name: true,
                slug: true,
                images: {
                  where: { isPrimary: true },
                  select: { url: true },
                  take: 1
                }
              }
            },
            productVariant: {
              select: {
                size: true,
                color: true,
                sku: true
              }
            }
          }
        },
        payments: true
      }
    }) as Promise<OrderWithDetails | null>
  }

  static async updateOrderStatus(orderId: string, status: OrderStatus) {
    return db.order.update({
      where: { id: orderId },
      data: { 
        status,
        ...(status === 'SHIPPED' && { shippedAt: new Date() }),
        ...(status === 'DELIVERED' && { deliveredAt: new Date() })
      }
    })
  }

  static async updateShippingStatus(orderId: string, status: ShippingStatus, trackingNumber?: string) {
    return db.order.update({
      where: { id: orderId },
      data: {
        shippingStatus: status,
        ...(trackingNumber && { trackingNumber }),
        ...(status === 'SHIPPED' && { shippedAt: new Date() }),
        ...(status === 'DELIVERED' && { deliveredAt: new Date() })
      }
    })
  }

  static async updateOrder(orderId: string, data: {
    status?: OrderStatus
    paymentStatus?: PaymentStatus
    shippingStatus?: ShippingStatus
    notes?: string
    trackingNumber?: string
    shippedAt?: Date
    deliveredAt?: Date
  }) {
    return db.order.update({
      where: { id: orderId },
      data: {
        ...data,
        // Auto-set timestamps based on status changes
        ...(data.status === 'SHIPPED' && !data.shippedAt && { shippedAt: new Date() }),
        ...(data.status === 'DELIVERED' && !data.deliveredAt && { deliveredAt: new Date() }),
        ...(data.shippingStatus === 'SHIPPED' && !data.shippedAt && { shippedAt: new Date() }),
        ...(data.shippingStatus === 'DELIVERED' && !data.deliveredAt && { deliveredAt: new Date() })
      },
      include: {
        user: true,
        shippingAddress: true,
        billingAddress: true,
        items: {
          include: {
            product: {
              select: {
                name: true,
                slug: true,
                images: {
                  where: { isPrimary: true },
                  select: { url: true },
                  take: 1
                }
              }
            },
            productVariant: {
              select: {
                size: true,
                color: true,
                sku: true
              }
            }
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            method: true,
            processedAt: true
          }
        }
      }
    }) as Promise<OrderWithDetails>
  }

  static async getOrderStats() {
    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      recentOrders
    ] = await Promise.all([
      db.order.count(),
      db.order.count({ where: { status: 'PENDING' } }),
      db.order.count({ where: { status: 'DELIVERED' } }),
      db.order.aggregate({
        where: { status: 'DELIVERED' },
        _sum: { totalAmount: true }
      }),
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          items: {
            take: 1,
            include: {
              product: { select: { name: true } }
            }
          }
        }
      })
    ])

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      recentOrders
    }
  }

  static async getDailySales(days = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    return db.order.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: startDate },
        status: 'DELIVERED'
      },
      _sum: {
        totalAmount: true
      },
      _count: true,
      orderBy: {
        createdAt: 'asc'
      }
    })
  }

  static async getTopProducts(limit = 10) {
    return db.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        totalPrice: true
      },
      _count: true,
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: limit
    })
  }
}
