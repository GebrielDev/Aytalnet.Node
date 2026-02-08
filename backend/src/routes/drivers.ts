import { Router } from 'express';
import { getAllDrivers, getDriverById, createDriver, updateDriver, deleteDriver, assignVehicle, getMyAssignedVehicle } from '../controllers/driverController';
import { authenticateToken, requireUser, requireDriver } from '../middleware/auth';

const router = Router();

// Driver-facing route (get my assigned vehicle)
router.get('/my-vehicle', authenticateToken, requireDriver, getMyAssignedVehicle);

router.use(authenticateToken, requireUser);

router.get('/', getAllDrivers);
router.get('/:id', getDriverById);
router.post('/', createDriver);
router.put('/:id', updateDriver);
router.put('/:id/assign-vehicle', assignVehicle);
router.delete('/:id', deleteDriver);

export default router;
