import User from './User';
import Driver from './Driver';
import Vehicle from './Vehicle';
import Trip from './Trip';
import TripPhoto from './TripPhoto';

// Define associations
Trip.belongsTo(Driver, { foreignKey: 'driverId', as: 'driver' });
Trip.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });
Driver.hasMany(Trip, { foreignKey: 'driverId', as: 'trips' });
Vehicle.hasMany(Trip, { foreignKey: 'vehicleId', as: 'trips' });

TripPhoto.belongsTo(Trip, { foreignKey: 'tripId', as: 'trip' });
Trip.hasMany(TripPhoto, { foreignKey: 'tripId', as: 'photos' });

export { User, Driver, Vehicle, Trip, TripPhoto };
