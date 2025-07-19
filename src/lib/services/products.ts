import { db } from '@/lib/prisma'
import type { Product, ProductVariant, Category, Brand, ProductStatus } from '@/types/database'

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

  static async createProduct(data: {
    name: string
    description: string
    sku: string
    price: number
    compareAtPrice?: number
    costPrice?: number
    trackQuantity: boolean
    quantity: number
    lowStockThreshold?: number
    weight?: number
    categoryId: string
    brandId: string
    tags?: string[]
    isActive: boolean
    isFeatured: boolean
    images?: string[]
    createdBy: string
  }) {
    // Generate slug from name
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    return db.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        sku: data.sku,
        categoryId: data.categoryId,
        brandId: data.brandId,
        status: data.isActive ? 'ACTIVE' : 'DRAFT',
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        tags: data.tags || [],
        // Create default variant with pricing info
        variants: {
          create: {
            size: 'Default',
            color: 'Default',
            sku: data.sku,
            price: data.price,
            comparePrice: data.compareAtPrice,
            costPrice: data.costPrice,
            stock: data.quantity,
            lowStockThreshold: data.lowStockThreshold || 5,
            weight: data.weight,
            isActive: true,
            isDefault: true
          }
        },
        // Create images if provided
        ...(data.images && data.images.length > 0 && {
          images: {
            create: data.images.map((url, index) => ({
              url,
              altText: data.name,
              isPrimary: index === 0,
              sortOrder: index
            }))
          }
        })
      },
      include: {
        category: true,
        brand: true,
        variants: true,
        images: true,
        _count: {
          select: { reviews: true }
        }
      }
    })
  }

  static async updateProduct(id: string, data: {
    name?: string
    description?: string
    sku?: string
    price?: number
    compareAtPrice?: number
    costPrice?: number
    trackQuantity?: boolean
    quantity?: number
    lowStockThreshold?: number
    weight?: number
    categoryId?: string
    brandId?: string
    tags?: string[]
    isActive?: boolean
    isFeatured?: boolean
    images?: string[]
  }) {
    const updateData: any = {}

    // Update product fields
    if (data.name) {
      updateData.name = data.name
      updateData.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }
    if (data.description !== undefined) updateData.description = data.description
    if (data.sku) updateData.sku = data.sku
    if (data.categoryId) updateData.categoryId = data.categoryId
    if (data.brandId) updateData.brandId = data.brandId
    if (data.tags !== undefined) updateData.tags = data.tags
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive
      updateData.status = data.isActive ? 'ACTIVE' : 'DRAFT'
    }
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured

    // Update default variant if pricing/inventory data provided
    const variantUpdate: any = {}
    if (data.price !== undefined) variantUpdate.price = data.price
    if (data.compareAtPrice !== undefined) variantUpdate.comparePrice = data.compareAtPrice
    if (data.costPrice !== undefined) variantUpdate.costPrice = data.costPrice
    if (data.quantity !== undefined) variantUpdate.stock = data.quantity
    if (data.lowStockThreshold !== undefined) variantUpdate.lowStockThreshold = data.lowStockThreshold
    if (data.weight !== undefined) variantUpdate.weight = data.weight

    return db.product.update({
      where: { id },
      data: {
        ...updateData,
        // Update default variant if we have variant data
        ...(Object.keys(variantUpdate).length > 0 && {
          variants: {
            updateMany: {
              where: { isDefault: true },
              data: variantUpdate
            }
          }
        }),
        // Handle images update if provided
        ...(data.images && {
          images: {
            deleteMany: {},
            create: data.images.map((url, index) => ({
              url,
              altText: data.name || 'Product image',
              isPrimary: index === 0,
              sortOrder: index
            }))
          }
        })
      },
      include: {
        category: true,
        brand: true,
        variants: true,
        images: true,
        _count: {
          select: { reviews: true }
        }
      }
    })
  }

  static async deleteProduct(id: string) {
    // Delete in correct order due to foreign key constraints
    await db.productImage.deleteMany({ where: { productId: id } })
    await db.productVariant.deleteMany({ where: { productId: id } })
    return db.product.delete({ where: { id } })
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
