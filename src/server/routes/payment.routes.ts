import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { auth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { paymentValidation } from '../validation/payment.validation';

const router = Router();

router.post(
  '/qr/generate',
  auth,
  validate(paymentValidation.generateQR),
  PaymentController.generateQRCode
);

router.post(
  '/qr/validate',
  auth,
  validate(paymentValidation.validateQR),
  PaymentController.validateQRCode
);

router.post(
  '/qr/:id/initiate',
  auth,
  validate(paymentValidation.initiatePayment),
  PaymentController.initiatePayment
);

router.get(
  '/qr/:id/status',
  auth,
  PaymentController.getPaymentStatus
);

// MPESA callback endpoint (no auth required as it's called by MPESA)
router.post(
  '/mpesa/callback/:paymentId',
  PaymentController.handleMpesaCallback
);

export default router;