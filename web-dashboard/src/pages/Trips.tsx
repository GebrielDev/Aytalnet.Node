import { useEffect, useState } from 'react';
import { tripsApi } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
// Derive backend base URL (strip /api suffix)
const BACKEND_URL = API_URL.replace(/\/api\/?$/, '');

// Resolve photo URLs: full URLs and data URIs pass through; relative paths get backend URL prepended
function resolvePhotoUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${BACKEND_URL}/${url}`;
}

interface Trip {
  id: number;
  status: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  startOdometer: number;
  endOdometer?: number;
  totalMileage?: number;
  driver: { name: string; employeeId: string };
  vehicle: { plateNumber: string; make: string; model: string };
  photos: { id: number; photoType: string; photoUrl: string }[];
}

export default function Trips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [filter, setFilter] = useState({ status: '', startDate: '', endDate: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTrips();
  }, [page, filter]);

  const fetchTrips = async () => {
    try {
      const params = { page, limit: 20, ...filter };
      const res = await tripsApi.getAll(params);
      setTrips(res.data.trips);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (window.confirm('Cancel this trip?')) {
      await tripsApi.cancel(id);
      fetchTrips();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Trips</h1>
        <p className="text-sm text-gray-500 mt-1">View and manage all trips</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3 flex-wrap items-end">
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">All Status</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
          <input type="date" value={filter.startDate} onChange={(e) => setFilter({ ...filter, startDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
          <input type="date" value={filter.endDate} onChange={(e) => setFilter({ ...filter, endDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <button onClick={() => { setFilter({ status: '', startDate: '', endDate: '' }); setPage(1); }} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Clear</button>
      </div>

      {/* Desktop table */}
      <div className="bg-white rounded-xl border border-gray-200 hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mileage</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {trips.map((trip) => (
                <tr key={trip.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-900">#{trip.id}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">{trip.driver?.name?.charAt(0)?.toUpperCase()}</div>
                      <span className="text-sm text-gray-900">{trip.driver?.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{trip.vehicle?.plateNumber}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{new Date(trip.startTime).toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{trip.durationMinutes ? `${trip.durationMinutes} min` : '-'}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{trip.totalMileage ? `${trip.totalMileage} mi` : '-'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>{trip.status.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm space-x-2">
                    <button onClick={() => setSelectedTrip(trip)} className="text-blue-600 hover:text-blue-800 font-medium">View</button>
                    {trip.status === 'in_progress' && (
                      <button onClick={() => handleCancel(trip.id)} className="text-red-600 hover:text-red-800 font-medium">Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 flex justify-between items-center border-t border-gray-100">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">Previous</button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">Next</button>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {trips.map((trip) => (
          <div key={trip.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">{trip.driver?.name?.charAt(0)?.toUpperCase()}</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{trip.driver?.name}</p>
                  <p className="text-xs text-gray-500">#{trip.id}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>{trip.status.replace(/_/g, ' ')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div><span className="font-medium text-gray-700">Vehicle:</span> {trip.vehicle?.plateNumber}</div>
              <div><span className="font-medium text-gray-700">Mileage:</span> {trip.totalMileage ? `${trip.totalMileage} mi` : '-'}</div>
              <div><span className="font-medium text-gray-700">Duration:</span> {trip.durationMinutes ? `${trip.durationMinutes} min` : '-'}</div>
              <div><span className="font-medium text-gray-700">Start:</span> {new Date(trip.startTime).toLocaleDateString()}</div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setSelectedTrip(trip)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">View Details</button>
              {trip.status === 'in_progress' && (
                <button onClick={() => handleCancel(trip.id)} className="text-xs text-red-600 hover:text-red-800 font-medium">Cancel</button>
              )}
            </div>
          </div>
        ))}
        <div className="flex justify-between items-center pt-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40">Previous</button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40">Next</button>
        </div>
      </div>

      {/* Trip detail modal */}
      {selectedTrip && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Trip #{selectedTrip.id}</h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(selectedTrip.status)}`}>{selectedTrip.status.replace(/_/g, ' ')}</span>
              </div>
              <button onClick={() => setSelectedTrip(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  ['Driver', selectedTrip.driver?.name],
                  ['Vehicle', selectedTrip.vehicle?.plateNumber],
                  ['Duration', selectedTrip.durationMinutes ? `${selectedTrip.durationMinutes} min` : '-'],
                  ['Start Odometer', `${selectedTrip.startOdometer} mi`],
                  ['End Odometer', selectedTrip.endOdometer ? `${selectedTrip.endOdometer} mi` : '-'],
                  ['Total Mileage', selectedTrip.totalMileage ? `${selectedTrip.totalMileage} mi` : '-'],
                  ['Start Time', new Date(selectedTrip.startTime).toLocaleString()],
                  ...(selectedTrip.endTime ? [['End Time', new Date(selectedTrip.endTime).toLocaleString()]] : []),
                ].map(([label, value]) => (
                  <div key={label as string} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
              {selectedTrip.photos?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Photos</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedTrip.photos.map((photo) => (
                      <div key={photo.id} className="bg-gray-50 rounded-lg overflow-hidden">
                        <img
                          src={resolvePhotoUrl(photo.photoUrl)}
                          alt={photo.photoType}
                          className="w-full h-36 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.style.display = 'none';
                            target.parentElement!.insertAdjacentHTML(
                              'afterbegin',
                              '<div class="w-full h-36 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">Photo unavailable</div>'
                            );
                          }}
                        />
                        <p className="text-xs text-gray-500 p-2 capitalize">{photo.photoType.replace(/_/g, ' ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
