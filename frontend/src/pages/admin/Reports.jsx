import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { DownloadCloud, Users, FileCheck, FileX, GraduationCap, UserCheck, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminReports = () => {
  const [overview, setOverview] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalStaff: 0,
    totalHODs: 0,
    completedStatus: 0,
    pendingStatus: 0
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter States
  const [reportType, setReportType] = useState('students'); // students, teachers, hod, staff
  const [filters, setFilters] = useState({
    department_id: '',
    semester: '',
    section: ''
  });

  useEffect(() => {
    fetchOverview();
    api.get('/admin/departments').then(res => setDepartments(res.data)).catch(() => {});
  }, []);

  const fetchOverview = () => {
    api.get('/admin/overview').then(res => setOverview(res.data)).catch(() => {});
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const downloadReport = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      const params = new URLSearchParams();

      if (reportType === 'students') {
        endpoint = 'students';
        if (filters.department_id) params.append('department_id', filters.department_id);
        if (filters.semester) params.append('semester', filters.semester);
        if (filters.section) params.append('section', filters.section);
      } else {
        endpoint = 'staff';
        params.append('type', reportType); // teachers, hod, staff
        if (filters.department_id) params.append('department_id', filters.department_id);
      }

      const response = await api.get(`/admin/export/${endpoint}?${params.toString()}`, { responseType: 'blob' });
      
      const fileName = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)}_Report_${new Date().toLocaleDateString()}.xlsx`;
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Report generated successfully!');
    } catch (err) {
      toast.error('Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">System Monitoring & Reports</h2>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><GraduationCap size={20} /></div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Students</p>
            <h3 className="text-xl font-bold text-gray-800">{overview.totalStudents}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><Users size={20} /></div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Teachers</p>
            <h3 className="text-xl font-bold text-gray-800">{overview.totalTeachers}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><UserCheck size={20} /></div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">HODs</p>
            <h3 className="text-xl font-bold text-gray-800">{overview.totalHODs}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><Briefcase size={20} /></div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Staff</p>
            <h3 className="text-xl font-bold text-gray-800">{overview.totalStaff}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg"><FileCheck size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Completed No-Dues</p>
            <h3 className="text-2xl font-bold text-gray-800">{overview.completedStatus}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg"><FileX size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Live Pending Requests</p>
            <h3 className="text-2xl font-bold text-gray-800">{overview.pendingStatus}</h3>
          </div>
        </div>
      </div>

      {/* Advanced Report Generator */}
      <h3 className="text-lg font-bold text-gray-800 mb-4">Advanced Report Generator</h3>
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Report Type */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">I want a report for:</label>
              <select 
                value={reportType} 
                onChange={(e) => {
                  setReportType(e.target.value);
                  setFilters({ department_id: '', semester: '', section: '' });
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="students">Students (No-Dues Status)</option>
                <option value="teachers">Teachers List</option>
                <option value="hod">HODs Only</option>
                <option value="staff">Operational Staff</option>
              </select>
            </div>

            {/* Department Filter */}
            {(reportType === 'students' || reportType === 'teachers') && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">Branch / Department:</label>
                <select 
                  name="department_id"
                  value={filters.department_id}
                  onChange={handleFilterChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">All Departments</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
                </select>
              </div>
            )}

            {/* Student Specific Filters */}
            {reportType === 'students' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600">Semester:</label>
                  <select 
                    name="semester"
                    value={filters.semester}
                    onChange={handleFilterChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">All Semesters</option>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600">Section:</label>
                  <select 
                    name="section"
                    value={filters.section}
                    onChange={handleFilterChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">All Sections</option>
                    {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>Section {s}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="mt-8 flex flex-col items-center border-t border-gray-50 pt-8">
            <button 
              onClick={downloadReport}
              disabled={loading}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${
                loading ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-1'
              }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <DownloadCloud size={24} />
              )}
              {loading ? 'Generating...' : `Download ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`}
            </button>
            <p className="mt-4 text-xs text-gray-400 font-medium italic">
              * Reports are generated in .xlsx format (Excel compatible)
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default AdminReports;
