import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { Prisma } from '@prisma/client';
import type { Business } from '@prisma/client';

export class BusinessService {
  static async createBusiness(data: Prisma.BusinessCreateInput) {
    return prisma.business.create({
      data: {
        ...data,
        stats: {
          create: {
            totalReviews: 0,
            averageRating: 0,
            totalViews: 0,
            totalBookmarks: 0,
          },
        },
      },
      include: {
        stats: true,
      },
    });
  }

  static async getBusinesses(params: {
    skip?: number;
    take?: number;
    where?: Prisma.BusinessWhereInput;
    orderBy?: Prisma.BusinessOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;

    const [total, businesses] = await prisma.$transaction([
      prisma.business.count({ where }),
      prisma.business.findMany({
        skip,
        take,
        where,
        orderBy,
        include: {
          stats: true,
          reviews: {
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true } } },
          },
        },
      }),
    ]);

    return { total, businesses };
  }

  static async searchBusinesses(query: string, params: {
    skip?: number;
    take?: number;
    filters?: {
      category?: string;
      isVerified?: boolean;
      minRating?: number;
    };
  }) {
    const { skip, take, filters } = params;

    const where: Prisma.BusinessWhereInput = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
        { keywords: { has: query } },
      ],
      AND: [
        filters?.category ? { category: filters.category } : {},
        filters?.isVerified ? { isVerified: true } : {},
        filters?.minRating ? {
          stats: {
            averageRating: { gte: filters.minRating },
          },
        } : {},
      ],
    };

    const [total, businesses] = await prisma.$transaction([
      prisma.business.count({ where }),
      prisma.business.findMany({
        skip,
        take,
        where,
        include: {
          stats: true,
          reviews: {
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true } } },
          },
        },
      }),
    ]);

    return { total, businesses };
  }

  static async updateBusinessStats(businessId: string) {
    const reviews = await prisma.review.findMany({
      where: { businessId },
      select: { rating: true },
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews
      : 0;

    await prisma.businessStats.update({
      where: { businessId },
      data: {
        totalReviews,
        averageRating,
        updatedAt: new Date(),
      },
    });
  }
}
