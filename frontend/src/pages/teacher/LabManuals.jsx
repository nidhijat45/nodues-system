import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Download } from 'lucide-react';

const empty = { subject_name: '', semester: '', section: '' };

const LabManuals = () => {
  const [manuals, setManuals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetch = () => api.get('/teacher/lab-manuals').then(r => setManuals(r.data)).catch(() => {});
  useEffect(() => { fetch(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/teacher/lab-manuals/${editId}`, form);
        toast.success('Lab manual updated.');
      } else {
        await api.post('/teacher/lab-manuals', form);
        toast.success('Lab manual added.');
      }
      setShowModal(false); setForm(empty); setEditId(null); fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally { setLoading(false); }
  };

  const handleEdit = (m) => {
    setForm({ subject_name: m.subject_name, semester: m.semester, section: m.section });
    setEditId(m.id); setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this lab manual?')) return;
    try { await api.delete(`/teacher/lab-manuals/${id}`); toast.success('Deleted.'); fetch(); }
    catch { toast.error('Failed.'); }
  };

  const handleExport = async (id) => {
    try {
      const res = await api.get(`/teacher/lab-manuals/${id}/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `lab_manual_${id}_report.xlsx`;
      a.click();
    } catch { toast.error('Export failed.'); }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Lab Manuals</h2>
        <button onClick={() => { setShowModal(true); setForm(empty); setEditId(null); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          <Plus size={16} /> Add Lab Manual
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Subject', 'Semester', 'Section', 'Added On', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {manuals.map(m => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{m.subject_name}</td>
                <td className="px-4 py-3 text-gray-500">Sem {m.semester}</td>
                <td className="px-4 py-3 text-gray-500">{m.section}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(m.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleExport(m.id)} className="text-green-500 hover:text-green-700" title="Export Excel"><Download size={15} /></button>
                    <button onClick={() => handleEdit(m)} className="text-blue-500 hover:text-blue-700"><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(m.id)} className="text-red-500 hover:text-red-700"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {manuals.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No lab manuals found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">{editId ? 'Edit' : 'Add'} Lab Manual</h3>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required value={form.subject_name} onChange={e => set('subject_name', e.target.value)} placeholder="Subject Name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <select required value={form.semester} onChange={e => set('semester', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Semester</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
              </select>
              <select required value={form.section} onChange={e => set('section', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Section</option>
                {['A', 'B', 'C', 'D', 'E'].map(s => <option key={s} value={s}>Section {s}</option>)}
              </select>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {loading ? 'Saving...' : editId ? 'Update' : 'Add Lab Manual'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default LabManuals;
