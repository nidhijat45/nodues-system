import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Download } from 'lucide-react';

const StudentList = () => {
  const [assignments, setAssignments] = useState([]);
  const [labManuals, setLabManuals] = useState([]);
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({ semester: '', section: '', type: 'assignment', item_id: '' });

  useEffect(() => {
    api.get('/teacher/assignments').then(r => {
      setAssignments([...(r.data.active || []), ...(r.data.expired || [])]);
    }).catch(() => {});
    api.get('/teacher/lab-manuals').then(r => setLabManuals(r.data)).catch(() => {});
  }, []);

  const fetchStudents = () => {
    if (!filters.semester || !filters.item_id) return;
    const params = new URLSearchParams(filters);
    api.get(`/teacher/students?${params}`).then(r => setStudents(r.data)).catch(() => {});
  };

  useEffect(() => { fetchStudents(); }, [filters]);

  const set = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const toggleSubmit = async (studentId, current) => {
    try {
      if (filters.type === 'assignment') {
        await api.patch(`/teacher/assignments/${filters.item_id}/students/${studentId}/submit`, { is_submitted: !current });
      } else {
        await api.patch(`/teacher/lab-manuals/${filters.item_id}/students/${studentId}/submit`, { is_submitted: !current });
      }
      toast.success(current ? 'Marked as not submitted.' : 'Marked as submitted.');
      fetchStudents();
    } catch { toast.error('Failed.'); }
  };

  const handleExport = async () => {
    if (!filters.item_id) return toast.error('Please select an assignment or lab manual first.');
    const endpoint = filters.type === 'assignment' 
      ? `/teacher/assignments/${filters.item_id}/export` 
      : `/teacher/lab-manuals/${filters.item_id}/export`;
    
    try {
      const res = await api.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filters.type}_${filters.item_id}_report.xlsx`;
      a.click();
    } catch { toast.error('Export failed.'); }
  };

  const items = filters.type === 'assignment' ? assignments : labManuals;

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Student Submission Tracking</h2>
        {filters.item_id && (
          <button onClick={handleExport} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            <Download size={16} /> Export to Excel
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex gap-4 flex-wrap">
        <select value={filters.type} onChange={e => set('type', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="assignment">Assignment</option>
          <option value="lab_manual">Lab Manual</option>
        </select>
        <select value={filters.item_id} onChange={e => set('item_id', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Select {filters.type === 'assignment' ? 'Assignment' : 'Lab Manual'}</option>
          {items.map(i => <option key={i.id} value={i.id}>{i.assignment_name || i.subject_name}</option>)}
        </select>
        <select value={filters.semester} onChange={e => set('semester', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Semester</option>
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
              {['Enrollment No', 'Name', 'Section', 'Status', 'Action'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{s.enrollment_no}</td>
                <td className="px-4 py-3 text-gray-700">{s.name}</td>
                <td className="px-4 py-3 text-gray-500">{s.section}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.is_submitted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {s.is_submitted ? 'Submitted' : 'Pending'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleSubmit(s.id, s.is_submitted)}
                    className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors ${s.is_submitted ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                    {s.is_submitted ? <><XCircle size={13} /> Unmark</> : <><CheckCircle size={13} /> Mark Submitted</>}
                  </button>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Select filters to view students.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default StudentList;
