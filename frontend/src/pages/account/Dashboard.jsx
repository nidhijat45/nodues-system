import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle } from 'lucide-react';

const AccountDashboard = () => {
  const [pending, setPending] = useState([]);
  const [filters, setFilters] = useState({ department_id: '', semester: '', section: '' });
  const [departments, setDepartments] = useState([]);

  const fetch = () => {
    const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([,v]) => v)));
    api.get(`/account/requests/pending?${params}`).then(r => setPending(r.data)).catch(() => {});
  };

  useEffect(() => {
    api.get('/admin/departments').then(r => setDepartments(r.data)).catch(() => {});
  }, []);

  useEffect(() => { fetch(); }, [filters]);

  const set = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const approve = async (requestId) => {
    try {
      await api.patch(`/account/requests/${requestId}/approve`);
      toast.success('Fee approved. Forwarded to HOD.');
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
  };

  const reject = async (requestId) => {
    if (!confirm('Reject this request?')) return;
    try {
      await api.patch(`/account/requests/${requestId}/reject`);
      toast.success('Request rejected.');
      fetch();
    } catch { toast.error('Failed.'); }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Account Department — Pending Requests</h2>

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
              {['Enrollment No', 'Name', 'Mobile', 'Department', 'Sem', 'Section', 'Due Fees', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pending.map(p => {
              const due = (p.student?.total_fees || 0) - (p.student?.paid_fees || 0);
              return (
              <tr key={p.approval_id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{p.student?.enrollment_no}</td>
                <td className="px-4 py-3 text-gray-700">{p.student?.name}</td>
                <td className="px-4 py-3 text-gray-500">{p.student?.mobile || '-'}</td>
                <td className="px-4 py-3 text-gray-500">{p.student?.department?.code}</td>
                <td className="px-4 py-3 text-gray-500">{p.student?.semester}</td>
                <td className="px-4 py-3 text-gray-500">{p.student?.section}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${due > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {due > 0 ? `Pending ₹${due}` : 'Fee Cleared'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => approve(p.request_id)} disabled={due > 0} title={due > 0 ? 'Cannot approve until fee is cleared' : 'Approve Request'}
                      className={`flex items-center gap-1 text-white text-xs px-3 py-1.5 rounded-lg transition-colors ${due > 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
                      <CheckCircle size={13} /> Approve
                    </button>
                    <button onClick={() => reject(p.request_id)}
                      className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                </td>
              </tr>
            )})}
            {pending.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No pending requests.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default AccountDashboard;
