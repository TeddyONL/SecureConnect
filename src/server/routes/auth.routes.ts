import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { auth } from '../middlewares/auth';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', auth, AuthController.logout);
router.get('/profile', auth, AuthController.getProfile);

export default router;