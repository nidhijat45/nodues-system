import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { Users, GraduationCap, Building2, Filter } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ teachers: 0, students: 0, departments: 0 });
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('all');

  useEffect(() => {
    api.get('/admin/departments')
      .then(res => {
        setDepartments(res.data);
        setStats(prev => ({ ...prev, departments: res.data.length }));
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    fetchStats();
  }, [selectedDept]);

  const fetchStats = () => {
    const params = selectedDept !== 'all' ? { department_id: selectedDept } : {};

    Promise.all([
      api.get('/admin/teachers', { params }),
      api.get('/admin/students', { params }),
    ]).then(([t, s]) => {
      setStats(prev => ({
        ...prev,
        teachers: t.data.length,
        students: s.data.length
      }));
    }).catch(() => { });
  };

  const cards = [
    { label: 'Total Teachers', value: stats.teachers, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Students', value: stats.students, icon: GraduationCap, color: 'bg-green-500' },
    { label: 'Departments', value: stats.departments, icon: Building2, color: 'bg-purple-500' },
  ];

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <Filter className="text-gray-500" size={18} />
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Departments</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>
              {dept.name} ({dept.code})
            </option>
          ))}
        </select>
      </div>

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
