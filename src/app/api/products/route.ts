import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/services';
import { auth } from '@/lib/auth';

// GET /api/products - Get all products
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const categoryId = searchParams.get('categoryId');

    const filters = {
      ...(search && { search }),
      ...(categoryId && { categoryId }),
    };

    const result = await ProductService.getProducts({
      filters,
      page,
      limit,
      sort: { field: 'createdAt', direction: 'desc' }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Transform the data to match ProductService expectations
    const productData = {
      name: body.name,
      description: body.description,
      sku: body.sku,
      price: parseFloat(body.price),
      compareAtPrice: body.compareAtPrice ? parseFloat(body.compareAtPrice) : undefined,
      costPrice: body.costPrice ? parseFloat(body.costPrice) : undefined,
      trackQuantity: body.trackQuantity || false,
      quantity: body.quantity ? parseInt(body.quantity) : 0,
      lowStockThreshold: body.lowStockThreshold ? parseInt(body.lowStockThreshold) : undefined,
      weight: body.weight ? parseFloat(body.weight) : undefined,
      dimensions: body.dimensions || undefined,
      categoryId: body.categoryId || undefined,
      brandId: body.brandId || undefined,
      tags: body.tags || [],
      isActive: body.isActive !== undefined ? body.isActive : true,
      isFeatured: body.isFeatured || false,
      seoTitle: body.seoTitle || undefined,
      seoDescription: body.seoDescription || undefined,
      // Handle images - for now just store URLs, later integrate with file upload
      images: body.images || [],
      // Handle variants if provided
      variants: body.variants || [],
      createdBy: session.user.id
    };

    const product = await ProductService.createProduct(productData);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
