import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { DownloadCloud, Users, FileCheck, FileX } from 'lucide-react';

const AdminReports = () => {
  const [overview, setOverview] = useState({ totalStudents: 0, completedStatus: 0, pendingStatus: 0 });

  useEffect(() => {
    api.get('/admin/overview').then(res => setOverview(res.data)).catch(() => {});
  }, []);

  const downloadReport = async (endpoint, filename) => {
    try {
      const response = await api.get(`/admin/export/${endpoint}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Download failed');
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">System Reports</h2>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Active Students</p>
            <h3 className="text-2xl font-bold text-gray-800">{overview.totalStudents}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg"><FileCheck size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Completed No-Dues</p>
            <h3 className="text-2xl font-bold text-gray-800">{overview.completedStatus}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg"><FileX size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending No-Dues</p>
            <h3 className="text-2xl font-bold text-gray-800">{overview.pendingStatus}</h3>
          </div>
        </div>
      </div>

      {/* Download Section */}
      <h3 className="text-lg font-bold text-gray-800 mb-4">Export Data</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <button onClick={() => downloadReport('students', 'Students_NoDues_Report.xlsx')}
          className="flex flex-col items-center justify-center gap-3 p-8 bg-white border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors group">
          <DownloadCloud size={32} className="text-gray-400 group-hover:text-blue-500" />
          <span className="font-medium text-gray-700 group-hover:text-blue-700">Students & No-Dues Report</span>
          <span className="text-xs text-gray-400 text-center">Export a comprehensive Excel sheet of all students, their fees, and statuses.</span>
        </button>

        <button onClick={() => downloadReport('staff', 'Staff_Report.xlsx')}
          className="flex flex-col items-center justify-center gap-3 p-8 bg-white border-2 border-dashed border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors group">
          <DownloadCloud size={32} className="text-gray-400 group-hover:text-green-500" />
          <span className="font-medium text-gray-700 group-hover:text-green-700">Staff & Teachers Report</span>
          <span className="text-xs text-gray-400 text-center">Export a complete list of all faculty members and operational staff.</span>
        </button>
      </div>
    </Layout>
  );
};
export default AdminReports;
