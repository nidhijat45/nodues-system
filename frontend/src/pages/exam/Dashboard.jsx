import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle, Download, ChevronDown, ChevronUp } from 'lucide-react';

const ExamDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const fetch = () => api.get('/exam/requests').then(r => setRequests(r.data)).catch(() => {});
  useEffect(() => { fetch(); }, []);

  const approve = async (requestId) => {
    try {
      await api.patch(`/exam/requests/${requestId}/approve`);
      toast.success('Final approval done. Student can now download certificate.');
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
  };

  const downloadCert = async (requestId, enrollNo) => {
    try {
      const res = await api.get(`/exam/requests/${requestId}/certificate`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `nodues_${enrollNo}.pdf`;
      a.click();
      toast.success('Certificate downloaded.');
      fetch();
    } catch { toast.error('Download failed.'); }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Exam Department — Final Approvals</h2>

      <div className="space-y-4">
        {requests.map(r => (
          <div key={r.approval_id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpanded(expanded === r.approval_id ? null : r.approval_id)}>
              <div>
                <p className="font-semibold text-gray-800">{r.student?.name}</p>
                <p className="text-xs text-gray-500">{r.student?.enrollment_no} • Sem {r.student?.semester} {r.student?.section} • {r.student?.department?.code}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right text-xs space-y-0.5">
                  <p>Fee: <span className={r.fee_status === 'approved' ? 'text-green-600' : 'text-yellow-600'}>{r.fee_status}</span></p>
                  <p>HOD: <span className={r.hod_status === 'approved' ? 'text-green-600' : 'text-yellow-600'}>{r.hod_status}</span></p>
                </div>
                {r.status === 'pending' && (
                  <button onClick={e => { e.stopPropagation(); approve(r.request_id); }}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
                    <CheckCircle size={13} /> Final Approve
                  </button>
                )}
                {r.status === 'approved' && (
                  <button onClick={e => { e.stopPropagation(); downloadCert(r.request_id, r.student?.enrollment_no); }}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
                    <Download size={13} /> Certificate
                  </button>
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
                      <span className="text-gray-600">{t.teacher?.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${t.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{t.status}</span>
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
    </Layout>
  );
};

export default ExamDashboard;
