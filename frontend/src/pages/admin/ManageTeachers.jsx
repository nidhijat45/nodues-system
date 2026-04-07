import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Download } from 'lucide-react';

const emptyForm = { name: '', email: '', password: '', mobile: '', department_id: '', designation: 'assistant', is_hod: false };

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = () => {
    api.get('/admin/departments').then(r => setDepartments(r.data)).catch(() => { });
    fetchTeachers();
  };

  const fetchTeachers = () => {
    const params = selectedDept !== 'all' ? { department_id: selectedDept } : {};
    api.get('/admin/teachers', { params })
      .then(r => setTeachers(r.data))
      .catch(() => { });
  };

  useEffect(() => { fetchData(); }, [selectedDept]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/admin/teachers/${editId}`, form);
        toast.success('Teacher updated.');
      } else {
        await api.post('/admin/teachers', form);
        toast.success('Teacher added.');
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditId(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (t) => {
    setForm({ name: t.name, email: t.email, password: '', mobile: t.mobile || '', department_id: t.department_id, designation: t.designation, is_hod: t.is_hod });
    setEditId(t.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to PERMANENTLY delete this teacher? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/teachers/${id}`);
      toast.success('Teacher deleted permanently.');
      fetchData();
    } catch {
      toast.error('Failed to delete teacher.');
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({ type: 'teachers' });
      if (selectedDept !== 'all') params.append('department_id', selectedDept);
      const res = await api.get(`/admin/export/staff?${params}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `Staff_Report${selectedDept !== 'all' ? `_dept_${selectedDept}` : ''}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Export failed.');
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Manage Teachers</h2>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
            <span className="text-gray-500">Filter:</span>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-sm"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <Download size={16} /> Export
            </button>
            <button onClick={() => { setShowModal(true); setForm(emptyForm); setEditId(null); }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              <Plus size={16} /> Add Teacher
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Name', 'Email', 'Department', 'Designation', 'HOD', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {teachers.map(t => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{t.name}</td>
                <td className="px-4 py-3 text-gray-500">{t.email}</td>
                <td className="px-4 py-3 text-gray-500">{t.department?.code || '-'}</td>
                <td className="px-4 py-3 capitalize text-gray-500">{t.designation}</td>
                <td className="px-4 py-3">
                  {t.is_hod ? <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-medium">HOD</span> : '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(t)} className="text-blue-500 hover:text-blue-700"><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {teachers.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No teachers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">{editId ? 'Edit Teacher' : 'Add Teacher'}</h3>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full Name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input required={!editId} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="Email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {!editId && <input required type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />}
              <input value={form.mobile} onChange={e => set('mobile', e.target.value)} placeholder="Mobile"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <select required value={form.department_id} onChange={e => set('department_id', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Department</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
              </select>
              <select required value={form.designation} onChange={e => set('designation', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="assistant">Assistant Professor</option>
                <option value="associate">Associate Professor</option>
                <option value="doctorate">Doctorate</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.is_hod} onChange={e => set('is_hod', e.target.checked)} className="rounded" />
                Is HOD of this department?
              </label>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {loading ? 'Saving...' : editId ? 'Update Teacher' : 'Add Teacher'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ManageTeachers;
