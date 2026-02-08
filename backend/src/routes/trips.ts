import { Router } from 'express';
import { getAllTrips, getActiveTrips, getTripById, startTrip, endTrip, uploadTripPhoto, getDriverActiveTrip, getDriverTrips, cancelTrip } from '../controllers/tripController';
import { authenticateToken, requireUser, requireDriver } from '../middleware/auth';
import multer from 'multer';

const router = Router();

// Multer for handling file uploads (Cloudinary or local)
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Driver routes
router.post('/start', authenticateToken, requireDriver, startTrip);
router.put('/:id/end', authenticateToken, requireDriver, endTrip);
router.post('/:id/photos', authenticateToken, requireDriver, upload.single('photo'), uploadTripPhoto);
router.get('/my-active', authenticateToken, requireDriver, getDriverActiveTrip);
router.get('/my-trips', authenticateToken, requireDriver, getDriverTrips);

// Dispatcher routes
router.get('/', authenticateToken, requireUser, getAllTrips);
router.get('/active', authenticateToken, requireUser, getActiveTrips);
router.get('/:id', authenticateToken, getTripById);
router.post('/:id/cancel', authenticateToken, requireUser, cancelTrip);

export default router;
