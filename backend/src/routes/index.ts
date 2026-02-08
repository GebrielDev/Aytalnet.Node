import { Router } from 'express';
import authRoutes from './auth';
import driverRoutes from './drivers';
import vehicleRoutes from './vehicles';
import tripRoutes from './trips';
import reportRoutes from './reports';
import userRoutes from './users';

const router = Router();

router.use('/auth', authRoutes);
router.use('/drivers', driverRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/trips', tripRoutes);
router.use('/reports', reportRoutes);
router.use('/users', userRoutes);

export default router;
