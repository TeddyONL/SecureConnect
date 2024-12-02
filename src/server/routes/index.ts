import { Router } from 'express';
import adminRoutes from './admin.routes';
import authRoutes from './auth.routes';
import businessRoutes from './business.routes';
import chatRoutes from './chat.routes';
import paymentRoutes from './payment.routes';
import reviewRoutes from './review.routes';

const router = Router();

router.use('/admin', adminRoutes);
router.use('/auth', authRoutes);
router.use('/business', businessRoutes);
router.use('/chat', chatRoutes);
router.use('/payment', paymentRoutes);
router.use('/review', reviewRoutes);

export default router;
