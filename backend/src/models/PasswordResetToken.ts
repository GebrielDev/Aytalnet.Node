import { DataTypes, Model, Optional, Op } from 'sequelize';
import crypto from 'crypto';
import sequelize from '../config/database';

interface PasswordResetTokenAttributes {
  id: number;
  email: string;
  tokenHash: string;
  accountType: 'user' | 'driver';
  expiresAt: Date;
  usedAt: Date | null;
  createdAt?: Date;
}

interface PasswordResetTokenCreationAttributes extends Optional<PasswordResetTokenAttributes, 'id' | 'usedAt' | 'createdAt'> {}

class PasswordResetToken extends Model<PasswordResetTokenAttributes, PasswordResetTokenCreationAttributes> implements PasswordResetTokenAttributes {
  public id!: number;
  public email!: string;
  public tokenHash!: string;
  public accountType!: 'user' | 'driver';
  public expiresAt!: Date;
  public usedAt!: Date | null;
  public readonly createdAt!: Date;

  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  static async createToken(email: string, accountType: 'user' | 'driver'): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = PasswordResetToken.hashToken(token);

    // Invalidate any existing unused tokens for this email
    await PasswordResetToken.update(
      { usedAt: new Date() },
      { where: { email, accountType, usedAt: null } }
    );

    await PasswordResetToken.create({
      email,
      tokenHash,
      accountType,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    return token;
  }

  static async findValidToken(token: string): Promise<PasswordResetToken | null> {
    const tokenHash = PasswordResetToken.hashToken(token);
    return PasswordResetToken.findOne({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { [Op.gt]: new Date() },
      },
    });
  }

  static async cleanExpired(): Promise<void> {
    await PasswordResetToken.destroy({
      where: {
        [Op.or]: [
          { expiresAt: { [Op.lt]: new Date() } },
          { usedAt: { [Op.not]: null } },
        ],
        createdAt: { [Op.lt]: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });
  }
}

PasswordResetToken.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tokenHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
      field: 'token_hash',
    },
    accountType: {
      type: DataTypes.ENUM('user', 'driver'),
      allowNull: false,
      field: 'account_type',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at',
    },
    usedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      field: 'used_at',
    },
  },
  {
    sequelize,
    tableName: 'password_reset_tokens',
    underscored: true,
    updatedAt: false,
    indexes: [
      { fields: ['token_hash'], unique: true },
      { fields: ['email', 'account_type'] },
      { fields: ['expires_at'] },
    ],
  }
);

export default PasswordResetToken;
