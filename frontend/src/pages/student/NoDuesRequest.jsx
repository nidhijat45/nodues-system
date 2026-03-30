import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Send } from 'lucide-react';

const NoDuesRequest = () => {
  const [teachers, setTeachers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.get('/student/nodues/teachers').then(r => setTeachers(r.data)).catch(() => {});
    api.get('/student/nodues/requests').then(r => {
      if (r.data.overall_status && r.data.overall_status !== 'not_initiated') setSubmitted(true);
    }).catch(() => {});
  }, []);

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const canSubmit = selected.every(id => {
    const t = teachers.find(t => t.teacher_id === id);
    return t?.can_request;
  }) && selected.length > 0;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/student/nodues/submit', { teacher_ids: selected });
      toast.success('No dues request submitted!');
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit.');
    } finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <Layout>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">No Dues Request</h2>
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-green-800">Request Submitted!</h3>
          <p className="text-green-600 text-sm mt-1">Track your request status in the Track Requests tab.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">No Dues Request</h2>
      <p className="text-gray-500 text-sm mb-6">Select teachers to send no dues approval request. All assignments must be submitted first.</p>

      <div className="space-y-4 mb-6">
        {teachers.map(t => (
          <div key={t.teacher_id}
            className={`bg-white rounded-xl shadow-sm p-5 border-2 transition-colors ${selected.includes(t.teacher_id) ? 'border-blue-500' : 'border-transparent'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={selected.includes(t.teacher_id)}
                  onChange={() => toggleSelect(t.teacher_id)}
                  className="w-4 h-4 accent-blue-600" />
                <div>
                  <p className="font-semibold text-gray-800">{t.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{t.designation} {t.is_hod ? '• HOD' : ''}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${t.can_request ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {t.can_request ? 'All Clear' : 'Pending Items'}
              </span>
            </div>

            {/* Assignments */}
            {t.assignments.length > 0 && (
              <div className="ml-7">
                <p className="text-xs text-gray-400 mb-1">Assignments</p>
                <div className="space-y-1">
                  {t.assignments.map(a => (
                    <div key={a.id} className="flex items-center justify-between text-sm py-1 border-b border-gray-50">
                      <span className="text-gray-600">{a.assignment_name} <span className="text-gray-400">({a.subject_name})</span></span>
                      {a.is_submitted
                        ? <CheckCircle size={14} className="text-green-500" />
                        : <XCircle size={14} className="text-red-400" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lab Manuals */}
            {t.lab_manuals.length > 0 && (
              <div className="ml-7 mt-2">
                <p className="text-xs text-gray-400 mb-1">Lab Manuals</p>
                <div className="space-y-1">
                  {t.lab_manuals.map(lm => (
                    <div key={lm.id} className="flex items-center justify-between text-sm py-1 border-b border-gray-50">
                      <span className="text-gray-600">{lm.subject_name}</span>
                      {lm.is_submitted
                        ? <CheckCircle size={14} className="text-green-500" />
                        : <XCircle size={14} className="text-red-400" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={handleSubmit} disabled={!canSubmit || loading}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        <Send size={16} />
        {loading ? 'Submitting...' : `Submit Request to ${selected.length} Teacher${selected.length !== 1 ? 's' : ''}`}
      </button>
      {!canSubmit && selected.length > 0 && (
        <p className="text-red-500 text-xs mt-2">Some selected teachers have pending assignments. Please complete them first.</p>
      )}
    </Layout>
  );
};

export default NoDuesRequest;
