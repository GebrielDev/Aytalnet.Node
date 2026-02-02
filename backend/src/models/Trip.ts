import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface TripAttributes {
  id: number;
  driverId: number;
  vehicleId: number;
  status: 'in_progress' | 'completed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  durationMinutes?: number;
  startOdometer: number;
  endOdometer?: number;
  totalMileage?: number;
  startLatitude: number;
  startLongitude: number;
  startAddress?: string;
  endLatitude?: number;
  endLongitude?: number;
  endAddress?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TripCreationAttributes extends Optional<TripAttributes, 'id' | 'status' | 'endTime' | 'durationMinutes' | 'endOdometer' | 'totalMileage' | 'startAddress' | 'endLatitude' | 'endLongitude' | 'endAddress' | 'createdAt' | 'updatedAt'> {}

class Trip extends Model<TripAttributes, TripCreationAttributes> implements TripAttributes {
  public id!: number;
  public driverId!: number;
  public vehicleId!: number;
  public status!: 'in_progress' | 'completed' | 'cancelled';
  public startTime!: Date;
  public endTime?: Date;
  public durationMinutes?: number;
  public startOdometer!: number;
  public endOdometer?: number;
  public totalMileage?: number;
  public startLatitude!: number;
  public startLongitude!: number;
  public startAddress?: string;
  public endLatitude?: number;
  public endLongitude?: number;
  public endAddress?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Trip.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    driverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'driver_id',
    },
    vehicleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'vehicle_id',
    },
    status: {
      type: DataTypes.ENUM('in_progress', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'in_progress',
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_time',
    },
    endTime: {
      type: DataTypes.DATE,
      field: 'end_time',
    },
    durationMinutes: {
      type: DataTypes.INTEGER,
      field: 'duration_minutes',
    },
    startOdometer: {
      type: DataTypes.DECIMAL(10, 1),
      allowNull: false,
      field: 'start_odometer',
    },
    endOdometer: {
      type: DataTypes.DECIMAL(10, 1),
      field: 'end_odometer',
    },
    totalMileage: {
      type: DataTypes.DECIMAL(10, 1),
      field: 'total_mileage',
    },
    startLatitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
      field: 'start_latitude',
    },
    startLongitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
      field: 'start_longitude',
    },
    startAddress: {
      type: DataTypes.STRING(500),
      field: 'start_address',
    },
    endLatitude: {
      type: DataTypes.DECIMAL(10, 8),
      field: 'end_latitude',
    },
    endLongitude: {
      type: DataTypes.DECIMAL(11, 8),
      field: 'end_longitude',
    },
    endAddress: {
      type: DataTypes.STRING(500),
      field: 'end_address',
    },
  },
  {
    sequelize,
    tableName: 'trips',
    underscored: true,
  }
);

export default Trip;
