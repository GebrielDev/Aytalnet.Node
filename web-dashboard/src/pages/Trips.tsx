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

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Trips</h1>

      <div className="bg-white rounded-lg shadow p-4 flex gap-4 flex-wrap">
        <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} className="px-3 py-2 border rounded-md">
          <option value="">All Status</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input type="date" value={filter.startDate} onChange={(e) => setFilter({ ...filter, startDate: e.target.value })} className="px-3 py-2 border rounded-md" placeholder="Start Date" />
        <input type="date" value={filter.endDate} onChange={(e) => setFilter({ ...filter, endDate: e.target.value })} className="px-3 py-2 border rounded-md" placeholder="End Date" />
        <button onClick={() => { setFilter({ status: '', startDate: '', endDate: '' }); setPage(1); }} className="px-4 py-2 text-gray-600 hover:text-gray-900">Clear</button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mileage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {trips.map((trip) => (
              <tr key={trip.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{trip.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trip.driver?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trip.vehicle?.plateNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(trip.startTime).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trip.durationMinutes ? `${trip.durationMinutes} min` : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trip.totalMileage ? `${trip.totalMileage} mi` : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(trip.status)}`}>{trip.status}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button onClick={() => setSelectedTrip(trip)} className="text-blue-600 hover:text-blue-900">View</button>
                  {trip.status === 'in_progress' && (
                    <button onClick={() => handleCancel(trip.id)} className="text-red-600 hover:text-red-900">Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-6 py-3 flex justify-between items-center border-t">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border rounded-md disabled:opacity-50">Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 border rounded-md disabled:opacity-50">Next</button>
        </div>
      </div>

      {selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Trip #{selectedTrip.id}</h2>
              <button onClick={() => setSelectedTrip(null)} className="text-gray-500 hover:text-gray-700">Close</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><strong>Driver:</strong> {selectedTrip.driver?.name}</div>
              <div><strong>Vehicle:</strong> {selectedTrip.vehicle?.plateNumber}</div>
              <div><strong>Status:</strong> {selectedTrip.status}</div>
              <div><strong>Duration:</strong> {selectedTrip.durationMinutes || '-'} min</div>
              <div><strong>Start Odometer:</strong> {selectedTrip.startOdometer} mi</div>
              <div><strong>End Odometer:</strong> {selectedTrip.endOdometer || '-'} mi</div>
              <div><strong>Total Mileage:</strong> {selectedTrip.totalMileage || '-'} mi</div>
              <div><strong>Start Time:</strong> {new Date(selectedTrip.startTime).toLocaleString()}</div>
              {selectedTrip.endTime && <div><strong>End Time:</strong> {new Date(selectedTrip.endTime).toLocaleString()}</div>}
            </div>
            {selectedTrip.photos?.length > 0 && (
              <div className="mt-4">
                <h3 className="font-bold mb-2">Photos</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedTrip.photos.map((photo) => (
                    <div key={photo.id} className="border rounded p-2">
                      <img
                        src={resolvePhotoUrl(photo.photoUrl)}
                        alt={photo.photoType}
                        className="w-full h-32 object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.style.display = 'none';
                          target.parentElement!.insertAdjacentHTML(
                            'afterbegin',
                            '<div class="w-full h-32 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm">Photo unavailable</div>'
                          );
                        }}
                      />
                      <p className="text-sm text-gray-500 mt-1 capitalize">{photo.photoType.replace(/_/g, ' ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
