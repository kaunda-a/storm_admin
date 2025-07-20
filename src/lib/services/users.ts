import { db } from '@/lib/prisma';
import { User, UserRole } from '@prisma/client';

export type UserWithDetails = User & {
  // Add any relations you want to include here if needed
};

export type UpdateUserData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  imageUrl?: string;
  password?: string;
  role?: UserRole;
};

export const UserService = {
  async getUserById(id: string): Promise<UserWithDetails | null> {
    return db.user.findUnique({
      where: { id },
      // include: { /* add relations here if needed */ },
    });
  },

  async getUserByEmail(email: string): Promise<UserWithDetails | null> {
    return db.user.findUnique({
      where: { email },
    });
  },

  async updateUser(id: string, data: UpdateUserData): Promise<UserWithDetails> {
    return db.user.update({
      where: { id },
      data,
    });
  },

  // Optional: Add getAllUsers, createUser, deleteUser if needed
};

