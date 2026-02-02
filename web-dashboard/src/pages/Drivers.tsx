import { useEffect, useState } from 'react';
import { driversApi } from '../services/api';

interface Driver {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: string;
}

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [form, setForm] = useState({ employeeId: '', name: '', email: '', phone: '', password: '', licenseNumber: '' });

  useEffect(() => {
    fetchDrivers();
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

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
        <button
          onClick={() => { setShowModal(true); setEditingDriver(null); setForm({ employeeId: '', name: '', email: '', phone: '', password: '', licenseNumber: '' }); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Driver
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {drivers.map((driver) => (
              <tr key={driver.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{driver.employeeId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${driver.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {driver.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button onClick={() => handleEdit(driver)} className="text-blue-600 hover:text-blue-900">Edit</button>
                  <button onClick={() => handleDelete(driver.id)} className="text-red-600 hover:text-red-900">Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingDriver ? 'Edit Driver' : 'Add Driver'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Employee ID" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required disabled={!!editingDriver} className="w-full px-3 py-2 border rounded-md" />
              <input type="text" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 border rounded-md" />
              <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full px-3 py-2 border rounded-md" />
              <input type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="w-full px-3 py-2 border rounded-md" />
              <input type="password" placeholder={editingDriver ? 'New Password (leave empty to keep)' : 'Password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editingDriver} className="w-full px-3 py-2 border rounded-md" />
              <input type="text" placeholder="License Number" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} required className="w-full px-3 py-2 border rounded-md" />
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
