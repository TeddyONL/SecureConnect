import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { Prisma } from '@prisma/client';
import { BusinessService } from './business.service';

export class ReviewService {
  static async createReview(data: {
    businessId: string;
    userId: string;
    rating: number;
    content: string;
    photos?: string[];
  }) {
    const { businessId, userId, rating, content, photos } = data;

    // Check if user has already reviewed this business
    const existingReview = await prisma.review.findFirst({
      where: {
        businessId,
        userId,
      },
    });

    if (existingReview) {
      throw new ApiError(400, 'You have already reviewed this business');
    }

    const review = await prisma.review.create({
      data: {
        businessId,
        userId,
        rating,
        content,
        photos: photos || [],
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    // Update business stats
    await BusinessService.updateBusinessStats(businessId);

    return review;
  }

  static async updateReview(
    reviewId: string,
    userId: string,
    data: {
      rating?: number;
      content?: string;
      photos?: string[];
    }
  ) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    if (review.userId !== userId) {
      throw new ApiError(403, 'Not authorized to update this review');
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    // Update business stats if rating changed
    if (data.rating) {
      await BusinessService.updateBusinessStats(review.businessId);
    }

    return updatedReview;
  }

  static async deleteReview(reviewId: string, userId: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    if (review.userId !== userId) {
      throw new ApiError(403, 'Not authorized to delete this review');
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    // Update business stats
    await BusinessService.updateBusinessStats(review.businessId);
  }
}