import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Send, FileText, Clock, Trash2, AlertCircle, Info, Users, UserCheck } from 'lucide-react';

const NoDuesRequest = () => {
  const [teachers, setTeachers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(null); // ID of teacher being requested

  const fetchData = async () => {
    setFetching(true);
    try {
      const [tRes, rRes] = await Promise.all([
        api.get('/student/nodues/teachers'),
        api.get('/student/nodues/requests')
      ]);
      setTeachers(tRes.data);
      if (rRes.data && rRes.data.teacher_approvals) {
        setRequests(rRes.data.teacher_approvals);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch data');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequest = async (teacherId, teacherName) => {
    setSubmitting(teacherId);
    try {
      await api.post('/student/nodues/submit', {
        teacher_id: teacherId,
        subject: `No Dues Request - ${teacherName}`
      });
      toast.success(`Request sent to ${teacherName}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit.');
    } finally {
      setSubmitting(null);
    }
  };

  const handleDelete = async (approvalId) => {
    if (!window.confirm('Are you sure you want to delete this pending request?')) return;
    try {
      await api.delete(`/student/nodues/requests/${approvalId}`);
      toast.success('Request removed.');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete request.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} className="text-green-500" />;
      case 'rejected': return <XCircle size={16} className="text-red-500" />;
      default: return <Clock size={16} className="text-yellow-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700'
    };
    return (
      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize ${styles[status]}`}>
        {getStatusIcon(status)}
        {status}
      </span>
    );
  };

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">No Dues Request</h2>
        <p className="text-gray-500 text-sm">Send no-dues clearance requests to your department teachers once your submissions are complete.</p>
      </div>

      {fetching ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="text-gray-400 font-medium">Checking your submission status...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {teachers.map((t) => {
            const existingReq = requests.find(r => r.teacher?.id === t.teacher_id);
            const isAssignmentsPending = t.submitted_assignments < t.total_assignments;
            const isLabsPending = t.submitted_labs < t.total_labs;
            const isPending = isAssignmentsPending || isLabsPending;

            return (
              <div key={t.teacher_id} className={`bg-white rounded-2xl shadow-sm border p-6 transition-all ${existingReq ? 'border-blue-100 bg-blue-50/10' : 'border-gray-100 hover:shadow-md'}`}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-xl text-gray-600">
                      <Users size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">{t.name}</h4>
                      <p className="text-sm text-gray-500 capitalize">{t.designation}</p>
                    </div>
                  </div>
                  {existingReq ? (
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(existingReq.status)}
                      {existingReq.status === 'pending' && (
                        <button 
                          onClick={() => handleDelete(existingReq.id)}
                          className="text-xs text-red-500 hover:underline flex items-center gap-1"
                        >
                          <Trash2 size={12} /> Cancel Request
                        </button>
                      )}
                    </div>
                  ) : isPending ? (
                    <div className="flex flex-col items-end gap-1">
                      <span className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg">
                        <AlertCircle size={12} /> Submissions Pending
                      </span>
                    </div>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                      <UserCheck size={12} /> Ready to Request
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className={`p-3 rounded-xl border ${isAssignmentsPending ? 'bg-red-50/50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Assignments</p>
                    <div className="flex items-end justify-between">
                      <p className={`text-xl font-black ${isAssignmentsPending ? 'text-red-600' : 'text-gray-700'}`}>
                        {t.submitted_assignments}<span className="text-sm text-gray-400 font-normal">/{t.total_assignments}</span>
                      </p>
                      {t.total_assignments > 0 && !isAssignmentsPending && <CheckCircle size={18} className="text-green-500 mb-1" />}
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl border ${isLabsPending ? 'bg-red-50/50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Lab Manuals</p>
                    <div className="flex items-end justify-between">
                      <p className={`text-xl font-black ${isLabsPending ? 'text-red-600' : 'text-gray-700'}`}>
                        {t.submitted_labs}<span className="text-sm text-gray-400 font-normal">/{t.total_labs}</span>
                      </p>
                      {t.total_labs > 0 && !isLabsPending && <CheckCircle size={18} className="text-green-500 mb-1" />}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!existingReq && (
                    <button
                      onClick={() => handleRequest(t.teacher_id, t.name)}
                      disabled={isPending || submitting === t.teacher_id}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                        isPending 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-95'
                      }`}
                    >
                      {submitting === t.teacher_id ? (
                        <div className="h-5 w-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                      ) : isPending ? (
                        <>Complete Pending Work</>
                      ) : (
                        <><Send size={18} /> Request No Dues</>
                      )}
                    </button>
                  )}
                  {existingReq && existingReq.comment && (
                    <div className="flex-1 p-3 bg-red-50 border border-red-100 rounded-xl flex gap-2">
                      <Info size={16} className="text-red-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700 font-medium">
                        <span className="font-bold">Remark:</span> {existingReq.comment}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
};

export default NoDuesRequest;
