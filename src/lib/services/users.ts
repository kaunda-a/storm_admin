import { db } from '@/lib/prisma'
import { User, Address } from '@prisma/client'

// Define enum types locally to avoid Prisma client generation issues
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF' | 'CUSTOMER'
export type AddressType = 'SHIPPING' | 'BILLING' | 'BOTH'

export type UserWithDetails = User & {
  addresses: Address[]
  _count: {
    orders: number
    reviews: number
  }
}

export type CreateUserData = {
  clerkId: string
  email: string
  firstName?: string
  lastName?: string
  imageUrl?: string
  role?: UserRole
}

export type UpdateUserData = {
  firstName?: string
  lastName?: string
  imageUrl?: string
  role?: UserRole
}

export type CreateAddressData = {
  userId: string
  type: AddressType
  firstName: string
  lastName: string
  company?: string
  addressLine1: string
  addressLine2?: string
  city: string
  province: string
  postalCode: string
  country?: string
  phone?: string
  isDefault?: boolean
}

export class UserService {
  static async createUser(data: CreateUserData): Promise<User> {
    return db.user.create({
      data: {
        clerkId: data.clerkId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        imageUrl: data.imageUrl,
        role: data.role || 'CUSTOMER'
      }
    })
  }

  static async getUserByClerkId(clerkId: string): Promise<UserWithDetails | null> {
    return db.user.findUnique({
      where: { clerkId },
      include: {
        addresses: {
          orderBy: { isDefault: 'desc' }
        },
        _count: {
          select: {
            orders: true,
            reviews: true
          }
        }
      }
    }) as Promise<UserWithDetails | null>
  }

  static async getUserById(id: string): Promise<UserWithDetails | null> {
    return db.user.findUnique({
      where: { id },
      include: {
        addresses: {
          orderBy: { isDefault: 'desc' }
        },
        _count: {
          select: {
            orders: true,
            reviews: true
          }
        }
      }
    }) as Promise<UserWithDetails | null>
  }

  static async updateUser(id: string, data: UpdateUserData): Promise<User> {
    return db.user.update({
      where: { id },
      data
    })
  }

  static async getUsers({
    role,
    search,
    page = 1,
    limit = 10
  }: {
    role?: UserRole
    search?: string
    page?: number
    limit?: number
  } = {}) {
    const skip = (page - 1) * limit

    const where: any = {}

    if (role) where.role = role

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        include: {
          _count: {
            select: {
              orders: true,
              reviews: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.user.count({ where })
    ])

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  static async createAddress(data: CreateAddressData): Promise<Address> {
    // If this is set as default, unset other default addresses
    if (data.isDefault) {
      await db.address.updateMany({
        where: {
          userId: data.userId,
          type: data.type
        },
        data: { isDefault: false }
      })
    }

    return db.address.create({
      data: {
        userId: data.userId,
        type: data.type,
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        country: data.country || 'South Africa',
        phone: data.phone,
        isDefault: data.isDefault || false
      }
    })
  }

  static async updateAddress(id: string, data: Partial<CreateAddressData>): Promise<Address> {
    const address = await db.address.findUnique({ where: { id } })
    if (!address) throw new Error('Address not found')

    // If this is set as default, unset other default addresses
    if (data.isDefault) {
      await db.address.updateMany({
        where: {
          userId: address.userId,
          type: address.type,
          id: { not: id }
        },
        data: { isDefault: false }
      })
    }

    return db.address.update({
      where: { id },
      data
    })
  }

  static async deleteAddress(id: string): Promise<void> {
    await db.address.delete({
      where: { id }
    })
  }

  static async getUserAddresses(userId: string, type?: AddressType): Promise<Address[]> {
    return db.address.findMany({
      where: {
        userId,
        ...(type && { type })
      },
      orderBy: { isDefault: 'desc' }
    })
  }

  static async getDefaultAddress(userId: string, type: AddressType): Promise<Address | null> {
    return db.address.findFirst({
      where: {
        userId,
        type,
        isDefault: true
      }
    })
  }

  static async getUserStats() {
    const [
      totalUsers,
      totalCustomers,
      totalAdmins,
      newUsersThisMonth
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: 'CUSTOMER' } }),
      db.user.count({ 
        where: { 
          role: { 
            in: ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'STAFF'] 
          } 
        } 
      }),
      db.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ])

    return {
      totalUsers,
      totalCustomers,
      totalAdmins,
      newUsersThisMonth
    }
  }

  static async syncClerkUser(clerkUser: {
    id: string
    emailAddresses: { emailAddress: string }[]
    firstName?: string
    lastName?: string
    imageUrl?: string
  }) {
    const email = clerkUser.emailAddresses[0]?.emailAddress

    if (!email) throw new Error('No email found for user')

    return db.user.upsert({
      where: { clerkId: clerkUser.id },
      update: {
        email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl
      },
      create: {
        clerkId: clerkUser.id,
        email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        role: 'CUSTOMER'
      }
    })
  }
}
