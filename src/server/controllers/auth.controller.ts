import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';
import { validateLoginInput, validateRegisterInput } from '../validation/auth.validation';

export class AuthController {
  static register = catchAsync(async (req: Request, res: Response) => {
    const { error, value } = validateRegisterInput(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { email, password, name } = value;
    const tokens = await AuthService.createUser(email, password, name);
    
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      accessToken: tokens.accessToken,
      user: tokens.user,
    });
  });

  static login = catchAsync(async (req: Request, res: Response) => {
    const { error, value } = validateLoginInput(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { email, password } = value;
    const tokens = await AuthService.login(email, password);
    
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      accessToken: tokens.accessToken,
      user: tokens.user,
    });
  });

  static refreshToken = catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw new ApiError(401, 'Refresh token required');

    const tokens = await AuthService.refreshToken(refreshToken);
    
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken: tokens.accessToken,
      user: tokens.user,
    });
  });

  static logout = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, 'Not authenticated');

    await AuthService.logout(userId);
    
    res.clearCookie('refreshToken');
    res.status(204).send();
  });

  static getProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, 'Not authenticated');

    const user = await AuthService.getProfile(userId);
    res.json(user);
  });
}