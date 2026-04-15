import { Router } from 'express';
import { loginUser, loginDriver, refreshToken, getMe, forgotPassword, resetPassword } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/login', loginUser);
router.post('/driver/login', loginDriver);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authenticateToken, getMe);

export default router;
