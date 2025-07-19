import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/services';
import { auth } from '@/lib/auth';

// GET /api/orders - Get all orders
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const search = searchParams.get('search');

    const filters = {
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus }),
      ...(search && { search }),
    };

    const result = await OrderService.getOrders({
      filters,
      page,
      limit,
      sort: { field: 'createdAt', direction: 'desc' }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
