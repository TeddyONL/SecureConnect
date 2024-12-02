import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { Prisma } from '@prisma/client';

type Role = 'user' | 'admin' | 'super_admin';

export class AdminService {
  static async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      totalBusinesses,
      verifiedBusinesses,
      pendingVerifications,
      totalReviews,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.business.count(),
      prisma.business.count({ where: { isVerified: true } }),
      prisma.business.count({ where: { isVerified: false } }),
      prisma.review.count(),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalBusinesses,
      verifiedBusinesses,
      pendingVerifications,
      totalReviews,
      totalReports: 0,
      pendingReports: 0,
    };
  }

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
          { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
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
