import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Plus, X } from 'lucide-react';

const ManageStaff = () => {
  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', email: '', password: '', role: 'account', is_active: true });

  const fetchStaff = () => api.get('/admin/staff').then(res => setStaff(res.data)).catch(() => {});

  useEffect(() => { fetchStaff(); }, []);

  const resetForm = () => {
    setFormData({ id: null, name: '', email: '', password: '', role: 'account', is_active: true });
    setShowModal(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await api.put(`/admin/staff/${formData.id}`, formData);
        toast.success('Staff updated successfully.');
      } else {
        await api.post('/admin/staff', formData);
        toast.success('Staff added successfully.');
      }
      resetForm();
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error processing request');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to PERMANENTLY delete this staff member? This action is irreversible.')) {
      try {
        await api.delete(`/admin/staff/${id}`);
        toast.success('Staff member deleted permanently.');
        fetchStaff();
      } catch (err) { toast.error('Error deleting staff.'); }
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Support Staff</h2>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={18} /> Add Staff
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Name', 'Email', 'Role', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {staff.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                <td className="px-4 py-3 text-gray-500">{s.email}</td>
                <td className="px-4 py-3 text-gray-500 capitalize">{s.role}</td>
                    <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded" title="Delete Staff">
                      <Trash2 size={14} />
                    </button>
              </tr>
            ))}
            {staff.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No staff found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">{formData.id ? 'Edit Staff' : 'Add New Staff'}</h3>
              <button onClick={resetForm}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <input required placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input required type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input required={!formData.id} type="password" placeholder={formData.id ? 'Leave blank to keep password' : 'Password'} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="account">Account Department</option>
                <option value="exam">Exam Department</option>
              </select>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};
export default ManageStaff;
