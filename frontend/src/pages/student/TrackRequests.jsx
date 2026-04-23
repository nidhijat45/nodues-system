import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, RefreshCw, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  not_reached: 'bg-gray-100 text-gray-500',
  pending_teachers: 'bg-yellow-100 text-yellow-700',
  pending_account: 'bg-blue-100 text-blue-700',
  pending_hod: 'bg-purple-100 text-purple-700',
  pending_exam: 'bg-orange-100 text-orange-700',
  not_initiated: 'bg-gray-100 text-gray-500',
};

const StatusBadge = ({ status }) => (
  <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColors[status] || 'bg-gray-100 text-gray-600'}`}>
    {(status || 'N/A').replace(/_/g, ' ')}
  </span>
);

const StepIcon = ({ status }) => {
  if (status === 'approved') return <CheckCircle size={18} className="text-green-500" />;
  if (status === 'rejected') return <XCircle size={18} className="text-red-500" />;
  if (status === 'not_reached') return <Clock size={18} className="text-gray-300" />;
  return <Clock size={18} className="text-yellow-500" />;
};

const TrackRequests = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reapplying, setReapplying] = useState(false);

  const fetch = () => {
    setLoading(true);
    api.get('/student/nodues/requests')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleReapply = async () => {
    setReapplying(true);
    try {
      await api.post('/student/nodues/reapply');
      toast.success('Request re-submitted.');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally { setReapplying(false); }
  };

  const handleDownload = async () => {
    try {
      const res = await api.get('/student/nodues/certificate', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `nodues_certificate.pdf`;
      a.click();
      toast.success('Certificate downloaded!');
    } catch { toast.error('Download failed.'); }
  };

  if (loading) return <Layout><div className="text-center py-12 text-gray-400">Loading...</div></Layout>;

  if (!data || data.status === 'not_initiated') {
    return (
      <Layout>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Track Requests</h2>
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
          No request submitted yet. Go to No Dues Request tab to submit.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Clearance Status</h2>
          <p className="text-sm text-gray-500 mt-1">Track your no-dues progress across departments.</p>
        </div>
        <div className="flex gap-3">
          {data.overall_status === 'rejected' && (
            <button onClick={handleReapply} disabled={reapplying}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50">
              <RefreshCw size={15} /> {reapplying ? 'Re-submitting...' : 'Re-Apply'}
            </button>
          )}
          {data.overall_status === 'approved' && (
            <button onClick={handleDownload}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-green-100">
              <Download size={18} /> Download Certificate
            </button>
          )}
        </div>
      </div>

      {/* Clearance Certificate Table Card */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 mb-10">
          <div className="bg-gray-900 px-8 py-6 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold uppercase tracking-widest text-blue-400">Clearance Status Report</h3>
                <p className="text-[10px] text-gray-400 mt-1 uppercase font-black tracking-[0.2em]">Live Tracking Information</p>
              </div>
              <StatusBadge status={data.overall_status} />
          </div>
          
          <div className="p-8">
              {/* Header Info Section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10 pb-8 border-b border-dashed border-gray-200">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Student Name</p>
                  <p className="text-sm font-bold text-gray-800">{user?.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Enrollment No</p>
                  <p className="text-sm font-bold text-gray-800">{user?.enrollment_no}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contact No</p>
                  <p className="text-sm font-bold text-gray-800">{user?.mobile || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Account Fee Status</p>
                  <span className={`text-[10px] px-2 py-1 rounded-lg font-black uppercase ${data.account_status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {data.account_status}
                  </span>
                </div>
              </div>

              {/* Approval Table */}
              <div className="overflow-hidden rounded-2xl border border-gray-100 mb-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Faculty Name / Subject</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Approval Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.teacher_approvals?.map((t, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4">
                           <p className="font-bold text-gray-700">{t.teacher?.name}</p>
                           <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{t.subject || 'General Clearance'}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${t.status === 'approved' ? 'bg-green-100 text-green-700' : t.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${t.status === 'approved' ? 'bg-green-500' : t.status === 'rejected' ? 'bg-red-500' : 'bg-orange-500 animate-pulse'}`}></div>
                            {t.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* HOD Status Footer */}
              <div className="flex items-center justify-between bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-3">
                     <div className="bg-blue-600 text-white p-2 rounded-xl"><CheckCircle size={18} /></div>
                     <div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider">HOD Final Approval</p>
                        <p className="text-sm font-bold text-gray-800">{data.hod_approval?.hod?.name || 'Departmental Head'}</p>
                     </div>
                  </div>
                  <StatusBadge status={data.hod_approval?.status} />
              </div>
          </div>
      </div>
    </Layout>
  );
};

export default TrackRequests;
