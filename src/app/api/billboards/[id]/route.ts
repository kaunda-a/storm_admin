import { NextRequest, NextResponse } from 'next/server';
import { BillboardService } from '@/lib/services';
import { auth } from '@/lib/auth';

// GET /api/billboards/[id] - Get billboard by ID
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
    const billboard = await BillboardService.getBillboardById(id);
    
    if (!billboard) {
      return NextResponse.json({ error: 'Billboard not found' }, { status: 404 });
    }

    return NextResponse.json(billboard);
  } catch (error) {
    console.error('Error fetching billboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billboard' },
      { status: 500 }
    );
  }
}

// PUT /api/billboards/[id] - Update billboard
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

    const billboard = await BillboardService.updateBillboard(id, data);
    return NextResponse.json(billboard);
  } catch (error) {
    console.error('Error updating billboard:', error);
    return NextResponse.json(
      { error: 'Failed to update billboard' },
      { status: 500 }
    );
  }
}

// DELETE /api/billboards/[id] - Delete billboard
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
    await BillboardService.deleteBillboard(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting billboard:', error);
    return NextResponse.json(
      { error: 'Failed to delete billboard' },
      { status: 500 }
    );
  }
}
