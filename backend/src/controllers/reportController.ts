import { Request, Response } from 'express';
import { Trip, Driver, Vehicle } from '../models';
import { Op } from 'sequelize';
import * as XLSX from 'xlsx';

export const getTripReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, driverId, vehicleId, status } = req.query;
    const where: any = {};

    if (startDate && endDate) {
      where.startTime = { [Op.between]: [new Date(startDate as string), new Date(endDate as string)] };
    } else if (startDate) {
      where.startTime = { [Op.gte]: new Date(startDate as string) };
    } else if (endDate) {
      where.startTime = { [Op.lte]: new Date(endDate as string) };
    }

    if (driverId) where.driverId = driverId;
    if (vehicleId) where.vehicleId = vehicleId;
    if (status) where.status = status;

    const trips = await Trip.findAll({
      where,
      include: [
        { model: Driver, as: 'driver', attributes: ['id', 'name', 'employeeId'] },
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'plateNumber', 'make', 'model'] },
      ],
      order: [['startTime', 'DESC']],
    });

    const completed = trips.filter((t) => t.status === 'completed');
    const totalMileage = completed.reduce((sum, t) => sum + (Number(t.totalMileage) || 0), 0);
    const totalDuration = completed.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);

    res.json({
      trips,
      summary: {
        totalTrips: trips.length,
        completedTrips: completed.length,
        inProgressTrips: trips.filter((t) => t.status === 'in_progress').length,
        cancelledTrips: trips.filter((t) => t.status === 'cancelled').length,
        totalMileage,
        totalDuration,
        averageMileage: completed.length ? totalMileage / completed.length : 0,
        averageDuration: completed.length ? totalDuration / completed.length : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

export const getSummaryStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const [totalDrivers, activeDrivers, totalVehicles, activeVehicles, activeTrips, todayTrips, weekTrips, monthTrips] = await Promise.all([
      Driver.count(),
      Driver.count({ where: { status: 'active' } }),
      Vehicle.count(),
      Vehicle.count({ where: { status: 'active' } }),
      Trip.count({ where: { status: 'in_progress' } }),
      Trip.count({ where: { startTime: { [Op.gte]: today } } }),
      Trip.count({ where: { startTime: { [Op.gte]: weekAgo } } }),
      Trip.count({ where: { startTime: { [Op.gte]: monthAgo } } }),
    ]);

    res.json({ totalDrivers, activeDrivers, totalVehicles, activeVehicles, activeTrips, todayTrips, weekTrips, monthTrips });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
};

export const exportReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { format, startDate, endDate, driverId } = req.query;
    const where: any = {};

    if (startDate && endDate) {
      where.startTime = { [Op.between]: [new Date(startDate as string), new Date(endDate as string)] };
    }
    if (driverId) where.driverId = driverId;

    const trips = await Trip.findAll({
      where,
      include: [
        { model: Driver, as: 'driver', attributes: ['id', 'name', 'employeeId'] },
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'plateNumber', 'make', 'model'] },
      ],
      order: [['startTime', 'DESC']],
    });

    const data = trips.map((trip: any) => ({
      'Trip ID': trip.id,
      'Driver': trip.driver?.name || 'N/A',
      'Employee ID': trip.driver?.employeeId || 'N/A',
      'Vehicle': trip.vehicle?.plateNumber || 'N/A',
      'Status': trip.status,
      'Start Time': trip.startTime,
      'End Time': trip.endTime || 'N/A',
      'Duration (min)': trip.durationMinutes || 'N/A',
      'Start Odometer': trip.startOdometer,
      'End Odometer': trip.endOdometer || 'N/A',
      'Total Mileage': trip.totalMileage || 'N/A',
    }));

    if (format === 'csv') {
      const headers = Object.keys(data[0] || {}).join(',');
      const rows = data.map((row) => Object.values(row).join(','));
      const csv = [headers, ...rows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=trips-report.csv');
      res.send(csv);
    } else {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Trips');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=trips-report.xlsx');
      res.send(buffer);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to export report' });
  }
};
