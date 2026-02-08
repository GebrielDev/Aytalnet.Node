import { Request, Response } from 'express';
import { Trip, TripPhoto, Driver, Vehicle } from '../models';
import { Op } from 'sequelize';
import cloudinary from '../config/cloudinary';

// Upload buffer to Cloudinary, returns the secure URL
const uploadBufferToCloudinary = (buffer: Buffer, mimetype: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'fleet-management/trips', resource_type: 'image' },
      (error, result) => {
        if (error || !result) return reject(error || new Error('No result'));
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

export const getAllTrips = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, driverId, vehicleId, startDate, endDate, page = 1, limit = 20 } = req.query;
    const where: any = {};

    if (status) where.status = status;
    if (driverId) where.driverId = driverId;
    if (vehicleId) where.vehicleId = vehicleId;
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime[Op.gte] = new Date(startDate as string);
      if (endDate) where.startTime[Op.lte] = new Date(endDate as string);
    }

    const offset = (Number(page) - 1) * Number(limit);
    const { count, rows: trips } = await Trip.findAndCountAll({
      where,
      include: [
        { model: Driver, as: 'driver', attributes: ['id', 'name', 'employeeId'] },
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'plateNumber', 'make', 'model'] },
        { model: TripPhoto, as: 'photos' },
      ],
      order: [['startTime', 'DESC']],
      limit: Number(limit),
      offset,
    });

    res.json({
      trips,
      pagination: { total: count, page: Number(page), limit: Number(limit), totalPages: Math.ceil(count / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
};

export const getActiveTrips = async (req: Request, res: Response): Promise<void> => {
  try {
    const trips = await Trip.findAll({
      where: { status: 'in_progress' },
      include: [
        { model: Driver, as: 'driver', attributes: ['id', 'name', 'employeeId', 'phone'] },
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'plateNumber', 'make', 'model'] },
      ],
      order: [['startTime', 'DESC']],
    });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active trips' });
  }
};

export const getTripById = async (req: Request, res: Response): Promise<void> => {
  try {
    const trip = await Trip.findByPk(req.params.id, {
      include: [
        { model: Driver, as: 'driver', attributes: { exclude: ['passwordHash'] } },
        { model: Vehicle, as: 'vehicle' },
        { model: TripPhoto, as: 'photos' },
      ],
    });

    if (!trip) {
      res.status(404).json({ error: 'Trip not found' });
      return;
    }
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trip' });
  }
};

export const startTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    const driver = req.driver!;
    const { vehicleId, startOdometer, startLatitude, startLongitude, startAddress } = req.body;

    const existingTrip = await Trip.findOne({ where: { driverId: driver.id, status: 'in_progress' } });
    if (existingTrip) {
      res.status(400).json({ error: 'You already have an active trip' });
      return;
    }

    const vehicleTrip = await Trip.findOne({ where: { vehicleId, status: 'in_progress' } });
    if (vehicleTrip) {
      res.status(400).json({ error: 'Vehicle is currently in use' });
      return;
    }

    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle || vehicle.status !== 'active') {
      res.status(400).json({ error: 'Vehicle not available' });
      return;
    }

    const trip = await Trip.create({
      driverId: driver.id,
      vehicleId,
      startTime: new Date(),
      startOdometer,
      startLatitude,
      startLongitude,
      startAddress,
    });

    const fullTrip = await Trip.findByPk(trip.id, {
      include: [
        { model: Driver, as: 'driver', attributes: ['id', 'name', 'employeeId'] },
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'plateNumber', 'make', 'model'] },
      ],
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('trip:started', fullTrip);
    }

    res.status(201).json(fullTrip);
  } catch (error) {
    res.status(500).json({ error: 'Failed to start trip' });
  }
};

export const endTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    const driver = req.driver!;
    const { endOdometer, endLatitude, endLongitude, endAddress } = req.body;

    const trip = await Trip.findOne({ where: { id: req.params.id, driverId: driver.id, status: 'in_progress' } });
    if (!trip) {
      res.status(404).json({ error: 'Active trip not found' });
      return;
    }

    if (endOdometer < Number(trip.startOdometer)) {
      res.status(400).json({ error: 'End odometer cannot be less than start' });
      return;
    }

    const endTime = new Date();
    const durationMinutes = Math.round((endTime.getTime() - trip.startTime.getTime()) / 60000);
    const totalMileage = endOdometer - Number(trip.startOdometer);

    await trip.update({ status: 'completed', endTime, durationMinutes, endOdometer, totalMileage, endLatitude, endLongitude, endAddress });
    await Vehicle.update({ currentOdometer: endOdometer }, { where: { id: trip.vehicleId } });

    const io = req.app.get('io');
    if (io) io.emit('trip:ended', trip);

    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: 'Failed to end trip' });
  }
};

export const uploadTripPhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { photoType } = req.body;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: 'No photo uploaded' });
      return;
    }

    const trip = await Trip.findByPk(req.params.id);
    if (!trip) {
      res.status(404).json({ error: 'Trip not found' });
      return;
    }

    let photoUrl: string;
    try {
      // Try Cloudinary upload from memory buffer
      photoUrl = await uploadBufferToCloudinary(file.buffer, file.mimetype);
    } catch (_cloudErr) {
      // Fallback: store as base64 data URI (works without any external service)
      const base64 = file.buffer.toString('base64');
      photoUrl = `data:${file.mimetype};base64,${base64}`;
    }

    const photo = await TripPhoto.create({
      tripId: trip.id,
      photoType,
      photoUrl,
      takenAt: new Date(),
    });

    res.status(201).json(photo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload photo' });
  }
};

export const getDriverActiveTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    const trip = await Trip.findOne({
      where: { driverId: req.driver!.id, status: 'in_progress' },
      include: [{ model: Vehicle, as: 'vehicle' }, { model: TripPhoto, as: 'photos' }],
    });
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active trip' });
  }
};

export const getDriverTrips = async (req: Request, res: Response): Promise<void> => {
  try {
    const driver = req.driver!;
    const trips = await Trip.findAll({
      where: { driverId: driver.id, status: 'completed' },
      include: [
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'plateNumber', 'make', 'model'] },
      ],
      order: [['endTime', 'DESC']],
      limit: 10,
    });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch driver trips' });
  }
};

export const cancelTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip || trip.status !== 'in_progress') {
      res.status(400).json({ error: 'Cannot cancel this trip' });
      return;
    }

    await trip.update({ status: 'cancelled', endTime: new Date() });

    const io = req.app.get('io');
    if (io) io.emit('trip:cancelled', { id: trip.id });

    res.json({ message: 'Trip cancelled' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel trip' });
  }
};
