import { useEffect, useState } from 'react';
import { vehiclesApi } from '../services/api';

interface Vehicle {
  id: number;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  status: string;
  currentOdometer: number;
}

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [form, setForm] = useState({ plateNumber: '', make: '', model: '', year: '', vin: '', currentOdometer: '' });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await vehiclesApi.getAll();
      setVehicles(res.data);
    } catch (error) {
      console.error('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, year: parseInt(form.year), currentOdometer: parseFloat(form.currentOdometer) || 0 };
      if (editingVehicle) {
        await vehiclesApi.update(editingVehicle.id, data);
      } else {
        await vehiclesApi.create(data);
      }
      setShowModal(false);
      setEditingVehicle(null);
      setForm({ plateNumber: '', make: '', model: '', year: '', vin: '', currentOdometer: '' });
      fetchVehicles();
    } catch (error) {
      console.error('Failed to save vehicle');
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setForm({
      plateNumber: vehicle.plateNumber,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year.toString(),
      vin: vehicle.vin,
      currentOdometer: vehicle.currentOdometer.toString(),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Deactivate this vehicle?')) {
      await vehiclesApi.delete(id);
      fetchVehicles();
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
        <button
          onClick={() => { setShowModal(true); setEditingVehicle(null); setForm({ plateNumber: '', make: '', model: '', year: '', vin: '', currentOdometer: '' }); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Vehicle
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Make/Model</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">VIN</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Odometer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vehicle.plateNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.make} {vehicle.model}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.year}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.vin}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.currentOdometer} mi</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${vehicle.status === 'active' ? 'bg-green-100 text-green-800' : vehicle.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {vehicle.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button onClick={() => handleEdit(vehicle)} className="text-blue-600 hover:text-blue-900">Edit</button>
                  <button onClick={() => handleDelete(vehicle.id)} className="text-red-600 hover:text-red-900">Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Plate Number" value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} required className="w-full px-3 py-2 border rounded-md" />
              <input type="text" placeholder="Make" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} required className="w-full px-3 py-2 border rounded-md" />
              <input type="text" placeholder="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} required className="w-full px-3 py-2 border rounded-md" />
              <input type="number" placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} required className="w-full px-3 py-2 border rounded-md" />
              <input type="text" placeholder="VIN" value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} required className="w-full px-3 py-2 border rounded-md" />
              <input type="number" placeholder="Current Odometer" value={form.currentOdometer} onChange={(e) => setForm({ ...form, currentOdometer: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
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
