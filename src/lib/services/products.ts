import { db } from '@/lib/prisma'
import { Product, ProductVariant, Category, Brand, ProductStatus } from '@prisma/client'

export type ProductWithDetails = Product & {
  category: Category
  brand: Brand
  variants: ProductVariant[]
  images: { id: string; url: string; altText: string | null; isPrimary: boolean }[]
  _count: {
    reviews: number
  }
}

export type ProductFilters = {
  search?: string
  categoryId?: string
  brandId?: string
  status?: ProductStatus
  isActive?: boolean
  isFeatured?: boolean
  minPrice?: number
  maxPrice?: number
}

export type ProductSort = {
  field: 'name' | 'createdAt' | 'updatedAt' | 'price'
  direction: 'asc' | 'desc'
}

export class ProductService {
  static async getProducts({
    filters = {},
    sort = { field: 'createdAt', direction: 'desc' },
    page = 1,
    limit = 10
  }: {
    filters?: ProductFilters
    sort?: ProductSort
    page?: number
    limit?: number
  } = {}) {
    const skip = (page - 1) * limit

    const where: any = {}

    // Apply filters
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    if (filters.categoryId) where.categoryId = filters.categoryId
    if (filters.brandId) where.brandId = filters.brandId
    if (filters.status) where.status = filters.status
    if (filters.isActive !== undefined) where.isActive = filters.isActive
    if (filters.isFeatured !== undefined) where.isFeatured = filters.isFeatured

    // Price filtering (based on variants)
    if (filters.minPrice || filters.maxPrice) {
      where.variants = {
        some: {
          price: {
            ...(filters.minPrice && { gte: filters.minPrice }),
            ...(filters.maxPrice && { lte: filters.maxPrice })
          }
        }
      }
    }

    const orderBy: any = {}
    if (sort.field === 'price') {
      // Sort by minimum variant price
      orderBy.variants = {
        _min: {
          price: sort.direction
        }
      }
    } else {
      orderBy[sort.field] = sort.direction
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: true,
          brand: true,
          variants: {
            orderBy: { price: 'asc' },
            take: 1 // Get cheapest variant for display
          },
          images: {
            orderBy: { sortOrder: 'asc' }
          },
          _count: {
            select: { reviews: true }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      db.product.count({ where })
    ])

    return {
      products: products as ProductWithDetails[],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  static async getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
    return db.product.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: true,
        variants: {
          where: { isActive: true },
          orderBy: { price: 'asc' }
        },
        images: {
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: { reviews: true }
        }
      }
    }) as Promise<ProductWithDetails | null>
  }

  static async getProductById(id: string): Promise<ProductWithDetails | null> {
    return db.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        variants: {
          orderBy: { price: 'asc' }
        },
        images: {
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: { reviews: true }
        }
      }
    }) as Promise<ProductWithDetails | null>
  }

  static async getFeaturedProducts(limit = 8): Promise<ProductWithDetails[]> {
    return db.product.findMany({
      where: {
        isFeatured: true,
        isActive: true,
        status: 'ACTIVE'
      },
      include: {
        category: true,
        brand: true,
        variants: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
          take: 1
        },
        images: {
          where: { isPrimary: true },
          take: 1
        },
        _count: {
          select: { reviews: true }
        }
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    }) as Promise<ProductWithDetails[]>
  }

  static async getCategories() {
    return db.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })
  }

  static async getBrands() {
    return db.brand.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    })
  }

  static async getProductVariants(productId: string) {
    return db.productVariant.findMany({
      where: {
        productId,
        isActive: true
      },
      orderBy: { price: 'asc' }
    })
  }

  static async updateStock(variantId: string, quantity: number) {
    return db.productVariant.update({
      where: { id: variantId },
      data: {
        stock: {
          decrement: quantity
        }
      }
    })
  }

  static async getProductStats() {
    const [totalProducts, activeProducts, lowStockVariants, categories] = await Promise.all([
      db.product.count(),
      db.product.count({ where: { isActive: true, status: 'ACTIVE' } }),
      db.productVariant.count({
        where: {
          stock: {
            lte: db.productVariant.fields.lowStockThreshold
          }
        }
      }),
      db.category.count({ where: { isActive: true } })
    ])

    return {
      totalProducts,
      activeProducts,
      lowStockVariants,
      categories
    }
  }
}
