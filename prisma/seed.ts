import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'sneakers' },
      update: {},
      create: {
        name: 'Sneakers',
        slug: 'sneakers',
        description: 'Casual and athletic sneakers for everyday wear',
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'formal-shoes' },
      update: {},
      create: {
        name: 'Formal Shoes',
        slug: 'formal-shoes',
        description: 'Professional and dress shoes for formal occasions',
        isActive: true,
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'boots' },
      update: {},
      create: {
        name: 'Boots',
        slug: 'boots',
        description: 'Durable boots for work and outdoor activities',
        isActive: true,
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'sandals' },
      update: {},
      create: {
        name: 'Sandals',
        slug: 'sandals',
        description: 'Comfortable sandals for warm weather',
        isActive: true,
        sortOrder: 4,
      },
    }),
  ])

  // Create Brands
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { slug: 'nike' },
      update: {},
      create: {
        name: 'Nike',
        slug: 'nike',
        description: 'Just Do It - Premium athletic footwear',
        website: 'https://nike.com',
        isActive: true,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'adidas' },
      update: {},
      create: {
        name: 'Adidas',
        slug: 'adidas',
        description: 'Impossible is Nothing - Sports and lifestyle shoes',
        website: 'https://adidas.com',
        isActive: true,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'clarks' },
      update: {},
      create: {
        name: 'Clarks',
        slug: 'clarks',
        description: 'British heritage footwear since 1825',
        website: 'https://clarks.com',
        isActive: true,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'veldskoen' },
      update: {},
      create: {
        name: 'Veldskoen',
        slug: 'veldskoen',
        description: 'Proudly South African heritage footwear',
        website: 'https://veldskoen.com',
        isActive: true,
      },
    }),
  ])

  // Create Sample Products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { slug: 'nike-air-max-90' },
      update: {},
      create: {
        name: 'Nike Air Max 90',
        slug: 'nike-air-max-90',
        description: 'The Nike Air Max 90 stays true to its OG running roots with the iconic Waffle sole, stitched overlays and classic TPU details.',
        shortDescription: 'Classic Nike Air Max with iconic design',
        sku: 'NIKE-AM90-001',
        categoryId: categories[0].id, // Sneakers
        brandId: brands[0].id, // Nike
        status: 'ACTIVE',
        isActive: true,
        isFeatured: true,
        tags: ['running', 'casual', 'air-max', 'retro'],
      },
    }),
    prisma.product.upsert({
      where: { slug: 'adidas-ultraboost-22' },
      update: {},
      create: {
        name: 'Adidas Ultraboost 22',
        slug: 'adidas-ultraboost-22',
        description: 'Experience incredible energy return with every step in these running shoes.',
        shortDescription: 'Premium running shoes with Boost technology',
        sku: 'ADIDAS-UB22-001',
        categoryId: categories[0].id, // Sneakers
        brandId: brands[1].id, // Adidas
        status: 'ACTIVE',
        isActive: true,
        isFeatured: true,
        tags: ['running', 'boost', 'performance', 'comfort'],
      },
    }),
    prisma.product.upsert({
      where: { slug: 'clarks-desert-boot' },
      update: {},
      create: {
        name: 'Clarks Desert Boot',
        slug: 'clarks-desert-boot',
        description: 'The original Clarks Desert Boot, handcrafted since 1950.',
        shortDescription: 'Iconic desert boot in premium suede',
        sku: 'CLARKS-DB-001',
        categoryId: categories[2].id, // Boots
        brandId: brands[2].id, // Clarks
        status: 'ACTIVE',
        isActive: true,
        isFeatured: false,
        tags: ['desert-boot', 'suede', 'classic', 'heritage'],
      },
    }),
  ])

  console.log('✅ Categories created:', categories.length)
  console.log('✅ Brands created:', brands.length)
  console.log('✅ Products created:', products.length)
  // Create admin user for marquee and billboard content
  const adminUser = await prisma.user.create({
    data: {
      clerkId: 'admin_seed_user',
      email: 'admin@mzansifootwear.co.za',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN'
    }
  })

  // Create sample marquee messages
  const marqueeMessages = await Promise.all([
    prisma.marqueeMessage.create({
      data: {
        title: 'System Update',
        message: 'System maintenance scheduled for tonight at 2:00 AM - 4:00 AM SAST',
        type: 'SYSTEM',
        priority: 4,
        createdBy: adminUser.id,
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      }
    }),
    prisma.marqueeMessage.create({
      data: {
        title: 'Low Stock Alert',
        message: 'Nike Air Max 90 running low - only 5 units remaining in size 9',
        type: 'INVENTORY',
        priority: 3,
        createdBy: adminUser.id
      }
    }),
    prisma.marqueeMessage.create({
      data: {
        title: 'Summer Sale',
        message: '🌞 Summer Sale now live! Get up to 50% off on selected footwear - Limited time offer!',
        type: 'PROMOTION',
        priority: 2,
        createdBy: adminUser.id,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      }
    })
  ])

  // Create sample billboards
  const billboards = await Promise.all([
    prisma.billboard.create({
      data: {
        title: 'Summer Collection 2024',
        description: 'Discover our latest summer footwear collection featuring breathable designs and vibrant colors perfect for the South African summer.',
        imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&h=400&fit=crop',
        linkUrl: '/dashboard/products?category=summer',
        linkText: 'Shop Summer Collection',
        type: 'SEASONAL',
        position: 'DASHBOARD_TOP',
        createdBy: adminUser.id,
        sortOrder: 1
      }
    }),
    prisma.billboard.create({
      data: {
        title: 'New Veldskoen Arrivals',
        description: 'Authentic South African veldskoen now available. Handcrafted quality meets modern comfort.',
        imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=1200&h=400&fit=crop',
        linkUrl: '/dashboard/products?brand=veldskoen',
        linkText: 'View Collection',
        type: 'PRODUCT_LAUNCH',
        position: 'HEADER',
        createdBy: adminUser.id,
        sortOrder: 2
      }
    }),
    prisma.billboard.create({
      data: {
        title: 'Black Friday Preview',
        description: 'Get ready for our biggest sale of the year! Black Friday deals coming soon with up to 70% off.',
        imageUrl: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1200&h=400&fit=crop',
        linkUrl: '/dashboard/promotions/black-friday',
        linkText: 'Learn More',
        type: 'PROMOTIONAL',
        position: 'DASHBOARD_TOP',
        createdBy: adminUser.id,
        sortOrder: 3,
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000) // 37 days from now
      }
    })
  ])

  console.log('✅ Marquee messages created:', marqueeMessages.length)
  console.log('✅ Billboards created:', billboards.length)
  console.log('🌱 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
