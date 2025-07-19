import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/services';
import { auth } from '@/lib/auth';

// GET /api/brands - Get all brands
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const brands = await ProductService.getBrands();
    return NextResponse.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}

// POST /api/brands - Create new brand
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const brandData = {
      name: body.name,
      description: body.description || undefined,
      logoUrl: body.logoUrl || undefined,
      websiteUrl: body.websiteUrl || undefined,
      isActive: body.isActive !== undefined ? body.isActive : true,
    };

    const brand = await ProductService.createBrand(brandData);
    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    console.error('Error creating brand:', error);
    return NextResponse.json(
      { error: 'Failed to create brand' },
      { status: 500 }
    );
  }
}
