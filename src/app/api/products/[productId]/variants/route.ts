import { NextRequest, NextResponse } from 'next/server';
import { ProductVariantService } from '@/lib/services/product-variants';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const variants = await ProductVariantService.getProductVariants(productId);
    return NextResponse.json(variants);
  } catch (error) {
    console.error('Error fetching variants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch variants' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const body = await request.json();
    
    // Check if this is a bulk creation request
    if (body.selectedCombinations) {
      const variants = await ProductVariantService.createVariantsFromMatrix({
        ...body,
        productId
      });
      return NextResponse.json(variants, { status: 201 });
    } else {
      // Single variant creation
      const variant = await ProductVariantService.createVariant({
        ...body,
        productId
      });
      return NextResponse.json(variant, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating variant:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to create variant' },
      { status: 400 }
    );
  }
}
