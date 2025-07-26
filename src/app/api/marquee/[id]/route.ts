import { NextRequest, NextResponse } from 'next/server';
import { MarqueeService } from '@/lib/services';
import { auth } from '@/lib/auth';

// GET /api/marquee/[id] - Get marquee message by ID
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
    const marquee = await MarqueeService.getMessageById(id);
    
    if (!marquee) {
      return NextResponse.json({ error: 'Marquee message not found' }, { status: 404 });
    }

    return NextResponse.json(marquee);
  } catch (error) {
    console.error('Error fetching marquee message:', error);
    return NextResponse.json(
      { error: 'Failed to fetch marquee message' },
      { status: 500 }
    );
  }
}

// PUT /api/marquee/[id] - Update marquee message
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
    const data = {
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    };

    const marquee = await MarqueeService.updateMessage(id, data);
    return NextResponse.json(marquee);
  } catch (error) {
    console.error('Error updating marquee message:', error);
    return NextResponse.json(
      { error: 'Failed to update marquee message' },
      { status: 500 }
    );
  }
}

// DELETE /api/marquee/[id] - Delete marquee message
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
    await MarqueeService.deleteMessage(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting marquee message:', error);
    return NextResponse.json(
      { error: 'Failed to delete marquee message' },
      { status: 500 }
    );
  }
}
