import { NextRequest, NextResponse } from 'next/server';
import { ProductVariantService } from '@/lib/services/product-variants';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const { variantId } = await params;
    const variant = await ProductVariantService.getVariantById(variantId);
    
    if (!variant) {
      return NextResponse.json(
        { error: 'Variant not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(variant);
  } catch (error) {
    console.error('Error fetching variant:', error);
    return NextResponse.json(
      { error: 'Failed to fetch variant' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const { variantId } = await params;
    const body = await request.json();
    
    const variant = await ProductVariantService.updateVariant(variantId, body);
    return NextResponse.json(variant);
  } catch (error) {
    console.error('Error updating variant:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to update variant' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const { variantId } = await params;
    await ProductVariantService.deleteVariant(variantId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting variant:', error);
    return NextResponse.json(
      { error: 'Failed to delete variant' },
      { status: 500 }
    );
  }
}
