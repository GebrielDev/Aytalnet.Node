import { Request, Response } from 'express';
import { Driver, Trip } from '../models';
import { Op } from 'sequelize';

export const getAllDrivers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query;
    const where: any = {};

    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { employeeId: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const drivers = await Driver.findAll({
      where,
      attributes: { exclude: ['passwordHash'] },
      order: [['createdAt', 'DESC']],
    });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drivers' });
  }
};

export const getDriverById = async (req: Request, res: Response): Promise<void> => {
  try {
    const driver = await Driver.findByPk(req.params.id, { attributes: { exclude: ['passwordHash'] } });
    if (!driver) {
      res.status(404).json({ error: 'Driver not found' });
      return;
    }

    const tripCount = await Trip.count({ where: { driverId: driver.id } });
    const activeTrip = await Trip.findOne({ where: { driverId: driver.id, status: 'in_progress' } });

    res.json({ ...driver.toJSON(), tripCount, hasActiveTrip: !!activeTrip });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch driver' });
  }
};

export const createDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId, name, email, phone, password, licenseNumber } = req.body;

    const existing = await Driver.findOne({ where: { [Op.or]: [{ email }, { employeeId }] } });
    if (existing) {
      res.status(400).json({ error: 'Email or Employee ID already exists' });
      return;
    }

    const driver = await Driver.create({ employeeId, name, email, phone, passwordHash: password, licenseNumber });
    res.status(201).json({
      id: driver.id, employeeId: driver.employeeId, name: driver.name,
      email: driver.email, phone: driver.phone, licenseNumber: driver.licenseNumber,
      status: driver.status, createdAt: driver.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create driver' });
  }
};

export const updateDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) {
      res.status(404).json({ error: 'Driver not found' });
      return;
    }

    const { name, email, phone, licenseNumber, status, password } = req.body;

    if (email && email !== driver.email) {
      const existing = await Driver.findOne({ where: { email } });
      if (existing) {
        res.status(400).json({ error: 'Email already exists' });
        return;
      }
    }

    await driver.update({
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(licenseNumber && { licenseNumber }),
      ...(status && { status }),
      ...(password && { passwordHash: password }),
    });

    res.json({ id: driver.id, employeeId: driver.employeeId, name: driver.name, email: driver.email, phone: driver.phone, status: driver.status });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update driver' });
  }
};

export const deleteDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) {
      res.status(404).json({ error: 'Driver not found' });
      return;
    }

    const activeTrip = await Trip.findOne({ where: { driverId: driver.id, status: 'in_progress' } });
    if (activeTrip) {
      res.status(400).json({ error: 'Cannot deactivate driver with active trip' });
      return;
    }

    await driver.update({ status: 'inactive' });
    res.json({ message: 'Driver deactivated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to deactivate driver' });
  }
};
