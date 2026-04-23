import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { BarChart, Users, CheckCircle, XCircle, Clock, Download, Filter } from 'lucide-react';

const DepartmentReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/hod/reports');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <Layout><div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div></Layout>;

  const filteredReport = data?.report.filter(r => {
    return semesterFilter === '' || r.semester.toString() === semesterFilter;
  }) || [];

  const downloadCSV = (type) => {
    const list = type === 'completed' 
      ? filteredReport.filter(r => r.status === 'approved')
      : filteredReport.filter(r => r.status !== 'approved');

    if (list.length === 0) {
      alert(`No students found for ${type} list.`);
      return;
    }

    const headers = ['Name,Enrollment No,Semester,Section,Status,Initiated On,Completed On\n'];
    const rows = list.map(r => 
      `"${r.name}","${r.enrollment_no}","${r.semester}","${r.section}","${r.status}","${r.initiated_at ? new Date(r.initiated_at).toLocaleDateString() : '-'}","${r.completed_at ? new Date(r.completed_at).toLocaleDateString() : '-'}"`
    );
    
    const csvContent = headers.concat(rows.join('\n')).join('');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `department_report_${type}_sem${semesterFilter || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'not_initiated': return 'bg-gray-100 text-gray-500';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle size={12} />;
      case 'rejected': return <XCircle size={12} />;
      case 'not_initiated': return <Clock size={12} />;
      default: return <Clock size={12} />;
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Department No-Dues Report</h2>
        <p className="text-sm text-gray-500 mt-1">Overall progress tracking for all students. Download filtered lists below.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Students', value: data?.stats.total, icon: Users, color: 'blue' },
          { label: 'Completed', value: data?.stats.completed, icon: CheckCircle, color: 'green' },
          { label: 'In Progress', value: data?.stats.in_progress, icon: Clock, color: 'orange' },
          { label: 'Not Started', value: data?.stats.not_started, icon: XCircle, color: 'gray' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-center">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-4 bg-${stat.color}-50 text-${stat.color}-600`}>
              <stat.icon size={20} />
            </div>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table & Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl text-sm text-gray-600 border">
              <Filter size={16} className="text-gray-400" />
              <select 
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm font-bold p-0"
              >
                <option value="">All Semesters</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s.toString()}>Semester {s}</option>)}
              </select>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button 
              onClick={() => downloadCSV('completed')}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shadow-green-100"
            >
              <Download size={15} /> Download Completed
            </button>
            <button 
              onClick={() => downloadCSV('pending')}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-100"
            >
              <Download size={15} /> Download Pending
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-[11px] uppercase tracking-wider font-bold text-gray-400 border-b">
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Enrollment</th>
                <th className="px-6 py-4">Sem / Sec</th>
                <th className="px-6 py-4">No-Dues Status</th>
                <th className="px-6 py-4">Initiated On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredReport.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-800 text-sm">{r.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{r.enrollment_no}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{r.semester} - {r.section}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold capitalize ${getStatusColor(r.status)}`}>
                      {getStatusIcon(r.status)}
                      {r.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400 font-medium">
                    {r.initiated_at ? new Date(r.initiated_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
              {filteredReport.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400">No data found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default DepartmentReport;
