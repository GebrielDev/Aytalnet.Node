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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Generate and export trip reports</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3 flex-wrap items-end">
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
          <input type="date" value={filter.startDate} onChange={(e) => setFilter({ ...filter, startDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
          <input type="date" value={filter.endDate} onChange={(e) => setFilter({ ...filter, endDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <button onClick={generateReport} disabled={loading} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm">
          {loading ? (
            <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Generating...</>
          ) : (
            <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg> Generate Report</>
          )}
        </button>
      </div>

      {report && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Trips', value: report.summary.totalTrips, bg: 'bg-blue-50', text: 'text-blue-700' },
              { label: 'Completed', value: report.summary.completedTrips, bg: 'bg-emerald-50', text: 'text-emerald-700' },
              { label: 'Total Mileage', value: `${report.summary.totalMileage.toFixed(1)} mi`, bg: 'bg-violet-50', text: 'text-violet-700' },
              { label: 'Avg Duration', value: `${report.summary.averageDuration.toFixed(0)} min`, bg: 'bg-amber-50', text: 'text-amber-700' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.text}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Chart + export */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
              <h2 className="text-base font-semibold text-gray-900">Trip Status Distribution</h2>
              <div className="flex gap-2">
                <button onClick={() => exportReport('csv')} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                  CSV
                </button>
                <button onClick={() => exportReport('xlsx')} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                  Excel
                </button>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trip details table */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Trip Details</h2>
              <p className="text-xs text-gray-500 mt-0.5">Showing first 10 results</p>
            </div>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mileage</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {report.trips.slice(0, 10).map((trip: any) => (
                    <tr key={trip.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-900">#{trip.id}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{trip.driver?.name}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{trip.vehicle?.plateNumber}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{new Date(trip.startTime).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{trip.totalMileage || '-'} mi</td>
                      <td className="px-5 py-3.5 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${trip.status === 'completed' ? 'bg-green-100 text-green-800' : trip.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>{trip.status.replace(/_/g, ' ')}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile */}
            <div className="md:hidden divide-y divide-gray-100">
              {report.trips.slice(0, 10).map((trip: any) => (
                <div key={trip.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">#{trip.id} - {trip.driver?.name}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${trip.status === 'completed' ? 'bg-green-100 text-green-800' : trip.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>{trip.status.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div><span className="font-medium text-gray-700">Vehicle:</span> {trip.vehicle?.plateNumber}</div>
                    <div><span className="font-medium text-gray-700">Mileage:</span> {trip.totalMileage || '-'} mi</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
