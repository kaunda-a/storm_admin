import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    const email = 'admin@mzansifootwear.com'
    const password = 'admin123'
    
    // Check if admin already exists
    const existingAdmin = await prisma.customer.findUnique({
      where: { email }
    })
    
    if (existingAdmin) {
      console.log('Admin customer already exists')
      return
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Create admin customer
    const admin = await prisma.customer.create({
      data: {
        email,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Customer',
        role: 'SUPER_ADMIN'
      }
    })
    
    console.log('Admin customer created successfully:')
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('ID:', admin.id)
    
  } catch (error) {
    console.error('Error creating admin customer:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
