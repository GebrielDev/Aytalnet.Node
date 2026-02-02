import { Request, Response } from 'express';
import { Vehicle, Trip } from '../models';
import { Op } from 'sequelize';

export const getAllVehicles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query;
    const where: any = {};

    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { plateNumber: { [Op.iLike]: `%${search}%` } },
        { make: { [Op.iLike]: `%${search}%` } },
        { model: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const vehicles = await Vehicle.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
};

export const getVehicleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }

    const tripCount = await Trip.count({ where: { vehicleId: vehicle.id } });
    const activeTrip = await Trip.findOne({ where: { vehicleId: vehicle.id, status: 'in_progress' } });

    res.json({ ...vehicle.toJSON(), tripCount, hasActiveTrip: !!activeTrip });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
};

export const createVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { plateNumber, make, model, year, vin, currentOdometer } = req.body;

    const existing = await Vehicle.findOne({ where: { [Op.or]: [{ plateNumber }, { vin }] } });
    if (existing) {
      res.status(400).json({ error: 'Plate number or VIN already exists' });
      return;
    }

    const vehicle = await Vehicle.create({ plateNumber, make, model, year, vin, currentOdometer: currentOdometer || 0 });
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
};

export const updateVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }

    const { plateNumber, make, model, year, vin, status, currentOdometer } = req.body;
    await vehicle.update({
      ...(plateNumber && { plateNumber }),
      ...(make && { make }),
      ...(model && { model }),
      ...(year && { year }),
      ...(vin && { vin }),
      ...(status && { status }),
      ...(currentOdometer !== undefined && { currentOdometer }),
    });

    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
};

export const deleteVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }

    const activeTrip = await Trip.findOne({ where: { vehicleId: vehicle.id, status: 'in_progress' } });
    if (activeTrip) {
      res.status(400).json({ error: 'Cannot deactivate vehicle with active trip' });
      return;
    }

    await vehicle.update({ status: 'inactive' });
    res.json({ message: 'Vehicle deactivated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to deactivate vehicle' });
  }
};

export const getAvailableVehicles = async (req: Request, res: Response): Promise<void> => {
  try {
    const activeTrips = await Trip.findAll({ where: { status: 'in_progress' }, attributes: ['vehicleId'] });
    const activeVehicleIds = activeTrips.map((t) => t.vehicleId);

    const vehicles = await Vehicle.findAll({
      where: {
        status: 'active',
        ...(activeVehicleIds.length > 0 && { id: { [Op.notIn]: activeVehicleIds } }),
      },
      order: [['plateNumber', 'ASC']],
    });

    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch available vehicles' });
  }
};
