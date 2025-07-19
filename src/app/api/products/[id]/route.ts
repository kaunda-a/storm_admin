import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/services';
import { auth } from '@/lib/auth';

// GET /api/products/[id] - Get product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const product = await ProductService.getProductById(id);
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
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
      variants: body.variants || []
    };

    const product = await ProductService.updateProduct(id, productData);
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await ProductService.deleteProduct(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
