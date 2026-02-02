import { Router } from 'express';
import { getTripReport, getSummaryStats, exportReport } from '../controllers/reportController';
import { authenticateToken, requireUser } from '../middleware/auth';

const router = Router();

router.use(authenticateToken, requireUser);

router.get('/trips', getTripReport);
router.get('/summary', getSummaryStats);
router.get('/export', exportReport);

export default router;
