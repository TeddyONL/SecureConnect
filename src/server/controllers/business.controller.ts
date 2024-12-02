import { Request, Response } from 'express';
import { BusinessService } from '../services/business.service';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';
import { validateBusinessInput, validateSearchInput } from '../validation/business.validation';
import { AuthRequest } from '../middlewares/auth';
import { emitBusinessEvent } from '../lib/socket';

export class BusinessController {
  static createBusiness = catchAsync(async (req: AuthRequest, res: Response) => {
    const { error, value } = validateBusinessInput(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, 'Not authenticated');

    const business = await BusinessService.createBusiness({
      ...value,
      ownerId: userId,
    });

    // Emit socket event for real-time updates
    emitBusinessEvent('businessCreated', business);

    res.status(201).json(business);
  });

  static getBusinesses = catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const isVerified = req.query.isVerified === 'true';
    const minRating = parseFloat(req.query.minRating as string) || 0;

    const { businesses, total } = await BusinessService.getBusinesses({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        ...(category && { category }),
        ...(isVerified && { isVerified: true }),
        ...(minRating > 0 && {
          stats: {
            averageRating: { gte: minRating },
          },
        }),
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      businesses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  });

  static searchBusinesses = catchAsync(async (req: Request, res: Response) => {
    const { error, value } = validateSearchInput(req.query);
    if (error) throw new ApiError(400, error.details[0].message);

    const { query, page = 1, limit = 10, filters } = value;

    const results = await BusinessService.searchBusinesses(query, {
      skip: (page - 1) * limit,
      take: limit,
      filters,
    });

    res.json(results);
  });

  static getBusiness = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const business = await BusinessService.getBusiness(id);
    
    if (!business) {
      throw new ApiError(404, 'Business not found');
    }

    res.json(business);
  });

  static updateBusiness = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, 'Not authenticated');

    const { error, value } = validateBusinessInput(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const business = await BusinessService.updateBusiness(id, userId, value);
    
    // Emit socket event for real-time updates
    emitBusinessEvent('businessUpdated', business);

    res.json(business);
  });

  static deleteBusiness = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, 'Not authenticated');

    await BusinessService.deleteBusiness(id, userId);
    
    // Emit socket event for real-time updates
    emitBusinessEvent('businessDeleted', { id });

    res.status(204).send();
  });

  static verifyBusiness = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !['admin', 'super_admin'].includes(userRole)) {
      throw new ApiError(403, 'Not authorized to verify businesses');
    }

    const business = await BusinessService.verifyBusiness(id);
    
    // Emit socket event for real-time updates
    emitBusinessEvent('businessVerified', business);

    res.json(business);
  });

  static claimBusiness = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, 'Not authenticated');

    const claim = await BusinessService.createBusinessClaim(id, userId, req.body);
    
    // Emit socket event for real-time updates
    emitBusinessEvent('businessClaimed', claim);

    res.status(201).json(claim);
  });
}