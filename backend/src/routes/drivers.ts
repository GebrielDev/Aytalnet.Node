import { Router } from 'express';
import { getAllDrivers, getDriverById, createDriver, updateDriver, deleteDriver } from '../controllers/driverController';
import { authenticateToken, requireUser } from '../middleware/auth';

const router = Router();

router.use(authenticateToken, requireUser);

router.get('/', getAllDrivers);
router.get('/:id', getDriverById);
router.post('/', createDriver);
router.put('/:id', updateDriver);
router.delete('/:id', deleteDriver);

export default router;
