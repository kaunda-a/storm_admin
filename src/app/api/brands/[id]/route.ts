import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/services';
import { auth } from '@/lib/auth';

// GET /api/brands/[id] - Get brand by ID
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
    const brand = await ProductService.getBrandById(id);
    
    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brand' },
      { status: 500 }
    );
  }
}

// PUT /api/brands/[id] - Update brand
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
    
    const updateData = {
      name: body.name,
      description: body.description || undefined,
      logoUrl: body.logoUrl || undefined,
      websiteUrl: body.websiteUrl || undefined,
      isActive: body.isActive !== undefined ? body.isActive : undefined,
    };

    // Remove undefined values
    const cleanData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    const brand = await ProductService.updateBrand(id, cleanData);
    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error updating brand:', error);
    return NextResponse.json(
      { error: 'Failed to update brand' },
      { status: 500 }
    );
  }
}

// DELETE /api/brands/[id] - Delete brand
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
    
    // Check if brand has products
    const productsCount = await ProductService.getProductsCountByBrand(id);
    if (productsCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete brand. It has ${productsCount} products assigned to it.` },
        { status: 400 }
      );
    }

    await ProductService.deleteBrand(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json(
      { error: 'Failed to delete brand' },
      { status: 500 }
    );
  }
}
