import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface VehicleAttributes {
  id: number;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  status: 'active' | 'maintenance' | 'inactive';
  currentOdometer: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface VehicleCreationAttributes extends Optional<VehicleAttributes, 'id' | 'status' | 'currentOdometer' | 'createdAt' | 'updatedAt'> {}

class Vehicle extends Model<VehicleAttributes, VehicleCreationAttributes> implements VehicleAttributes {
  public id!: number;
  public plateNumber!: string;
  public make!: string;
  public model!: string;
  public year!: number;
  public vin!: string;
  public status!: 'active' | 'maintenance' | 'inactive';
  public currentOdometer!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Vehicle.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    plateNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      field: 'plate_number',
    },
    make: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vin: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'maintenance', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    },
    currentOdometer: {
      type: DataTypes.DECIMAL(10, 1),
      allowNull: false,
      defaultValue: 0,
      field: 'current_odometer',
    },
  },
  {
    sequelize,
    tableName: 'vehicles',
    underscored: true,
  }
);

export default Vehicle;
