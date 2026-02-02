import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';
import { authConfig } from '../config/auth';

interface DriverAttributes {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  licenseNumber: string;
  status: 'active' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

interface DriverCreationAttributes extends Optional<DriverAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt'> {}

class Driver extends Model<DriverAttributes, DriverCreationAttributes> implements DriverAttributes {
  public id!: number;
  public employeeId!: string;
  public name!: string;
  public email!: string;
  public phone!: string;
  public passwordHash!: string;
  public licenseNumber!: string;
  public status!: 'active' | 'inactive';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, authConfig.saltRounds);
  }
}

Driver.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'employee_id',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash',
    },
    licenseNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'license_number',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    },
  },
  {
    sequelize,
    tableName: 'drivers',
    underscored: true,
    hooks: {
      beforeCreate: async (driver) => {
        driver.passwordHash = await Driver.hashPassword(driver.passwordHash);
      },
      beforeUpdate: async (driver) => {
        if (driver.changed('passwordHash')) {
          driver.passwordHash = await Driver.hashPassword(driver.passwordHash);
        }
      },
    },
  }
);

export default Driver;
