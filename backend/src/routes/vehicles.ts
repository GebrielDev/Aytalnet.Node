import { Router } from 'express';
import { getAllVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle, getAvailableVehicles } from '../controllers/vehicleController';
import { authenticateToken, requireUser, requireDriver } from '../middleware/auth';

const router = Router();

router.get('/available', authenticateToken, requireDriver, getAvailableVehicles);

router.use(authenticateToken, requireUser);

router.get('/', getAllVehicles);
router.get('/:id', getVehicleById);
router.post('/', createVehicle);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

export default router;
