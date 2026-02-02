import { useState } from 'react';
import { reportsApi } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ReportData {
  trips: any[];
  summary: {
    totalTrips: number;
    completedTrips: number;
    inProgressTrips: number;
    cancelledTrips: number;
    totalMileage: number;
    totalDuration: number;
    averageMileage: number;
    averageDuration: number;
  };
}

export default function Reports() {
  const [filter, setFilter] = useState({ startDate: '', endDate: '', driverId: '' });
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await reportsApi.getTrips(filter);
      setReport(res.data);
    } catch (error) {
      console.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'csv' | 'xlsx') => {
    try {
      const res = await reportsApi.export({ ...filter, format });
      const blob = new Blob([res.data], { type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trips-report.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export report');
    }
  };

  const chartData = report ? [
    { name: 'Completed', value: report.summary.completedTrips },
    { name: 'In Progress', value: report.summary.inProgressTrips },
    { name: 'Cancelled', value: report.summary.cancelledTrips },
  ] : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

      <div className="bg-white rounded-lg shadow p-4 flex gap-4 flex-wrap items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input type="date" value={filter.startDate} onChange={(e) => setFilter({ ...filter, startDate: e.target.value })} className="mt-1 px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input type="date" value={filter.endDate} onChange={(e) => setFilter({ ...filter, endDate: e.target.value })} className="mt-1 px-3 py-2 border rounded-md" />
        </div>
        <button onClick={generateReport} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {report && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Total Trips</p>
              <p className="text-2xl font-bold">{report.summary.totalTrips}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-green-600">{report.summary.completedTrips}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Total Mileage</p>
              <p className="text-2xl font-bold">{report.summary.totalMileage.toFixed(1)} mi</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Avg Duration</p>
              <p className="text-2xl font-bold">{report.summary.averageDuration.toFixed(0)} min</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Trip Status Distribution</h2>
              <div className="space-x-2">
                <button onClick={() => exportReport('csv')} className="px-4 py-2 border rounded-md hover:bg-gray-50">Export CSV</button>
                <button onClick={() => exportReport('xlsx')} className="px-4 py-2 border rounded-md hover:bg-gray-50">Export Excel</button>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-3 border-b">
              <h2 className="text-lg font-semibold">Trip Details</h2>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mileage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.trips.slice(0, 10).map((trip: any) => (
                  <tr key={trip.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">#{trip.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{trip.driver?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{trip.vehicle?.plateNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(trip.startTime).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{trip.totalMileage || '-'} mi</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{trip.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
