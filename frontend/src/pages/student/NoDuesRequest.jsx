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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 font-bold text-gray-400 text-[11px] uppercase tracking-wider">
                  <th className="px-6 py-4">Faculty Name</th>
                  <th className="px-6 py-4">Assignment</th>
                  <th className="px-6 py-4">Lab Work</th>
                  <th className="px-6 py-4 text-right">No-Dues Request</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {teachers.map((t) => {
                  const existingReq = requests.find(r => r.teacher?.id === t.teacher_id);
                  
                  const getStatusBadgeSmall = (status, count) => {
                    if (status === 'Submitted') {
                      return (
                        <div className="flex items-center gap-2">
                           <span className="flex items-center gap-1 text-[11px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg border border-green-100">
                            <CheckCircle size={10} /> {status}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">{count}</span>
                        </div>
                      );
                    }
                    if (status === 'Not Submitted') {
                      return (
                        <div className="flex items-center gap-2">
                           <span className="flex items-center gap-1 text-[11px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">
                            <AlertCircle size={10} /> {status}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">{count}</span>
                        </div>
                      );
                    }
                    return <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">N/A</span>;
                  };

                  return (
                    <tr key={t.teacher_id} className={`hover:bg-blue-50/20 transition-colors ${existingReq ? 'bg-blue-50/10' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 p-2 rounded-xl text-gray-600">
                            <Users size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{t.name}</p>
                            <p className="text-[10px] text-gray-400 capitalize font-medium">{t.designation}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadgeSmall(t.assignment_status, t.assignment_count)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadgeSmall(t.lab_status, t.lab_count)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {existingReq ? (
                          <div className="flex flex-col items-end gap-1">
                            {getStatusBadge(existingReq.status)}
                            {existingReq.status === 'pending' && (
                              <button 
                                onClick={() => handleDelete(existingReq.id)}
                                className="text-[10px] text-red-500 hover:underline flex items-center gap-1"
                              >
                                <Trash2 size={10} /> Cancel
                              </button>
                            )}
                            {existingReq.comment && (
                               <div className="p-1.5 bg-red-50 border border-red-100 rounded-lg flex gap-1 mt-1 max-w-[200px]">
                                  <Info size={10} className="text-red-500 shrink-0 mt-0.5" />
                                  <p className="text-[9px] text-red-700 font-medium leading-tight">
                                    {existingReq.comment}
                                  </p>
                                </div>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRequest(t.teacher_id, t.name)}
                            disabled={!t.can_request || submitting === t.teacher_id}
                            className={`inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm ${
                              !t.can_request 
                              ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100' 
                              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow shadow-blue-200'
                            }`}
                          >
                            {submitting === t.teacher_id ? (
                              <div className="h-3 w-3 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                            ) : !t.can_request ? (
                              <>Pending Work</>
                            ) : (
                              <><Send size={12} /> Send Request</>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default NoDuesRequest;
