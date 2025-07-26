import { NextRequest, NextResponse } from 'next/server';
import { BillboardService } from '@/lib/services';
import { auth } from '@/lib/auth';

// GET /api/billboards - Get all billboards
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const result = await BillboardService.getAllBillboards({ page, limit });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching billboards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billboards' },
      { status: 500 }
    );
  }
}

// POST /api/billboards - Create new billboard
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

    const billboard = await BillboardService.createBillboard(data);
    return NextResponse.json(billboard, { status: 201 });
  } catch (error) {
    console.error('Error creating billboard:', error);
    return NextResponse.json(
      { error: 'Failed to create billboard' },
      { status: 500 }
    );
  }
}
