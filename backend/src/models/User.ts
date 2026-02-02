import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';
import { authConfig } from '../config/auth';

interface UserAttributes {
  id: number;
  email: string;
  passwordHash: string;
  name: string;
  role: 'admin' | 'dispatcher';
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public passwordHash!: string;
  public name!: string;
  public role!: 'admin' | 'dispatcher';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, authConfig.saltRounds);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'dispatcher'),
      allowNull: false,
      defaultValue: 'dispatcher',
    },
  },
  {
    sequelize,
    tableName: 'users',
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        user.passwordHash = await User.hashPassword(user.passwordHash);
      },
      beforeUpdate: async (user) => {
        if (user.changed('passwordHash')) {
          user.passwordHash = await User.hashPassword(user.passwordHash);
        }
      },
    },
  }
);

export default User;
