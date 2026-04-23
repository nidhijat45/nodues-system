import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Bell, Users, Clock } from 'lucide-react';

const HODDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [rejectComment, setRejectComment] = useState('');
  const [rejectId, setRejectId] = useState(null);

  const fetch = async () => {
    try {
      const [rRes, sRes] = await Promise.all([
        api.get('/hod/requests'),
        api.get('/hod/reports')
      ]);
      setRequests(rRes.data);
      setStats(sRes.data.stats);
    } catch (err) {
      console.error(err);
    }
  };
  
  useEffect(() => { fetch(); }, []);

  const approve = async (requestId) => {
    try {
      await api.patch(`/hod/requests/${requestId}/approve`);
      toast.success('Request approved. Forwarded to exam department.');
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
  };

  const reject = async (requestId) => {
    try {
      await api.patch(`/hod/requests/${requestId}/reject`, { comment: rejectComment });
      toast.success('Request rejected.');
      setRejectId(null); setRejectComment(''); fetch();
    } catch { toast.error('Failed.'); }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">HOD Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Manage departmental approvals and monitor student progress.</p>
        </div>
        <div className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-200">
           HOD Panel
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
           <div className="bg-orange-50 text-orange-600 p-3 rounded-xl"><Bell size={24} /></div>
           <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pending Approvals</p>
              <p className="text-2xl font-black text-gray-800">{requests.length}</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
           <div className="bg-green-50 text-green-600 p-3 rounded-xl"><CheckCircle size={24} /></div>
           <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Completed</p>
              <p className="text-2xl font-black text-gray-800">{stats?.completed || 0}</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
           <div className="bg-blue-50 text-blue-600 p-3 rounded-xl"><Users size={24} /></div>
           <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Students</p>
              <p className="text-2xl font-black text-gray-800">{stats?.total || 0}</p>
           </div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
        <Clock size={18} className="text-gray-400" />
        Departmental No-Dues Approvals (HOD Signature)
      </h3>

      <div className="space-y-4">
        {requests.map(r => (
          <div key={r.approval_id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpanded(expanded === r.approval_id ? null : r.approval_id)}>
              <div>
                <p className="font-semibold text-gray-800">{r.student?.name}</p>
                <p className="text-xs text-gray-500">{r.student?.enrollment_no} • Sem {r.student?.semester} {r.student?.section} • {r.student?.department?.code}</p>
                <p className="text-xs text-gray-400 mt-0.5">Mobile: {r.student?.mobile || '-'}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right text-xs text-gray-500">
                  <p>Fee: <span className={r.fee_status === 'approved' ? 'text-green-600 font-medium' : 'text-red-500'}>{r.fee_status}</span></p>
                </div>
                {r.status === 'pending' && (
                  <>
                    <button onClick={e => { e.stopPropagation(); approve(r.request_id); }}
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
                      <CheckCircle size={13} /> Approve
                    </button>
                    <button onClick={e => { e.stopPropagation(); setRejectId(r.request_id); }}
                      className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
                      <XCircle size={13} /> Reject
                    </button>
                  </>
                )}
                {expanded === r.approval_id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </div>
            </div>

            {expanded === r.approval_id && (
              <div className="border-t px-5 py-4 bg-gray-50">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Teacher Approvals</p>
                <div className="space-y-1">
                  {r.teacher_approvals?.map((t, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{t.teacher?.name} <span className="text-gray-400 capitalize">({t.teacher?.designation})</span></span>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${t.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{t.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {requests.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm px-5 py-12 text-center text-gray-400">No pending requests.</div>
        )}
      </div>

      {rejectId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Reject Request</h3>
            <textarea value={rejectComment} onChange={e => setRejectComment(e.target.value)}
              placeholder="Reason for rejection (optional)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none h-24 mb-4" />
            <div className="flex gap-3">
              <button onClick={() => { setRejectId(null); setRejectComment(''); }}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={() => reject(rejectId)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium">Reject</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default HODDashboard;
