import { Request, Response } from 'express';
import { ReviewService } from '../services/review.service';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';
import { validateReviewInput } from '../validation/review.validation';
import { AuthRequest } from '../middlewares/auth';
import { emitReviewEvent } from '../lib/socket';

export class ReviewController {
  static createReview = catchAsync(async (req: AuthRequest, res: Response) => {
    const { error, value } = validateReviewInput(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, 'Not authenticated');

    const { businessId } = req.params;
    const review = await ReviewService.createReview({
      ...value,
      businessId,
      userId,
    });

    // Emit socket event for real-time updates
    emitReviewEvent('reviewCreated', review);

    res.status(201).json(review);
  });

  static updateReview = catchAsync(async (req: AuthRequest, res: Response) => {
    const { error, value } = validateReviewInput(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, 'Not authenticated');

    const { id } = req.params;
    const review = await ReviewService.updateReview(id, userId, value);

    // Emit socket event for real-time updates
    emitReviewEvent('reviewUpdated', review);

    res.json(review);
  });

  static deleteReview = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, 'Not authenticated');

    const { id } = req.params;
    await ReviewService.deleteReview(id, userId);

    // Emit socket event for real-time updates
    emitReviewEvent('reviewDeleted', { id });

    res.status(204).send();
  });

  static getBusinessReviews = catchAsync(async (req: Request, res: Response) => {
    const { businessId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { reviews, total } = await ReviewService.getBusinessReviews(businessId, {
      skip: (page - 1) * limit,
      take: limit,
    });

    res.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  });

  static getUserReviews = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, 'Not authenticated');

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { reviews, total } = await ReviewService.getUserReviews(userId, {
      skip: (page - 1) * limit,
      take: limit,
    });

    res.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  });

  static toggleReviewLike = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, 'Not authenticated');

    const { id } = req.params;
    const review = await ReviewService.toggleReviewLike(id, userId);

    // Emit socket event for real-time updates
    emitReviewEvent('reviewLikeToggled', review);

    res.json(review);
  });
}