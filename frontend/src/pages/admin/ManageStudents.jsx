import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Plus, X, Download } from 'lucide-react';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({ department_id: '', semester: '', section: '', is_active: 'true' });

  const fetchStudents = () => {
    const params = new URLSearchParams();
    if (filters.department_id) params.append('department_id', filters.department_id);
    if (filters.semester) params.append('semester', filters.semester);
    if (filters.section) params.append('section', filters.section);
    if (filters.is_active) params.append('is_active', filters.is_active);
    api.get(`/admin/students?${params}`).then(r => setStudents(r.data)).catch(() => { });
  };

  useEffect(() => {
    api.get('/admin/departments').then(r => setDepartments(r.data)).catch(() => { });
  }, []);

  useEffect(() => { fetchStudents(); }, [filters]);

  const set = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', email: '', password: '', mobile: '', enrollment_no: '', department_id: '', semester: 1, section: 'A', year: 1, is_active: true });

  const resetForm = () => {
    setFormData({ id: null, name: '', email: '', password: '', mobile: '', enrollment_no: '', department_id: '', semester: 1, section: 'A', year: 1, is_active: true });
    setShowModal(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await api.put(`/admin/students/${formData.id}`, formData);
        toast.success('Student updated.');
      } else {
        await api.post('/admin/students', formData);
        toast.success('Student added.');
      }
      resetForm();
      fetchStudents();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving student'); }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to PERMANENTLY delete this student? All their data will be lost.')) {
      try {
        await api.delete(`/admin/students/${id}`);
        toast.success('Student deleted permanently.');
        fetchStudents();
      } catch (err) { toast.error('Error deleting student.'); }
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/admin/students/${id}/approve`);
      toast.success('Student approved successfully.');
      fetchStudents();
    } catch (err) {
      toast.error('Failed to approve student.');
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Manage Students</h2>

        <div className="flex gap-2">
          <button
            onClick={() => {
              const params = new URLSearchParams(filters);
              window.open(`/admin/reports/students?${params}`, '_blank');
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex gap-4 flex-wrap">
        <select value={filters.department_id} onChange={e => set('department_id', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
        </select>
        <select value={filters.semester} onChange={e => set('semester', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
        </select>
        <select value={filters.section} onChange={e => set('section', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Sections</option>
          {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>Section {s}</option>)}
        </select>
        <select value={filters.is_active} onChange={e => set('is_active', e.target.value)}
          className={`border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${filters.is_active === 'false' ? 'bg-orange-50 border-orange-300 text-orange-700' : 'bg-white'}`}>
          <option value="true">Approved Students</option>
          <option value="false">Pending Approval</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Enrollment No', 'Name', 'Email', 'Department', 'Sem', 'Section', 'Year', 'Mobile', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{s.enrollment_no}</td>
                <td className="px-4 py-3 text-gray-700">{s.name}</td>
                <td className="px-4 py-3 text-gray-500">{s.email}</td>
                <td className="px-4 py-3 text-gray-500">{s.department?.code || '-'}</td>
                <td className="px-4 py-3 text-gray-500">{s.semester}</td>
                <td className="px-4 py-3 text-gray-500">{s.section}</td>
                <td className="px-4 py-3 text-gray-500">{s.year}</td>
                <td className="px-4 py-3 text-gray-500">{s.mobile || '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {s.is_active === false && (
                      <button onClick={() => handleApprove(s.id)} className="text-green-600 hover:text-green-800 bg-green-50 px-2 py-1 rounded text-xs font-bold" title="Approve Student">
                        Approve
                      </button>
                    )}
                    <button onClick={() => { setFormData(s); setShowModal(true); }} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1.5 rounded" title="Edit Student">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded" title="Delete Student">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No students found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">{formData.id ? 'Edit Student' : 'Add New Student'}</h3>
              <button onClick={resetForm}><X size={20} className="text-gray-400" /></button>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <input required placeholder="Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <input required type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <input required={!formData.id} type="password" placeholder={formData.id ? 'Leave blank to keep current' : 'Password'} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <input required placeholder="Enrollment No" value={formData.enrollment_no} onChange={e => setFormData({ ...formData, enrollment_no: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <input placeholder="Mobile No (10 digits)" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <select required value={formData.department_id} onChange={e => setFormData({ ...formData, department_id: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2 col-span-2 sm:col-span-1">
                <input required type="number" min="1" max="8" placeholder="Sem" value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none" />
                <select required value={formData.section} onChange={e => setFormData({ ...formData, section: e.target.value })} className="w-full border rounded-lg px-2 py-2 text-sm focus:outline-none">
                  <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                </select>
                <input required type="number" min="1" max="4" placeholder="Year" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>


              <div className="col-span-2 flex justify-end gap-3 mt-4">
                <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Save Student</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ManageStudents;
