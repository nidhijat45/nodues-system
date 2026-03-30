import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';

const AccountApproved = () => {
  const [approved, setApproved] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({ department_id: '', semester: '', section: '' });

  useEffect(() => {
    api.get('/admin/departments').then(r => setDepartments(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([,v]) => v)));
    api.get(`/account/requests/approved?${params}`).then(r => setApproved(r.data)).catch(() => {});
  }, [filters]);

  const set = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Approved Students</h2>

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
              {['Enrollment No', 'Name', 'Mobile', 'Department', 'Sem', 'Section', 'Due Fees', 'Approved On'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {approved.map(a => {
              const due = (a.student?.total_fees || 0) - (a.student?.paid_fees || 0);
              return (
              <tr key={a.approval_id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{a.student?.enrollment_no}</td>
                <td className="px-4 py-3 text-gray-700">{a.student?.name}</td>
                <td className="px-4 py-3 text-gray-500">{a.student?.mobile || '-'}</td>
                <td className="px-4 py-3 text-gray-500">{a.student?.department?.code}</td>
                <td className="px-4 py-3 text-gray-500">{a.student?.semester}</td>
                <td className="px-4 py-3 text-gray-500">{a.student?.section}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700`}>
                    {due > 0 ? `Pending ₹${due}` : 'Fee Cleared'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{a.reviewed_at ? new Date(a.reviewed_at).toLocaleDateString() : '-'}</td>
              </tr>
            )})}
            {approved.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No approved requests yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default AccountApproved;
