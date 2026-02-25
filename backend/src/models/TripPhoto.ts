import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface TripPhotoAttributes {
  id: number;
  tripId: number;
  photoType: 'driver_selfie' | 'start_odometer' | 'end_odometer' | 'passenger' | 'license_plate';
  photoUrl: string;
  takenAt: Date;
  createdAt?: Date;
}

interface TripPhotoCreationAttributes extends Optional<TripPhotoAttributes, 'id' | 'createdAt'> {}

class TripPhoto extends Model<TripPhotoAttributes, TripPhotoCreationAttributes> implements TripPhotoAttributes {
  public id!: number;
  public tripId!: number;
  public photoType!: 'driver_selfie' | 'start_odometer' | 'end_odometer' | 'passenger' | 'license_plate';
  public photoUrl!: string;
  public takenAt!: Date;
  public readonly createdAt!: Date;
}

TripPhoto.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tripId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'trip_id',
    },
    photoType: {
      type: DataTypes.ENUM('driver_selfie', 'start_odometer', 'end_odometer', 'passenger', 'license_plate'),
      allowNull: false,
      field: 'photo_type',
    },
    photoUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'photo_url',
    },
    takenAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'taken_at',
    },
  },
  {
    sequelize,
    tableName: 'trip_photos',
    underscored: true,
    updatedAt: false,
  }
);

export default TripPhoto;
