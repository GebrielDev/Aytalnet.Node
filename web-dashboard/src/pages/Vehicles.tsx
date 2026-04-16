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

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
          <p className="text-sm text-gray-500 mt-1">{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setEditingVehicle(null); setForm({ plateNumber: '', make: '', model: '', year: '', vin: '', currentOdometer: '' }); }}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add Vehicle
        </button>
      </div>

      {/* Desktop table */}
      <div className="bg-white rounded-xl border border-gray-200 hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plate</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Make/Model</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VIN</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Odometer</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{vehicle.plateNumber}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-900">{vehicle.make} {vehicle.model}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{vehicle.year}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600 font-mono">{vehicle.vin}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{vehicle.currentOdometer} mi</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${vehicle.status === 'active' ? 'bg-green-100 text-green-800' : vehicle.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm space-x-2">
                    <button onClick={() => handleEdit(vehicle)} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                    <button onClick={() => handleDelete(vehicle.id)} className="text-red-600 hover:text-red-800 font-medium">Deactivate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">{vehicle.plateNumber}</p>
                <p className="text-xs text-gray-500">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${vehicle.status === 'active' ? 'bg-green-100 text-green-800' : vehicle.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                {vehicle.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div><span className="font-medium text-gray-700">VIN:</span> <span className="font-mono">{vehicle.vin}</span></div>
              <div><span className="font-medium text-gray-700">Odometer:</span> {vehicle.currentOdometer} mi</div>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => handleEdit(vehicle)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Edit</button>
              <button onClick={() => handleDelete(vehicle.id)} className="text-xs text-red-600 hover:text-red-800 font-medium">Deactivate</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Plate Number</label>
                <input type="text" value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Make</label>
                  <input type="text" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Model</label>
                  <input type="text" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Year</label>
                  <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Odometer</label>
                  <input type="number" value={form.currentOdometer} onChange={(e) => setForm({ ...form, currentOdometer: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">VIN</label>
                <input type="text" value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
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
