import { NextRequest, NextResponse } from 'next/server';
import { UserService, hasPermission } from '@/lib/services/users';
import { auth } from '@/lib/auth';
import { UserRole } from '@prisma/client';

// GET /api/users - Get all users (with pagination and filtering)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to read users
    if (!hasPermission(session.user.role as UserRole, 'users', 'read')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const role = searchParams.get('role') as UserRole || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const result = await UserService.getUsers({
      search,
      role,
      page,
      limit,
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

    // Check if user has permission to create users
    if (!hasPermission(session.user.role as UserRole, 'users', 'create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.email || !body.password || !body.role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await UserService.getUserByEmail(body.email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    const userData = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      password: body.password,
      role: body.role as UserRole,
      imageUrl: body.imageUrl || undefined,
    };

    const user = await UserService.createUser(userData);
    
    // Remove password from response
    const { password, ...userResponse } = user;
    return NextResponse.json(userResponse, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
