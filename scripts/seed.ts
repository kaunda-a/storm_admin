import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data (in correct order to avoid foreign key constraints)
  console.log('🧹 Cleaning existing data...')
  await prisma.orderItem.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.order.deleteMany()
  await prisma.review.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.product.deleteMany()
  await prisma.address.deleteMany()
  await prisma.marqueeMessage.deleteMany()
  await prisma.billboard.deleteMany()
  await prisma.analyticsEvent.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.category.deleteMany()

  // Create admin user
  console.log('👤 Creating admin user...')
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@mzansifootwear.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      emailVerified: new Date()
    }
  })

  const manager = await prisma.user.create({
    data: {
      email: 'manager@mzansifootwear.com',
      password: hashedPassword,
      firstName: 'Store',
      lastName: 'Manager',
      role: 'MANAGER',
      emailVerified: new Date()
    }
  })

  // Create sample customers
  console.log('👥 Creating sample customers...')
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        email: 'john.doe@example.com',
        password: await bcrypt.hash('customer123', 12),
        firstName: 'John',
        lastName: 'Doe',
        emailVerified: new Date()
      }
    }),
    prisma.customer.create({
      data: {
        email: 'jane.smith@example.com',
        password: await bcrypt.hash('customer123', 12),
        firstName: 'Jane',
        lastName: 'Smith',
        emailVerified: new Date()
      }
    })
  ])

  // Create categories
  console.log('📂 Creating categories...')
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Sneakers',
        slug: 'sneakers',
        description: 'Comfortable and stylish sneakers for everyday wear',
        isActive: true,
        sortOrder: 1
      }
    }),
    prisma.category.create({
      data: {
        name: 'Formal Shoes',
        slug: 'formal-shoes',
        description: 'Elegant formal shoes for business and special occasions',
        isActive: true,
        sortOrder: 2
      }
    }),
    prisma.category.create({
      data: {
        name: 'Boots',
        slug: 'boots',
        description: 'Durable boots for work and outdoor activities',
        isActive: true,
        sortOrder: 3
      }
    }),
    prisma.category.create({
      data: {
        name: 'Sandals',
        slug: 'sandals',
        description: 'Comfortable sandals for casual and beach wear',
        isActive: true,
        sortOrder: 4
      }
    })
  ])

  // Create brands
  console.log('🏷️ Creating brands...')
  const brands = await Promise.all([
    prisma.brand.create({
      data: {
        name: 'Mzansi Original',
        slug: 'mzansi-original',
        description: 'Premium South African footwear brand',
        isActive: true
      }
    }),
    prisma.brand.create({
      data: {
        name: 'Ubuntu Shoes',
        slug: 'ubuntu-shoes',
        description: 'Traditional meets modern footwear',
        isActive: true
      }
    }),
    prisma.brand.create({
      data: {
        name: 'Kasi Kicks',
        slug: 'kasi-kicks',
        description: 'Street-style footwear for the youth',
        isActive: true
      }
    })
  ])

  // Create sample products
  console.log('👟 Creating sample products...')
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Classic White Sneakers',
        slug: 'classic-white-sneakers',
        description: 'Timeless white sneakers perfect for any casual outfit',
        shortDescription: 'Classic white sneakers for everyday wear',
        sku: 'MZ-SNK-001',
        categoryId: categories[0].id, // Sneakers
        brandId: brands[0].id, // Mzansi Original
        status: 'ACTIVE',
        isActive: true,
        isFeatured: true,
        tags: ['casual', 'white', 'comfortable']
      }
    }),
    prisma.product.create({
      data: {
        name: 'Executive Leather Shoes',
        slug: 'executive-leather-shoes',
        description: 'Premium leather shoes for the modern professional',
        shortDescription: 'Premium leather formal shoes',
        sku: 'MZ-FRM-001',
        categoryId: categories[1].id, // Formal Shoes
        brandId: brands[1].id, // Ubuntu Shoes
        status: 'ACTIVE',
        isActive: true,
        isFeatured: true,
        tags: ['formal', 'leather', 'business']
      }
    }),
    prisma.product.create({
      data: {
        name: 'Urban Street Boots',
        slug: 'urban-street-boots',
        description: 'Stylish boots for the urban explorer',
        shortDescription: 'Trendy urban boots',
        sku: 'MZ-BOT-001',
        categoryId: categories[2].id, // Boots
        brandId: brands[2].id, // Kasi Kicks
        status: 'ACTIVE',
        isActive: true,
        isFeatured: false,
        tags: ['boots', 'urban', 'trendy']
      }
    })
  ])

  // Create product variants
  console.log('📏 Creating product variants...')
  const sizes = ['6', '7', '8', '9', '10', '11', '12']
  const colors = ['Black', 'White', 'Brown', 'Navy']

  for (const product of products) {
    for (let i = 0; i < 3; i++) { // 3 variants per product
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          size: sizes[i + 2], // Start from size 8
          color: colors[i],
          sku: `${product.sku}-${sizes[i + 2]}-${colors[i].toUpperCase()}`,
          price: 1299.99 + (i * 200), // Varying prices
          comparePrice: 1499.99 + (i * 200),
          costPrice: 800.00 + (i * 100),
          stock: 50 - (i * 10),
          lowStockThreshold: 10,
          weight: 0.8,
          isActive: true,

        }
      })
    }
  }

  // Create billboards
  console.log('📢 Creating billboards...')
  await Promise.all([
    prisma.billboard.create({
      data: {
        title: 'Summer Sale 2024',
        description: 'Up to 50% off on selected footwear',
        type: 'SALE',
        position: 'HEADER',
        isActive: true,
        sortOrder: 1,
        createdBy: superAdmin.id
      }
    }),
    prisma.billboard.create({
      data: {
        title: 'New Collection Launch',
        description: 'Discover our latest footwear collection',
        type: 'PRODUCT_LAUNCH',
        position: 'DASHBOARD_TOP',
        isActive: true,
        sortOrder: 2,
        createdBy: manager.id
      }
    })
  ])

  // Create marquee messages
  console.log('📝 Creating marquee messages...')
  await Promise.all([
    prisma.marqueeMessage.create({
      data: {
        title: 'Free Shipping',
        message: 'Free shipping on orders over R500',
        type: 'PROMOTION',
        priority: 1,
        isActive: true,
        createdBy: superAdmin.id
      }
    }),
    prisma.marqueeMessage.create({
      data: {
        title: 'Store Hours',
        message: 'Open Monday to Saturday: 9AM - 6PM',
        type: 'INFO',
        priority: 2,
        isActive: true,
        createdBy: manager.id
      }
    })
  ])

  console.log('✅ Seed completed successfully!')
  console.log(`Created:`)
  console.log(`- ${2} admin users`)
  console.log(`- ${customers.length} customers`)
  console.log(`- ${categories.length} categories`)
  console.log(`- ${brands.length} brands`)
  console.log(`- ${products.length} products`)
  console.log(`- ${products.length * 3} product variants`)
  console.log(`- 2 billboards`)
  console.log(`- 2 marquee messages`)
  console.log(`\n🔑 Admin Login:`)
  console.log(`Email: admin@mzansifootwear.com`)
  console.log(`Password: admin123`)
  console.log(`\n🔑 Manager Login:`)
  console.log(`Email: manager@mzansifootwear.com`)
  console.log(`Password: admin123`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
