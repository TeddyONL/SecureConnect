import { Router } from 'express';
import { BusinessController } from '../controllers/business.controller';
import { auth, requireRole } from '../middlewares/auth';

const router = Router();

router.post('/', auth, BusinessController.createBusiness);
router.get('/', BusinessController.getBusinesses);
router.get('/search', BusinessController.searchBusinesses);
router.get('/:id', BusinessController.getBusiness);
router.put('/:id', auth, BusinessController.updateBusiness);
router.delete('/:id', auth, BusinessController.deleteBusiness);
router.post('/:id/verify', auth, requireRole(['admin', 'super_admin']), BusinessController.verifyBusiness);
router.post('/:id/claim', auth, BusinessController.claimBusiness);

export default router;