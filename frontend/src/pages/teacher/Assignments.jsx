import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Download } from 'lucide-react';

const empty = { subject_name: '', assignment_name: '', given_date: '', due_date: '', semester: '', section: '', file: null };

const Assignments = () => {
  const [active, setActive] = useState([]);
  const [expired, setExpired] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('active');

  const fetch = () => {
    api.get('/teacher/assignments').then(r => {
      setActive(r.data.active || []);
      setExpired(r.data.expired || []);
    }).catch(() => {});
  };

  useEffect(() => { fetch(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (k !== 'file' && v) fd.append(k, v); });
      if (form.file) fd.append('file', form.file);

      if (editId) {
        await api.put(`/teacher/assignments/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Assignment updated.');
      } else {
        await api.post('/teacher/assignments', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Assignment added.');
      }
      setShowModal(false);
      setForm(empty);
      setEditId(null);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (a) => {
    setForm({ subject_name: a.subject_name, assignment_name: a.assignment_name, given_date: a.given_date, due_date: a.due_date, semester: a.semester, section: a.section, file: null });
    setEditId(a.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this assignment?')) return;
    try {
      await api.delete(`/teacher/assignments/${id}`);
      toast.success('Deleted.');
      fetch();
    } catch { toast.error('Failed.'); }
  };

  const handleExport = async (id) => {
    try {
      const res = await api.get(`/teacher/assignments/${id}/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `assignment_${id}_report.xlsx`;
      a.click();
    } catch { toast.error('Export failed.'); }
  };

  const list = tab === 'active' ? active : expired;

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Assignments</h2>
        <button onClick={() => { setShowModal(true); setForm(empty); setEditId(null); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          <Plus size={16} /> Add Assignment
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {['active', 'expired'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
            {t} ({t === 'active' ? active.length : expired.length})
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Assignment', 'Subject', 'Sem/Sec', 'Given', 'Due Date', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.map(a => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{a.assignment_name}</td>
                <td className="px-4 py-3 text-gray-500">{a.subject_name}</td>
                <td className="px-4 py-3 text-gray-500">Sem {a.semester} / {a.section}</td>
                <td className="px-4 py-3 text-gray-500">{a.given_date}</td>
                <td className="px-4 py-3 text-gray-500">{a.due_date}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleExport(a.id)} className="text-green-500 hover:text-green-700" title="Export Excel"><Download size={15} /></button>
                    <button onClick={() => handleEdit(a)} className="text-blue-500 hover:text-blue-700"><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(a.id)} className="text-red-500 hover:text-red-700"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No assignments found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">{editId ? 'Edit' : 'Add'} Assignment</h3>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required value={form.subject_name} onChange={e => set('subject_name', e.target.value)} placeholder="Subject Name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input required value={form.assignment_name} onChange={e => set('assignment_name', e.target.value)} placeholder="Assignment Name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Given Date</label>
                  <input required type="date" value={form.given_date} onChange={e => set('given_date', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Due Date</label>
                  <input required type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select required value={form.semester} onChange={e => set('semester', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Semester</option>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                </select>
                <select required value={form.section} onChange={e => set('section', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Section</option>
                  {['A','B','C','D'].map(s => <option key={s} value={s}>Section {s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Attach File (Optional)</label>
                <input type="file" onChange={e => set('file', e.target.files[0])}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {loading ? 'Saving...' : editId ? 'Update' : 'Add Assignment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Assignments;
