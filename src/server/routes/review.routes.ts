import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { auth } from '../middlewares/auth';

const router = Router();

router.post('/business/:businessId', auth, ReviewController.createReview);
router.put('/:id', auth, ReviewController.updateReview);
router.delete('/:id', auth, ReviewController.deleteReview);
router.get('/business/:businessId', ReviewController.getBusinessReviews);
router.get('/user', auth, ReviewController.getUserReviews);
router.post('/:id/like', auth, ReviewController.toggleReviewLike);

export default router;