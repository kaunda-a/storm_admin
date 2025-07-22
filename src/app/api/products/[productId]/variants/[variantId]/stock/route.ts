import { NextRequest, NextResponse } from 'next/server';
import { ProductVariantService } from '@/lib/services/product-variants';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; variantId: string }> }
) {
  try {
    const { variantId } = await params;
    const body = await request.json();
    
    const { quantity, adjustment } = body;
    
    let variant;
    if (typeof adjustment === 'number') {
      // Adjust stock (add/subtract)
      variant = await ProductVariantService.adjustVariantStock(variantId, adjustment);
    } else if (typeof quantity === 'number') {
      // Set absolute stock quantity
      variant = await ProductVariantService.updateVariantStock(variantId, quantity);
    } else {
      return NextResponse.json(
        { error: 'Either quantity or adjustment must be provided' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(variant);
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to update stock' },
      { status: 400 }
    );
  }
}
