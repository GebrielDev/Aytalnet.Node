import { useEffect, useState } from 'react';
import { driversApi, vehiclesApi } from '../services/api';

interface Vehicle {
  id: number;
  plateNumber: string;
  make: string;
  model: string;
}

interface Driver {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: string;
  assignedVehicle?: Vehicle | null;
}

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [form, setForm] = useState({ employeeId: '', name: '', email: '', phone: '', password: '', licenseNumber: '' });

  useEffect(() => {
    fetchDrivers();
    fetchVehicles();
  }, []);

  const fetchDrivers = async () => {
    try {
      const res = await driversApi.getAll();
      setDrivers(res.data);
    } catch (error) {
      console.error('Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await vehiclesApi.getAll({ status: 'active' });
      setVehicles(res.data);
    } catch (error) {
      console.error('Failed to fetch vehicles');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDriver) {
        await driversApi.update(editingDriver.id, form);
      } else {
        await driversApi.create(form);
      }
      setShowModal(false);
      setEditingDriver(null);
      setForm({ employeeId: '', name: '', email: '', phone: '', password: '', licenseNumber: '' });
      fetchDrivers();
    } catch (error) {
      console.error('Failed to save driver');
    }
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setForm({ employeeId: driver.employeeId, name: driver.name, email: driver.email, phone: driver.phone, password: '', licenseNumber: driver.licenseNumber });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Deactivate this driver?')) {
      await driversApi.delete(id);
      fetchDrivers();
    }
  };

  const handleAssignVehicle = async (driverId: number, vehicleId: string) => {
    try {
      await driversApi.assignVehicle(driverId, vehicleId ? parseInt(vehicleId) : null);
      fetchDrivers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to assign vehicle');
    }
  };

  // Build set of vehicle IDs already assigned to other drivers
  const getAssignedVehicleIds = (excludeDriverId: number) => {
    return new Set(
      drivers
        .filter((d) => d.id !== excludeDriverId && d.assignedVehicle)
        .map((d) => d.assignedVehicle!.id)
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
          <p className="text-sm text-gray-500 mt-1">{drivers.length} driver{drivers.length !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setEditingDriver(null); setForm({ employeeId: '', name: '', email: '', phone: '', password: '', licenseNumber: '' }); }}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add Driver
        </button>
      </div>

      {/* Desktop table */}
      <div className="bg-white rounded-xl border border-gray-200 hidden lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Vehicle</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {drivers.map((driver) => {
                const assignedIds = getAssignedVehicleIds(driver.id);
                return (
                <tr key={driver.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{driver.employeeId}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">{driver.name?.charAt(0)?.toUpperCase()}</div>
                      <span className="text-sm text-gray-900">{driver.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{driver.email}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{driver.phone}</td>
                  <td className="px-5 py-3.5">
                    <select
                      value={driver.assignedVehicle?.id?.toString() || ''}
                      onChange={(e) => handleAssignVehicle(driver.id, e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">No vehicle</option>
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id.toString()} disabled={assignedIds.has(v.id)}>
                          {v.plateNumber} - {v.make} {v.model}{assignedIds.has(v.id) ? ' (assigned)' : ''}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${driver.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm space-x-2">
                    <button onClick={() => handleEdit(driver)} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                    <button onClick={() => handleDelete(driver.id)} className="text-red-600 hover:text-red-800 font-medium">Deactivate</button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {drivers.map((driver) => {
          const assignedIds = getAssignedVehicleIds(driver.id);
          return (
          <div key={driver.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">{driver.name?.charAt(0)?.toUpperCase()}</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{driver.name}</p>
                  <p className="text-xs text-gray-500">{driver.employeeId}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${driver.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {driver.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div><span className="font-medium text-gray-700">Email:</span> {driver.email}</div>
              <div><span className="font-medium text-gray-700">Phone:</span> {driver.phone}</div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Vehicle</label>
              <select
                value={driver.assignedVehicle?.id?.toString() || ''}
                onChange={(e) => handleAssignVehicle(driver.id, e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-gray-50"
              >
                <option value="">No vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id.toString()} disabled={assignedIds.has(v.id)}>
                    {v.plateNumber} - {v.make} {v.model}{assignedIds.has(v.id) ? ' (assigned)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => handleEdit(driver)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Edit</button>
              <button onClick={() => handleDelete(driver.id)} className="text-xs text-red-600 hover:text-red-800 font-medium">Deactivate</button>
            </div>
          </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editingDriver ? 'Edit Driver' : 'Add Driver'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Employee ID</label>
                <input type="text" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required disabled={!!editingDriver} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{editingDriver ? 'New Password (leave empty to keep)' : 'Password'}</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editingDriver} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">License Number</label>
                <input type="text" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
