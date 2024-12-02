import { Request, Response } from 'express';
import { QRPaymentService } from '../lib/qrPayment';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middlewares/auth';

export class PaymentController {
  static generateQRCode = catchAsync(async (req: AuthRequest, res: Response) => {
    const { amount, currency, orderId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, 'Not authenticated');
    }

    const qrCode = await QRPaymentService.generateQRCode({
      amount,
      currency,
      orderId,
      userId,
    });

    res.status(201).json(qrCode);
  });

  static validateQRCode = catchAsync(async (req: Request, res: Response) => {
    const { id, amount, currency, expires } = req.body;

    const isValid = await QRPaymentService.validatePayment({
      id,
      amount,
      currency,
      expires,
    });

    res.json({ isValid });
  });

  static initiatePayment = catchAsync(async (req: Request, res: Response) => {
    const { paymentMethod, phoneNumber } = req.body;
    const { id } = req.params;

    await QRPaymentService.initiatePayment(id, paymentMethod, phoneNumber);

    res.json({ message: 'Payment initiated successfully' });
  });

  static getPaymentStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const status = await QRPaymentService.getPaymentStatus(id);

    res.json({ status });
  });

  static handleMpesaCallback = catchAsync(async (req: Request, res: Response) => {
    const { paymentId } = req.params;
    const { ResultCode, ResultDesc } = req.body;

    // Validate MPESA callback
    // Implementation depends on your MPESA API integration

    if (ResultCode === 0) {
      // Payment successful
      await QRPaymentService.completePayment(paymentId);
    } else {
      // Payment failed
      // Handle failure case
    }

    // Send acknowledgment to MPESA
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  });
}