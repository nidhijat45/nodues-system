// Student Dashboard
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, FlaskConical, ClipboardList, AlertCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/student/dashboard').then(r => setData(r.data)).catch(() => {});
  }, []);

  const statusColors = {
    not_initiated: 'bg-gray-100 text-gray-600',
    pending_teachers: 'bg-yellow-100 text-yellow-700',
    pending_account: 'bg-blue-100 text-blue-700',
    pending_hod: 'bg-purple-100 text-purple-700',
    pending_exam: 'bg-orange-100 text-orange-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Welcome, {user?.name}</h2>
        <p className="text-gray-500 text-sm mt-1">{user?.enrollment_no} • Sem {user?.semester} {user?.section}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
          <div className="bg-blue-500 text-white p-3 rounded-lg"><ClipboardList size={22} /></div>
          <div>
            <p className="text-xs text-gray-500">No Dues Status</p>
            <span className={`text-sm px-2 py-0.5 rounded font-medium capitalize ${statusColors[data?.nodues_status] || 'bg-gray-100 text-gray-600'}`}>
              {(data?.nodues_status || 'Not Initiated').replace(/_/g, ' ')}
            </span>
          </div>
        </div>
        <button 
          onClick={() => navigate('/student/nodues')}
          className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-5 hover:shadow-xl transition-all text-left border-2 border-transparent hover:border-blue-100 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <FileText size={80} />
          </div>
          <div className="bg-blue-600 text-white p-4 rounded-2xl group-hover:scale-110 transition-transform shadow-lg shadow-blue-200"><FileText size={28} /></div>
          <div>
            <p className="text-lg font-black text-gray-800 leading-tight">No-Dues Form</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">Clearance Requests & Status</p>
          </div>
        </button>
      </div>

      {data?.student && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Your Profile Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
            {[
              ['Name', data.student.name],
              ['Email', data.student.email],
              ['Mobile', data.student.mobile || '-'],
              ['Enrollment No', data.student.enrollment_no],
              ['Department', data.student.department?.name],
              ['Semester', data.student.semester],
              ['Section', data.student.section],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-gray-700 font-bold">{val}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default StudentDashboard;
