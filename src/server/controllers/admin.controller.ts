import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middlewares/auth';
import { emitAdminEvent } from '../lib/socket';

export class AdminController {
  static getDashboardStats = catchAsync(async (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role;
    if (!userRole || !['admin', 'super_admin'].includes(userRole)) {
      throw new ApiError(403, 'Not authorized');
    }

    const stats = await AdminService.getDashboardStats();
    res.json(stats);
  });

  static getUsers = catchAsync(async (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role;
    if (!userRole || !['admin', 'super_admin'].includes(userRole)) {
      throw new ApiError(403, 'Not authorized');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const role = req.query.role as string;

    const { users, total } = await AdminService.getUsers({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(role && { role }),
      },
    });

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  });

  static updateUserRole = catchAsync(async (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role;
    if (userRole !== 'super_admin') {
      throw new ApiError(403, 'Only super admins can update user roles');
    }

    const { id } = req.params;
    const { role } = req.body;

    const user = await AdminService.updateUserRole(id, role);
    
    // Emit socket event for real-time updates
    emitAdminEvent('userRoleUpdated', user);

    res.json(user);
  });

  static getPendingVerifications = catchAsync(async (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role;
    if (!userRole || !['admin', 'super_admin'].includes(userRole)) {
      throw new ApiError(403, 'Not authorized');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { verifications, total } = await AdminService.getPendingVerifications({
      skip: (page - 1) * limit,
      take: limit,
    });

    res.json({
      verifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  });

  static handleVerification = catchAsync(async (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role;
    if (!userRole || !['admin', 'super_admin'].includes(userRole)) {
      throw new ApiError(403, 'Not authorized');
    }

    const { id } = req.params;
    const { action, notes } = req.body;

    const verification = await AdminService.handleVerification(id, {
      action,
      notes,
      handledBy: req.user?.id,
    });
    
    // Emit socket event for real-time updates
    emitAdminEvent('verificationHandled', verification);

    res.json(verification);
  });

  static getReports = catchAsync(async (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role;
    if (!userRole || !['admin', 'super_admin'].includes(userRole)) {
      throw new ApiError(403, 'Not authorized');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    const { reports, total } = await AdminService.getReports({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        ...(status && { status }),
      },
    });

    res.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  });

  static handleReport = catchAsync(async (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role;
    if (!userRole || !['admin', 'super_admin'].includes(userRole)) {
      throw new ApiError(403, 'Not authorized');
    }

    const { id } = req.params;
    const { action, notes } = req.body;

    const report = await AdminService.handleReport(id, {
      action,
      notes,
      handledBy: req.user?.id,
    });
    
    // Emit socket event for real-time updates
    emitAdminEvent('reportHandled', report);

    res.json(report);
  });

  static getActivityLogs = catchAsync(async (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role;
    if (!userRole || !['admin', 'super_admin'].includes(userRole)) {
      throw new ApiError(403, 'Not authorized');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const type = req.query.type as string;
    const userId = req.query.userId as string;

    const { logs, total } = await AdminService.getActivityLogs({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        ...(type && { type }),
        ...(userId && { userId }),
      },
    });

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  });
}