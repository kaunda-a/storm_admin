import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services';
import { auth } from '@/lib/auth';

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow admins to view users
    const currentUser = await UserService.getUserById(session.user.id);
    if (!currentUser || !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const role = searchParams.get('role');

    const filters = {
      ...(search && { search }),
      ...(role && { role }),
    };

    const result = await UserService.getUsers({
      filters,
      page,
      limit,
      sort: { field: 'createdAt', direction: 'desc' }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow admins to create users
    const currentUser = await UserService.getUserById(session.user.id);
    if (!currentUser || !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    
    const userData = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      role: body.role || 'USER',
      imageUrl: body.imageUrl || undefined,
    };

    const user = await UserService.createUser(userData);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
