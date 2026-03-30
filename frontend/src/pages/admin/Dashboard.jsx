import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { Users, GraduationCap, Building2 } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ teachers: 0, students: 0, departments: 6 });

  useEffect(() => {
    Promise.all([
      api.get('/admin/teachers'),
      api.get('/admin/students'),
    ]).then(([t, s]) => {
      setStats(prev => ({ ...prev, teachers: t.data.length, students: s.data.length }));
    }).catch(() => {});
  }, []);

  const cards = [
    { label: 'Total Teachers', value: stats.teachers, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Students', value: stats.students, icon: GraduationCap, color: 'bg-green-500' },
    { label: 'Departments', value: stats.departments, icon: Building2, color: 'bg-purple-500' },
  ];

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
            <div className={`${card.color} text-white p-3 rounded-lg`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-3xl font-bold text-gray-800">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
