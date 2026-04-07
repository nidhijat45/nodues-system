import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, RefreshCw, Download } from 'lucide-react';

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
      const res = await api.get(`/exam/requests/${data.request_id}/certificate`, { responseType: 'blob' });
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

  const steps = [
    { label: 'Teachers', status: data.teacher_approvals?.every(t => t.status === 'approved') ? 'approved' : data.teacher_approvals?.some(t => t.status === 'rejected') ? 'rejected' : 'pending' },
    { label: 'Account Dept', status: data.account_status },
    { label: 'HOD', status: data.hod_approval?.status || 'not_reached' },
    { label: 'Exam Dept', status: data.exam_status },
  ];

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Track Requests</h2>
        <div className="flex gap-3">
          {data.overall_status === 'rejected' && (
            <button onClick={handleReapply} disabled={reapplying}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50">
              <RefreshCw size={15} /> {reapplying ? 'Re-submitting...' : 'Re-Apply'}
            </button>
          )}
          {data.certificate_ready && (
            <button onClick={handleDownload}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              <Download size={15} /> Download Certificate
            </button>
          )}
        </div>
      </div>

      {/* Overall status */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Overall Status</p>
          <StatusBadge status={data.overall_status} />
        </div>
        <p className="text-xs text-gray-400">Initiated: {new Date(data.initiated_at).toLocaleDateString()}</p>
      </div>

      {/* Progress steps */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="font-semibold text-gray-700 mb-4">Approval Progress</h3>
        <div className="flex items-center gap-0">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <StepIcon status={step.status} />
                <p className="text-xs text-gray-500 mt-1 text-center">{step.label}</p>
                <StatusBadge status={step.status} />
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 ${step.status === 'approved' ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Teacher approvals detail */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <h3 className="font-semibold text-gray-700 mb-3">Teacher Approvals</h3>
        <div className="space-y-4">
          {data.teacher_approvals?.map((t, i) => (
            <div key={i} className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-2 rounded-lg transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold text-gray-800">{t.subject || 'General No Dues'}</p>
                  {t.document_url && (
                    <a
                      href={`${api.defaults.baseURL}${t.document_url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-[10px] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100"
                    >
                      <Download size={10} /> View Doc
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <p className="font-medium">{t.teacher?.name}</p>
                  <span className="text-gray-300">•</span>
                  <p className="capitalize">{t.teacher?.designation}</p>
                </div>
              </div>
              <div className="text-right ml-4">
                <StatusBadge status={t.status} />
                <p className="text-[10px] text-gray-400 mt-1">
                  {t.reviewed_at ? new Date(t.reviewed_at).toLocaleDateString() : 'Pending'}
                </p>
                {t.comment && <p className="text-xs text-red-500 mt-1 italic">"{t.comment}"</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HOD detail */}
      {data.hod_approval?.status !== 'not_reached' && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h3 className="font-semibold text-gray-700 mb-3">HOD Approval</h3>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">{data.hod_approval?.hod?.name || 'HOD'}</p>
            <div className="text-right">
              <StatusBadge status={data.hod_approval?.status} />
              {data.hod_approval?.comment && <p className="text-xs text-red-500 mt-1">{data.hod_approval.comment}</p>}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default TrackRequests;
