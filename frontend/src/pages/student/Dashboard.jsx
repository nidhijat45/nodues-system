// Student Dashboard
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, FlaskConical, ClipboardList, AlertCircle } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
          <div className="bg-orange-500 text-white p-3 rounded-lg"><AlertCircle size={22} /></div>
          <div>
            <p className="text-xs text-gray-500">Pending Assignments</p>
            <p className="text-3xl font-bold text-gray-800">{data?.pending_assignments || 0}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
          <div className="bg-blue-500 text-white p-3 rounded-lg"><ClipboardList size={22} /></div>
          <div>
            <p className="text-xs text-gray-500">No Dues Status</p>
            <span className={`text-sm px-2 py-0.5 rounded font-medium capitalize ${statusColors[data?.nodues_status] || 'bg-gray-100 text-gray-600'}`}>
              {(data?.nodues_status || 'Not Initiated').replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      {data?.student && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Your Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {[
              ['Name', data.student.name],
              ['Email', data.student.email],
              ['Mobile', data.student.mobile || '-'],
              ['Enrollment No', data.student.enrollment_no],
              ['Department', data.student.department?.name],
              ['Semester', data.student.semester],
              ['Section', data.student.section],
              ['Year', data.student.year],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="text-gray-700 font-medium">{val}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default StudentDashboard;
