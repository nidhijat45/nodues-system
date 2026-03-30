import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Pencil, Check, X } from 'lucide-react';

const AccountFees = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({ department_id: '', semester: '', section: '' });
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const fetchStudents = () => {
    const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([,v]) => v)));
    api.get(`/account/fees?${params}`).then(r => setStudents(r.data)).catch(() => {});
  };

  useEffect(() => {
    api.get('/admin/departments').then(r => setDepartments(r.data)).catch(() => {});
  }, []);

  useEffect(() => { fetchStudents(); }, [filters]);

  const set = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const startEdit = (student) => {
    setEditingId(student.id);
    setEditValue(student.paid_fees || 0);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveEdit = async (studentId) => {
    try {
      await api.patch(`/account/fees/${studentId}`, { paid_fees: parseInt(editValue) || 0 });
      toast.success('Fees updated successfully.');
      setEditingId(null);
      fetchStudents();
    } catch { toast.error('Failed to update fees.'); }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Student Fee Management</h2>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex gap-4 flex-wrap">
        <select value={filters.department_id} onChange={e => set('department_id', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
        </select>
        <select value={filters.semester} onChange={e => set('semester', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Semesters</option>
          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
        </select>
        <select value={filters.section} onChange={e => set('section', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Sections</option>
          {['A','B','C','D'].map(s => <option key={s} value={s}>Section {s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Enrollment No', 'Name', 'Department', 'Sem', 'Total Fees', 'Paid Fees', 'Due Fees', 'Action'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{s.enrollment_no}</td>
                <td className="px-4 py-3 text-gray-700">{s.name}</td>
                <td className="px-4 py-3 text-gray-500">{s.department?.code}</td>
                <td className="px-4 py-3 text-gray-500">{s.semester}</td>
                <td className="px-4 py-3 text-gray-500 font-medium">₹{s.total_fees}</td>
                <td className="px-4 py-3 text-green-600 font-medium">
                  {editingId === s.id ? (
                    <input 
                      type="number" 
                      value={editValue} 
                      onChange={e => setEditValue(e.target.value)}
                      className="w-24 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    `₹${s.paid_fees}`
                  )}
                </td>
                <td className="px-4 py-3 text-red-600 font-medium">₹{s.total_fees - s.paid_fees}</td>
                <td className="px-4 py-3">
                  {editingId === s.id ? (
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(s.id)} className="text-green-600 hover:text-green-800"><Check size={16} /></button>
                      <button onClick={cancelEdit} className="text-red-500 hover:text-red-700"><X size={16} /></button>
                    </div>
                  ) : (
                    <button onClick={() => startEdit(s)} className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-xs">
                      <Pencil size={14} /> Update
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No students found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default AccountFees;
