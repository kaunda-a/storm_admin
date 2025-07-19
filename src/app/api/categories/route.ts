import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/services';
import { auth } from '@/lib/auth';

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categories = await ProductService.getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const categoryData = {
      name: body.name,
      description: body.description || undefined,
      imageUrl: body.imageUrl || undefined,
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdBy: session.user.id
    };

    const category = await ProductService.createCategory(categoryData);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
