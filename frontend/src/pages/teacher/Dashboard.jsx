import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, FlaskConical, Bell, CheckCircle } from 'lucide-react';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ active: 0, expired: 0, labManuals: 0, pendingRequests: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/teacher/assignments'),
      api.get('/teacher/lab-manuals'),
      api.get('/teacher/requests'),
    ]).then(([a, lm, r]) => {
      setStats({
        active: a.data.active?.length || 0,
        expired: a.data.expired?.length || 0,
        labManuals: lm.data.length || 0,
        pendingRequests: r.data.filter(x => x.status === 'pending').length || 0,
      });
    }).catch(() => {});
  }, []);

  const cards = [
    { label: 'Active Assignments', value: stats.active, icon: BookOpen, color: 'bg-blue-500' },
    { label: 'Expired Assignments', value: stats.expired, icon: CheckCircle, color: 'bg-gray-500' },
    { label: 'Lab Manuals', value: stats.labManuals, icon: FlaskConical, color: 'bg-green-500' },
    { label: 'Pending Requests', value: stats.pendingRequests, icon: Bell, color: 'bg-orange-500' },
  ];

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Welcome, {user?.name}</h2>
        <p className="text-gray-500 text-sm mt-1">Manage your assignments and student requests</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
            <div className={`${card.color} text-white p-3 rounded-lg`}>
              <card.icon size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className="text-3xl font-bold text-gray-800">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default TeacherDashboard;
