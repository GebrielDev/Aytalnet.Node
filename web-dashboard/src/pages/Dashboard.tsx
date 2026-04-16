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
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Active Trips', value: stats?.activeTrips || 0, bg: 'bg-emerald-50', text: 'text-emerald-700', icon: (
      <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.636 18.364a9 9 0 1012.728 0M12 2.25v6" /></svg>
    )},
    { label: "Today's Trips", value: stats?.todayTrips || 0, bg: 'bg-blue-50', text: 'text-blue-700', icon: (
      <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    )},
    { label: 'This Week', value: stats?.weekTrips || 0, bg: 'bg-violet-50', text: 'text-violet-700', icon: (
      <svg className="w-6 h-6 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
    )},
    { label: 'This Month', value: stats?.monthTrips || 0, bg: 'bg-amber-50', text: 'text-amber-700', icon: (
      <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
    )},
    { label: 'Active Drivers', value: `${stats?.activeDrivers || 0}/${stats?.totalDrivers || 0}`, bg: 'bg-teal-50', text: 'text-teal-700', icon: (
      <svg className="w-6 h-6 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
    )},
    { label: 'Active Vehicles', value: `${stats?.activeVehicles || 0}/${stats?.totalVehicles || 0}`, bg: 'bg-indigo-50', text: 'text-indigo-700', icon: (
      <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25m-2.25 0V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75" /></svg>
    )},
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Fleet overview and real-time activity</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>{stat.icon}</div>
            </div>
            <p className={`text-2xl font-bold ${stat.text}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Active trips */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Active Trips</h2>
            <p className="text-xs text-gray-500 mt-0.5">{activeTrips.length} trip{activeTrips.length !== 1 ? 's' : ''} in progress</p>
          </div>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
          </span>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Odometer</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {activeTrips.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">
                    No active trips at the moment
                  </td>
                </tr>
              ) : (
                activeTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                          {trip.driver?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{trip.driver?.name}</div>
                          <div className="text-xs text-gray-500">{trip.driver?.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-sm font-medium text-gray-900">{trip.vehicle?.plateNumber}</div>
                      <div className="text-xs text-gray-500">{trip.vehicle?.make} {trip.vehicle?.model}</div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">
                      {new Date(trip.startTime).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">
                      {trip.startOdometer} mi
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">
                      {trip.driver?.phone}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {activeTrips.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">No active trips</div>
          ) : (
            activeTrips.map((trip) => (
              <div key={trip.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                      {trip.driver?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{trip.driver?.name}</p>
                      <p className="text-xs text-gray-500">{trip.driver?.employeeId}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div><span className="font-medium text-gray-700">Vehicle:</span> {trip.vehicle?.plateNumber}</div>
                  <div><span className="font-medium text-gray-700">Odometer:</span> {trip.startOdometer} mi</div>
                  <div><span className="font-medium text-gray-700">Started:</span> {new Date(trip.startTime).toLocaleTimeString()}</div>
                  <div><span className="font-medium text-gray-700">Phone:</span> {trip.driver?.phone}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
