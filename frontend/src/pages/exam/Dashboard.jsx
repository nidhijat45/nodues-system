import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle, Download, ChevronDown, ChevronUp } from 'lucide-react';

const ExamDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const r = await api.get('/exam/requests');
      setRequests(r.data);
    } catch (err) {
      toast.error('Failed to fetch requests.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { fetch(); }, []);

  const downloadList = () => {
    if (requests.length === 0) {
      toast.error('No data to download.');
      return;
    }
    const headers = ['Name,Enrollment No,Semester,Section,Department,Status\n'];
    const rows = requests.map(r => 
      `"${r.student?.name}","${r.student?.enrollment_no}","${r.student?.semester}","${r.student?.section}","${r.student?.department?.code}","${r.status}"`
    );
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'approved_students_list.csv';
    a.click();
  };

  if (loading) return <Layout><div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div></Layout>;

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Exam Department — Approved List</h2>
          <p className="text-sm text-gray-500 mt-1">View and download the list of students cleared by HOD.</p>
        </div>
        <button 
          onClick={downloadList}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-100"
        >
          <Download size={18} /> Download Approved List
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Approved Students</p>
          <p className="text-2xl font-black text-green-600">{requests.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">System Status</p>
          <p className="text-lg font-bold text-blue-600">Syncing Live Data</p>
        </div>
      </div>

      <div className="space-y-4">
        {requests.map(r => (
          <div key={r.approval_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:border-blue-200 transition-all">
            <div className="flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-gray-50/50"
              onClick={() => setExpanded(expanded === r.approval_id ? null : r.approval_id)}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-blue-400 font-bold">
                  {r.student?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-lg">{r.student?.name}</p>
                  <p className="text-xs text-gray-500 font-medium">
                    {r.student?.enrollment_no} • Sem {r.student?.semester} {r.student?.section} • {r.student?.department?.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="hidden md:block text-right mr-4">
                   <p className="text-[10px] font-bold text-gray-400 uppercase">Clearance Status</p>
                   <p className="text-xs font-bold text-green-600 capitalize">Fully {r.status}</p>
                </div>
                <div className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  {expanded === r.approval_id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                </div>
              </div>
            </div>

            {expanded === r.approval_id && (
              <div className="border-t border-gray-50 px-6 py-5 bg-gray-50/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Approval Chain History</p>
                      <div className="space-y-3">
                        {r.teacher_approvals?.map((t, i) => (
                          <div key={i} className="flex items-center justify-between bg-white/50 p-3 rounded-xl border border-gray-50">
                            <span className="text-sm font-semibold text-gray-700">{t.teacher?.name}</span>
                            <span className="text-[10px] px-2 py-1 rounded-lg font-bold capitalize bg-green-50 text-green-600">Approved</span>
                          </div>
                        ))}
                      </div>
                   </div>
                   <div className="bg-white p-5 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Record Details</p>
                      <p className="text-sm text-gray-600 font-medium mb-1">Student Contact</p>
                      <p className="text-lg font-bold text-gray-800">{r.student?.mobile || 'N/A'}</p>
                      <div className="mt-4 pt-4 border-t border-gray-50">
                        <span className="text-[10px] font-bold text-green-500 uppercase">Verification Completed</span>
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {requests.length === 0 && (
          <div className="bg-white rounded-3xl shadow-sm px-6 py-20 text-center border-2 border-dashed border-gray-100">
            <p className="text-gray-400 font-bold">No approved students found in the records.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ExamDashboard;
