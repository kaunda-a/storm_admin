import { NextRequest, NextResponse } from 'next/server';
import { UserService, hasPermission, canManageUser } from '@/lib/services/users';
import { auth } from '@/lib/auth';
import { UserRole } from '@prisma/client';

// GET /api/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Users can view their own profile, or if they have permission to read users
    const canView = id === session.user.id || hasPermission(session.user.role as UserRole, 'users', 'read');
    
    if (!canView) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const user = await UserService.getUserById(id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove password from response
    const { password, ...userResponse } = user;
    return NextResponse.json(userResponse);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user
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

    // Get the target user to check permissions
    const targetUser = await UserService.getUserById(id);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check permissions
    const isOwnProfile = id === session.user.id;
    const canUpdate = isOwnProfile || hasPermission(session.user.role as UserRole, 'users', 'update');
    
    if (!canUpdate) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If updating someone else's profile, check role hierarchy
    if (!isOwnProfile && !canManageUser(session.user.role as UserRole, targetUser.role)) {
      return NextResponse.json({ error: 'Cannot manage user with equal or higher role' }, { status: 403 });
    }

    // Prepare update data
    const updateData: any = {};
    
    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    
    // Only allow email and role changes if user has admin permissions and it's not their own profile
    if (!isOwnProfile && hasPermission(session.user.role as UserRole, 'users', 'update')) {
      if (body.email !== undefined) updateData.email = body.email;
      if (body.role !== undefined) updateData.role = body.role;
    }
    
    // Password updates (users can update their own password, admins can reset others)
    if (body.password !== undefined) {
      if (isOwnProfile || hasPermission(session.user.role as UserRole, 'users', 'update')) {
        updateData.password = body.password;
      }
    }

    const user = await UserService.updateUser(id, updateData);
    
    // Remove password from response
    const { password, ...userResponse } = user;
    return NextResponse.json(userResponse);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user
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

    // Check if user has permission to delete users
    if (!hasPermission(session.user.role as UserRole, 'users', 'delete')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Prevent self-deletion
    if (id === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Get the target user to check role hierarchy
    const targetUser = await UserService.getUserById(id);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check role hierarchy
    if (!canManageUser(session.user.role as UserRole, targetUser.role)) {
      return NextResponse.json({ error: 'Cannot delete user with equal or higher role' }, { status: 403 });
    }

    await UserService.deleteUser(id);
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
