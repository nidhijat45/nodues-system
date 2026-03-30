import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Users, BookOpen, FlaskConical,
  ClipboardList, FileText, LogOut, Bell, GraduationCap, Key, X, DollarSign,
  UserCog, BarChart
} from 'lucide-react';

const menuItems = {
  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { label: 'Teachers', icon: Users, path: '/admin/teachers' },
    { label: 'Students', icon: GraduationCap, path: '/admin/students' },
    { label: 'Support Staff', icon: UserCog, path: '/admin/staff' },
    { label: 'Reports', icon: BarChart, path: '/admin/reports' },
  ],
  teacher: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/teacher' },
    { label: 'Assignments', icon: BookOpen, path: '/teacher/assignments' },
    { label: 'Lab Manuals', icon: FlaskConical, path: '/teacher/lab-manuals' },
    { label: 'Students', icon: Users, path: '/teacher/students' },
    { label: 'No Dues Requests', icon: Bell, path: '/teacher/requests' },
  ],
  student: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/student' },
    { label: 'Assignments', icon: BookOpen, path: '/student/assignments' },
    { label: 'Lab Manuals', icon: FlaskConical, path: '/student/lab-manuals' },
    { label: 'No Dues Request', icon: ClipboardList, path: '/student/nodues' },
    { label: 'Track Requests', icon: FileText, path: '/student/track' },
  ],
  account: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/account' },
    { label: 'Pending Requests', icon: Bell, path: '/account/pending' },
    { label: 'Approved', icon: ClipboardList, path: '/account/approved' },
    { label: 'Student Fees', icon: DollarSign, path: '/account/fees' },
  ],
  hod: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/hod' },
    { label: 'No Dues Requests', icon: Bell, path: '/hod/requests' },
  ],
  exam: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/exam' },
    { label: 'Requests', icon: Bell, path: '/exam/requests' },
  ],
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const roleKey = user?.role === 'teacher' && user?.is_hod ? 'hod' : user?.role;
  const items = menuItems[roleKey] || [];

  const [showPassModal, setShowPassModal] = useState(false);
  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '' });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePassChange = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/change-password', passForm);
      toast.success('Password changed successfully.');
      setShowPassModal(false);
      setPassForm({ oldPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    }
  };

  return (
    <div className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">NoDues System</h1>
        <p className="text-xs text-gray-400 mt-1 capitalize">{user?.role} Panel</p>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-white truncate w-36">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path.split('/').length === 2}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700 flex flex-col gap-2">
        {user?.role !== 'admin' && (
          <button onClick={() => setShowPassModal(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors w-full"
          >
            <Key size={18} /> Change Password
          </button>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-red-600 hover:text-white transition-colors w-full"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Modal */}
      {showPassModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Change Password</h3>
              <button onClick={() => setShowPassModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handlePassChange} className="space-y-4">
              <input required type="password" value={passForm.oldPassword} onChange={e => setPassForm({...passForm, oldPassword: e.target.value})} placeholder="Old Password"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input required type="password" value={passForm.newPassword} onChange={e => setPassForm({...passForm, newPassword: e.target.value})} placeholder="New Password"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                Change Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
