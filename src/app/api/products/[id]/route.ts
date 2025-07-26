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
      price: body.price ? parseFloat(body.price) : undefined,
      compareAtPrice: body.compareAtPrice ? parseFloat(body.compareAtPrice) : undefined,
      costPrice: body.costPrice ? parseFloat(body.costPrice) : undefined,
      trackQuantity: body.trackQuantity,
      quantity: body.quantity ? parseInt(body.quantity) : undefined,
      lowStockThreshold: body.lowStockThreshold ? parseInt(body.lowStockThreshold) : undefined,
      weight: body.weight ? parseFloat(body.weight) : undefined,
      categoryId: body.categoryId,
      brandId: body.brandId,
      tags: body.tags,
      isActive: body.isActive,
      isFeatured: body.isFeatured,
      images: body.images
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
