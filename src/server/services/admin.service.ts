import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { Prisma, Role } from '@prisma/client';

export class AdminService {
  static async getUsers(query: {
    search?: string;
    role?: Role;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { search, role, isActive, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
          { name: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
        ],
      }),
      ...(role && { role }),
      ...(typeof isActive === 'boolean' && { isActive }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async updateUser(userId: string, updateData: {
    name?: string;
    role?: Role;
    isActive?: boolean;
  }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  static async getSystemStats() {
    const [
      totalUsers,
      activeUsers,
      totalPayments,
      completedPayments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.payment.count(),
      prisma.payment.count({ where: { status: 'completed' } }),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
      },
      payments: {
        total: totalPayments,
        completed: completedPayments,
      },
    };
  }
}
