import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [rejectComment, setRejectComment] = useState('');
  const [rejectId, setRejectId] = useState(null);

  const fetch = () => api.get('/teacher/requests').then(r => setRequests(r.data)).catch(() => {});
  useEffect(() => { fetch(); }, []);

  const approve = async (requestId) => {
    try {
      await api.patch(`/teacher/requests/${requestId}/approve`);
      toast.success('Request approved.');
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
  };

  const reject = async (requestId) => {
    try {
      await api.patch(`/teacher/requests/${requestId}/reject`, { comment: rejectComment });
      toast.success('Request rejected.');
      setRejectId(null); setRejectComment(''); fetch();
    } catch { toast.error('Failed.'); }
  };

  const statusBadge = (s) => {
    const map = { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${map[s] || 'bg-gray-100 text-gray-600'}`}>{s}</span>;
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">No Dues Requests</h2>

      <div className="space-y-4">
        {requests.map(r => (
          <div key={r.approval_id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpanded(expanded === r.approval_id ? null : r.approval_id)}>
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-semibold text-gray-800">{r.student?.name}</p>
                  <p className="text-xs text-gray-500">{r.student?.enrollment_no} • Sem {r.student?.semester} {r.student?.section} • {r.student?.department?.code}</p>
                </div>
                {statusBadge(r.status)}
              </div>
              <div className="flex items-center gap-3">
                {r.status === 'pending' && (
                  <>
                    <button onClick={e => { e.stopPropagation(); approve(r.approval_id); }}
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
                      <CheckCircle size={13} /> Approve
                    </button>
                    <button onClick={e => { e.stopPropagation(); setRejectId(r.approval_id); }}
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
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Assignments</p>
                    {r.assignments?.length === 0 && <p className="text-sm text-gray-400">No assignments.</p>}
                    {r.assignments?.map((a, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="text-sm text-gray-700">{a.assignment_name}</p>
                          <p className="text-xs text-gray-400">{a.subject_name} • Due: {a.due_date}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${a.is_submitted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {a.is_submitted ? 'Submitted' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Lab Manuals</p>
                    {r.lab_manuals?.length === 0 && <p className="text-sm text-gray-400">No lab manuals.</p>}
                    {r.lab_manuals?.map((lm, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                        <p className="text-sm text-gray-700">{lm.subject_name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${lm.is_submitted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {lm.is_submitted ? 'Submitted' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {requests.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm px-5 py-12 text-center text-gray-400">No requests found.</div>
        )}
      </div>

      {/* Reject modal */}
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
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">Reject</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Requests;
