import { NextRequest, NextResponse } from 'next/server';
import { MarqueeService } from '@/lib/services';
import { auth } from '@/lib/auth';

// GET /api/marquee - Get all marquee messages
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const result = await MarqueeService.getAllMessages({ page, limit });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching marquee messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch marquee messages' },
      { status: 500 }
    );
  }
}

// POST /api/marquee - Create new marquee message
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = {
      ...body,
      createdBy: session.user.id,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    };

    const marquee = await MarqueeService.createMessage(data);
    return NextResponse.json(marquee, { status: 201 });
  } catch (error) {
    console.error('Error creating marquee message:', error);
    return NextResponse.json(
      { error: 'Failed to create marquee message' },
      { status: 500 }
    );
  }
}
