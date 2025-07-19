import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/services';
import { auth } from '@/lib/auth';

// GET /api/orders/[id] - Get order by ID
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
    const order = await OrderService.getOrderById(id);
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] - Update order (status, notes, etc.)
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

    // Only allow certain fields to be updated
    const allowedUpdates = {
      status: body.status,
      paymentStatus: body.paymentStatus,
      shippingStatus: body.shippingStatus,
      notes: body.notes,
      trackingNumber: body.trackingNumber,
      shippedAt: body.shippedAt ? new Date(body.shippedAt) : undefined,
      deliveredAt: body.deliveredAt ? new Date(body.deliveredAt) : undefined,
    };

    // Remove undefined values
    const updateData = Object.fromEntries(
      Object.entries(allowedUpdates).filter(([_, value]) => value !== undefined)
    );

    const order = await OrderService.updateOrder(id, updateData);
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/[id] - Cancel order
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

    // Only allow cancellation of pending/processing orders
    const order = await OrderService.getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!['PENDING', 'PROCESSING'].includes(order.status)) {
      return NextResponse.json(
        { error: 'Cannot cancel order in current status' },
        { status: 400 }
      );
    }

    const cancelledOrder = await OrderService.updateOrder(id, {
      status: 'CANCELLED',
      notes: `Order cancelled by ${session.user.email} on ${new Date().toISOString()}`
    });

    return NextResponse.json(cancelledOrder);
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
