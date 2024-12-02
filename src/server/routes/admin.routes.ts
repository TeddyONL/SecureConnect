import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { auth, requireRole } from '../middlewares/auth';

const router = Router();

// Apply admin authorization middleware to all routes
router.use(auth, requireRole(['admin', 'super_admin']));

router.get('/stats', AdminController.getDashboardStats);
router.get('/users', AdminController.getUsers);
router.put('/users/:id/role', requireRole(['super_admin']), AdminController.updateUserRole);
router.get('/verifications', AdminController.getPendingVerifications);
router.post('/verifications/:id', AdminController.handleVerification);
router.get('/reports', AdminController.getReports);
router.post('/reports/:id', AdminController.handleReport);
router.get('/activity-logs', AdminController.getActivityLogs);

export default router;