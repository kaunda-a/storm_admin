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
  const customerData = [
    {
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+27 82 123 4567',
      imageUrl: '/avatar.jpg'
    },
    {
      email: 'jane.smith@example.com', 
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+27 83 987 6543',
      imageUrl: '/avatar.jpg'
    },
    {
      email: 'thabo.mthembu@gmail.com',
      firstName: 'Thabo',
      lastName: 'Mthembu', 
      phone: '+27 84 555 7890',
      imageUrl: '/avatar.jpg'
    },
    {
      email: 'nomsa.dlamini@yahoo.com',
      firstName: 'Nomsa',
      lastName: 'Dlamini',
      phone: '+27 73 246 8135',
      imageUrl: '/avatar.jpg'
    },
    {
      email: 'sipho.nkosi@webmail.co.za',
      firstName: 'Sipho', 
      lastName: 'Nkosi',
      phone: '+27 76 891 2345',
      imageUrl: '/avatar.jpg'
    },
    {
      email: 'precious.mabaso@outlook.com',
      firstName: 'Precious',
      lastName: 'Mabaso',
      phone: '+27 78 654 3210',
      imageUrl: '/avatar.jpg'
    }
  ]

  const customers = []
  for (const customerInfo of customerData) {
    const customer = await prisma.customer.create({
      data: {
        email: customerInfo.email,
        password: await bcrypt.hash('customer123', 12),
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        phone: customerInfo.phone,
        imageUrl: customerInfo.imageUrl,
        emailVerified: new Date()
      }
    })
    customers.push(customer)
  }

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
    }),
    prisma.brand.create({
      data: {
        name: 'Nike',
        slug: 'nike',
        description: 'Just Do It - Global athletic footwear leader',
        isActive: true
      }
    }),
    prisma.brand.create({
      data: {
        name: 'Adidas',
        slug: 'adidas',
        description: 'Impossible is Nothing - Performance and style',
        isActive: true
      }
    }),
    prisma.brand.create({
      data: {
        name: 'Puma',
        slug: 'puma',
        description: 'Forever Faster - Athletic lifestyle brand',
        isActive: true
      }
    }),
    prisma.brand.create({
      data: {
        name: 'Converse',
        slug: 'converse',
        description: 'Iconic all-star sneakers since 1908',
        isActive: true
      }
    }),
    prisma.brand.create({
      data: {
        name: 'Vans',
        slug: 'vans',
        description: 'Off The Wall - Skateboarding and street culture',
        isActive: true
      }
    })
  ])

  // Create sample products
  console.log('👟 Creating sample products...')
  
  // Define realistic footwear products with detailed descriptions
  const productData = [
    {
      name: 'Nike Air Max 270',
      slug: 'nike-air-max-270',
      description: 'The Nike Air Max 270 delivers visible cushioning under every step. The design draws inspiration from Air Max icons, showcasing Nike\'s greatest innovation with the brand\'s largest heel Air unit yet.',
      shortDescription: 'Modern comfort meets iconic style',
      sku: 'NK-AM270-001',
      categoryId: categories[0].id, // Sneakers
      brandId: brands[3].id, // Nike
      tags: ['athletic', 'cushioned', 'lifestyle', 'air-max'],
      price: 2299.99,
      featured: true
    },
    {
      name: 'Adidas Stan Smith',
      slug: 'adidas-stan-smith',
      description: 'Clean, classic and timeless. These Stan Smith shoes honor the legacy of the tennis legend with the same crisp leather upper and perforated 3-Stripes that made the original a legend.',
      shortDescription: 'Timeless tennis-inspired sneakers',
      sku: 'AD-SS-001',
      categoryId: categories[0].id, // Sneakers
      brandId: brands[4].id, // Adidas
      tags: ['classic', 'tennis', 'leather', 'minimalist'],
      price: 1899.99,
      featured: true
    },
    {
      name: 'Puma Suede Classic',
      slug: 'puma-suede-classic',
      description: 'The Puma Suede Classic returns with its iconic DNA intact. Featuring premium suede upper, the signature Puma Formstrip, and a rubber outsole for durability.',
      shortDescription: 'Iconic suede sneakers',
      sku: 'PM-SC-001',
      categoryId: categories[0].id, // Sneakers
      brandId: brands[5].id, // Puma
      tags: ['retro', 'suede', 'classic', 'streetwear'],
      price: 1699.99,
      featured: true
    },
    {
      name: 'Converse Chuck Taylor All Star',
      slug: 'converse-chuck-taylor-all-star',
      description: 'The original basketball shoe and an American icon. The unmistakable silhouette and classic details make this the authentic sneaker with heritage and heart.',
      shortDescription: 'Original canvas high-top sneakers',
      sku: 'CV-CT-001',
      categoryId: categories[0].id, // Sneakers
      brandId: brands[6].id, // Converse
      tags: ['canvas', 'high-top', 'classic', 'iconic'],
      price: 1299.99,
      featured: false
    },
    {
      name: 'Vans Old Skool',
      slug: 'vans-old-skool',
      description: 'The Vans Old Skool is the original waffle outsole skate shoe. Built with a durable suede and canvas upper, this lace-up style features reinforced toe caps.',
      shortDescription: 'Classic skateboarding sneakers',
      sku: 'VN-OS-001',
      categoryId: categories[0].id, // Sneakers
      brandId: brands[7].id, // Vans
      tags: ['skateboard', 'suede', 'canvas', 'street'],
      price: 1499.99,
      featured: true
    },
    {
      name: 'Mzansi Heritage Runner',
      slug: 'mzansi-heritage-runner',
      description: 'Inspired by South African heritage, these running shoes combine traditional patterns with modern performance technology. Perfect for both city runs and cultural pride.',
      shortDescription: 'South African inspired running shoes',
      sku: 'MZ-HR-001',
      categoryId: categories[0].id, // Sneakers
      brandId: brands[0].id, // Mzansi Original
      tags: ['running', 'heritage', 'performance', 'south-african'],
      price: 1799.99,
      featured: true
    },
    {
      name: 'Ubuntu Executive Oxford',
      slug: 'ubuntu-executive-oxford',
      description: 'Handcrafted leather Oxford shoes representing the Ubuntu philosophy - premium craftsmanship with a touch of African elegance. Perfect for boardroom meetings.',
      shortDescription: 'Premium leather Oxford shoes',
      sku: 'UB-EO-001',
      categoryId: categories[1].id, // Formal Shoes
      brandId: brands[1].id, // Ubuntu Shoes
      tags: ['formal', 'leather', 'oxford', 'handcrafted'],
      price: 3299.99,
      featured: true
    },
    {
      name: 'Kasi Street Boot',
      slug: 'kasi-street-boot',
      description: 'Inspired by township style, these boots blend urban fashion with durability. Made for the streets, designed for style, built to last.',
      shortDescription: 'Urban township-inspired boots',
      sku: 'KK-SB-001',
      categoryId: categories[2].id, // Boots
      brandId: brands[2].id, // Kasi Kicks
      tags: ['urban', 'boots', 'township', 'durable'],
      price: 2199.99,
      featured: false
    },
    {
      name: 'Nike Revolution 6',
      slug: 'nike-revolution-6',
      description: 'The Nike Revolution 6 provides a soft ride for everyday runs. Computer-generated outsole pattern offers traction on multiple surfaces.',
      shortDescription: 'Everyday running sneakers',
      sku: 'NK-R6-001',
      categoryId: categories[0].id, // Sneakers
      brandId: brands[3].id, // Nike
      tags: ['running', 'everyday', 'comfort', 'affordable'],
      price: 1399.99,
      featured: false
    },
    {
      name: 'Adidas Ultraboost 22',
      slug: 'adidas-ultraboost-22',
      description: 'Experience endless energy with every step. The Ultraboost 22 features responsive BOOST midsole and a flexible knit upper.',
      shortDescription: 'High-performance running shoes',
      sku: 'AD-UB22-001',
      categoryId: categories[0].id, // Sneakers
      brandId: brands[4].id, // Adidas
      tags: ['running', 'boost', 'performance', 'energy'],
      price: 3499.99,
      featured: true
    }
  ]

  const products = []
  for (const productInfo of productData) {
    const product = await prisma.product.create({
      data: {
        name: productInfo.name,
        slug: productInfo.slug,
        description: productInfo.description,
        shortDescription: productInfo.shortDescription,
        sku: productInfo.sku,
        categoryId: productInfo.categoryId,
        brandId: productInfo.brandId,
        status: 'ACTIVE',
        isActive: true,
        isFeatured: productInfo.featured,
        tags: productInfo.tags
      }
    })
    products.push(product)
  }

  // Add product images
  console.log('📸 Creating product images...')
  const shoeImages = [
    'sneakers (1).jpeg', 'sneakers (2).jpeg', 'sneakers (3).jpeg', 
    'sneakers (4).jpeg', 'sneakers (5).jpeg', 'sneakers (6).jpeg',
    'sneakers (7).jpeg', 'sneakers (8).jpeg', 'sneakers (9).jpeg', 'sneakers (10).jpeg'
  ]

  // Add images for each product
  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    const imageIndex = i % shoeImages.length
    
    // Add primary image
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: `/shoes/${shoeImages[imageIndex]}`,
        altText: `${product.name} - Main view`,
        sortOrder: 0,
        isPrimary: true
      }
    })

    // Add secondary image if available
    const secondaryImageIndex = (i + 1) % shoeImages.length
    if (secondaryImageIndex !== imageIndex) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: `/shoes/${shoeImages[secondaryImageIndex]}`,
          altText: `${product.name} - Side view`,
          sortOrder: 1,
          isPrimary: false
        }
      })
    }
  }

  // Create product variants
  console.log('📏 Creating product variants...')
  const sizes = ['6', '7', '8', '9', '10', '11', '12']
  const colors = ['Black', 'White', 'Brown', 'Navy', 'Grey', 'Red', 'Blue']
  
  // Get pricing from productData
  const productPrices = productData.reduce((acc, p) => {
    acc[p.sku] = p.price
    return acc
  }, {} as Record<string, number>)

  for (const product of products) {
    const basePrice = productPrices[product.sku] || 1299.99
    const variantCount = Math.min(4, colors.length) // 4 variants per product
    
    for (let i = 0; i < variantCount; i++) {
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          size: sizes[i + 2], // Start from size 8
          color: colors[i],
          sku: `${product.sku}-${sizes[i + 2]}-${colors[i].toUpperCase()}`,
          price: basePrice + (i * 100), // Slight price variation
          comparePrice: basePrice + (i * 100) + 300,
          costPrice: (basePrice + (i * 100)) * 0.6, // 60% of retail
          stock: 50 - (i * 5),
          lowStockThreshold: 10,
          weight: 0.8 + (i * 0.1),
          isActive: true
        }
      })
    }
  }

  // Create billboards
  console.log('📢 Creating billboards...')
  const billboardData = [
    {
      title: 'Summer Sale 2024',
      description: 'Up to 50% off on selected footwear - Limited time offer on Nike, Adidas & more!',
      linkUrl: '/products?sale=true',
      linkText: 'Shop Sale Now',
      imageUrl: '/shoes/sneakers (1).jpeg',
      type: 'SALE' as const,
      position: 'HEADER' as const,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      sortOrder: 1,
      createdBy: superAdmin.id
    },
    {
      title: 'New Collection Launch',
      description: 'Discover our latest footwear collection featuring premium South African brands',
      linkUrl: '/products?featured=true',
      linkText: 'Explore Collection',
      imageUrl: '/shoes/sneakers (5).jpeg',
      type: 'PRODUCT_LAUNCH' as const,
      position: 'DASHBOARD_TOP' as const,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      sortOrder: 2,
      createdBy: manager.id
    },
    {
      title: 'Mzansi Heritage Collection',
      description: 'Celebrate South African style with our exclusive heritage footwear line',
      linkUrl: '/brands/mzansi-original',
      linkText: 'View Heritage',
      imageUrl: '/shoes/sneakers (3).jpeg',
      type: 'BRAND_CAMPAIGN' as const,
      position: 'SIDEBAR' as const,
      startDate: new Date(),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      sortOrder: 3,
      createdBy: superAdmin.id
    },
    {
      title: 'Free Shipping Weekend',
      description: 'Free shipping on all orders this weekend only - No minimum purchase required',
      linkUrl: '/products',
      linkText: 'Shop Now',
      imageUrl: '/shoes/sneakers (7).jpeg',
      type: 'PROMOTIONAL' as const,
      position: 'FOOTER' as const,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      sortOrder: 4,
      createdBy: manager.id
    }
  ]

  for (const billboardInfo of billboardData) {
    await prisma.billboard.create({
      data: {
        title: billboardInfo.title,
        description: billboardInfo.description,
        imageUrl: billboardInfo.imageUrl,
        linkUrl: billboardInfo.linkUrl,
        linkText: billboardInfo.linkText,
        type: billboardInfo.type,
        position: billboardInfo.position,
        isActive: true,
        startDate: billboardInfo.startDate,
        endDate: billboardInfo.endDate,
        sortOrder: billboardInfo.sortOrder,
        createdBy: billboardInfo.createdBy
      }
    })
  }

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
  console.log(`- ${customers.length} customers with phone numbers and avatars`)
  console.log(`- ${categories.length} categories`)
  console.log(`- ${brands.length} brands`)
  console.log(`- ${products.length} realistic footwear products`)
  console.log(`- ${products.length * 4} product variants`)
  console.log(`- ${products.length * 2} product images`)
  console.log(`- 4 billboards with images and call-to-action links`)
  console.log(`- 2 marquee messages`)
  console.log(`\n👟 Featured Products:`)
  console.log(`- Nike Air Max 270, Adidas Stan Smith, Puma Suede Classic`)
  console.log(`- Vans Old Skool, Mzansi Heritage Runner, Ubuntu Executive Oxford`)
  console.log(`- Adidas Ultraboost 22`)
  console.log(`\n👥 Sample Customers:`)
  console.log(`- John Doe, Jane Smith, Thabo Mthembu`)
  console.log(`- Nomsa Dlamini, Sipho Nkosi, Precious Mabaso`)
  console.log(`- All with South African phone numbers`)
  console.log(`\n📢 Billboards:`)
  console.log(`- Summer Sale 2024 (Header)`)
  console.log(`- New Collection Launch (Dashboard)`) 
  console.log(`- Mzansi Heritage Collection (Sidebar)`)
  console.log(`- Free Shipping Weekend (Footer)`)
  console.log(`\n🔑 Admin Login:`)
  console.log(`Email: admin@mzansifootwear.com`)
  console.log(`Password: admin123`)
  console.log(`\n🔑 Manager Login:`)
  console.log(`Email: manager@mzansifootwear.com`)
  console.log(`Password: admin123`)
  console.log(`\n📸 Images: Products & billboards linked to /shoes/sneakers (1-10).jpeg`)
  console.log(`👤 Customer avatars: /avatar.jpg`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
