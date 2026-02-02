import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { tripsApi, reportsApi } from '../services/api';

interface Stats {
  totalDrivers: number;
  activeDrivers: number;
  totalVehicles: number;
  activeVehicles: number;
  activeTrips: number;
  todayTrips: number;
  weekTrips: number;
  monthTrips: number;
}

interface ActiveTrip {
  id: number;
  startTime: string;
  startOdometer: number;
  driver: { name: string; employeeId: string; phone: string };
  vehicle: { plateNumber: string; make: string; model: string };
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeTrips, setActiveTrips] = useState<ActiveTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tripsRes] = await Promise.all([
          reportsApi.getSummary(),
          tripsApi.getActive(),
        ]);
        setStats(statsRes.data);
        setActiveTrips(tripsRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Socket.io connection for real-time updates
    const socket = io(import.meta.env.VITE_API_URL || window.location.origin);

    socket.on('connect', () => {
      socket.emit('join:dashboard');
    });

    socket.on('trip:started', (trip: ActiveTrip) => {
      setActiveTrips((prev) => [trip, ...prev]);
      setStats((prev) => prev ? { ...prev, activeTrips: prev.activeTrips + 1 } : null);
    });

    socket.on('trip:ended', (trip: { id: number }) => {
      setActiveTrips((prev) => prev.filter((t) => t.id !== trip.id));
      setStats((prev) => prev ? { ...prev, activeTrips: prev.activeTrips - 1 } : null);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  const statCards = [
    { label: 'Active Trips', value: stats?.activeTrips || 0, color: 'bg-green-500' },
    { label: 'Today\'s Trips', value: stats?.todayTrips || 0, color: 'bg-blue-500' },
    { label: 'This Week', value: stats?.weekTrips || 0, color: 'bg-purple-500' },
    { label: 'This Month', value: stats?.monthTrips || 0, color: 'bg-orange-500' },
    { label: 'Active Drivers', value: `${stats?.activeDrivers || 0}/${stats?.totalDrivers || 0}`, color: 'bg-teal-500' },
    { label: 'Active Vehicles', value: `${stats?.activeVehicles || 0}/${stats?.totalVehicles || 0}`, color: 'bg-indigo-500' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-4">
            <div className={`${stat.color} text-white text-2xl font-bold rounded-lg p-3 text-center`}>
              {stat.value}
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Active Trips</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Odometer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeTrips.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No active trips
                  </td>
                </tr>
              ) : (
                activeTrips.map((trip) => (
                  <tr key={trip.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{trip.driver?.name}</div>
                      <div className="text-sm text-gray-500">{trip.driver?.employeeId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{trip.vehicle?.plateNumber}</div>
                      <div className="text-sm text-gray-500">{trip.vehicle?.make} {trip.vehicle?.model}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(trip.startTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trip.startOdometer} mi
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trip.driver?.phone}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
