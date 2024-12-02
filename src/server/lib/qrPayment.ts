import { nanoid } from 'nanoid';
import { prisma } from './prisma';
import { ApiError } from '../utils/ApiError';
import { security } from './security';
import { mpesaAPI } from './mpesa';

interface QRPaymentPayload {
  amount: number;
  currency: string;
  orderId: string;
  userId: string;
}

interface QRCodeData {
  id: string;
  amount: number;
  currency: string;
  expires: string;
  status: 'pending' | 'completed' | 'expired';
}

export class QRPaymentService {
  static async generateQRCode(payload: QRPaymentPayload): Promise<QRCodeData> {
    try {
      // Generate unique payment ID
      const paymentId = nanoid(16);
      
      // Create expiration timestamp (5 minutes from now)
      const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      // Create payment record in database
      const payment = await prisma.payment.create({
        data: {
          id: paymentId,
          amount: payload.amount,
          currency: payload.currency,
          orderId: payload.orderId,
          userId: payload.userId,
          expires,
          status: 'pending',
          qrHash: security.hashData(paymentId),
        },
      });

      return {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        expires: payment.expires.toISOString(),
        status: payment.status as 'pending' | 'completed' | 'expired',
      };
    } catch (error) {
      throw new ApiError(500, 'Failed to generate QR code');
    }
  }

  static async validatePayment(qrData: {
    id: string;
    amount: number;
    currency: string;
    expires: string;
  }): Promise<boolean> {
    try {
      // Get payment from database
      const payment = await prisma.payment.findUnique({
        where: { id: qrData.id },
      });

      if (!payment) return false;

      // Validate payment hasn't expired
      if (new Date(payment.expires) < new Date()) {
        await this.expirePayment(payment.id);
        return false;
      }

      // Validate amount and currency match
      if (payment.amount !== qrData.amount || payment.currency !== qrData.currency) {
        return false;
      }

      // Validate QR code hasn't been used
      if (payment.status !== 'pending') {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  static async initiatePayment(paymentId: string, paymentMethod: 'mpesa' | 'bank', phoneNumber?: string): Promise<void> {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new ApiError(404, 'Payment not found');
    }

    if (payment.status !== 'pending') {
      throw new ApiError(400, 'Invalid payment status');
    }

    if (new Date(payment.expires) < new Date()) {
      await this.expirePayment(payment.id);
      throw new ApiError(400, 'Payment has expired');
    }

    try {
      if (paymentMethod === 'mpesa') {
        if (!phoneNumber) {
          throw new ApiError(400, 'Phone number required for MPESA payment');
        }

        // Initiate MPESA STK Push
        await mpesaAPI.initiateSTKPush({
          phoneNumber,
          amount: payment.amount,
          orderId: payment.orderId,
          callbackUrl: `/api/payments/mpesa/callback/${payment.id}`,
        });
      } else {
        // Handle bank transfer initiation
        // Implementation will depend on your bank API
      }
    } catch (error) {
      throw new ApiError(500, 'Failed to initiate payment');
    }
  }

  static async completePayment(paymentId: string): Promise<void> {
    try {
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      });
    } catch (error) {
      throw new ApiError(500, 'Failed to complete payment');
    }
  }

  static async expirePayment(paymentId: string): Promise<void> {
    try {
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'expired',
        },
      });
    } catch (error) {
      throw new ApiError(500, 'Failed to expire payment');
    }
  }

  static async getPaymentStatus(paymentId: string): Promise<string> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        throw new ApiError(404, 'Payment not found');
      }

      // Check if payment has expired
      if (payment.status === 'pending' && new Date(payment.expires) < new Date()) {
        await this.expirePayment(payment.id);
        return 'expired';
      }

      return payment.status;
    } catch (error) {
      throw new ApiError(500, 'Failed to get payment status');
    }
  }
}