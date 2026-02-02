import { Router } from 'express';
import { loginUser, loginDriver, refreshToken, getMe } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/login', loginUser);
router.post('/driver/login', loginDriver);
router.post('/refresh', refreshToken);
router.get('/me', authenticateToken, getMe);

export default router;
