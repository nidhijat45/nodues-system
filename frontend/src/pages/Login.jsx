import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const roleRedirects = {
  admin: '/admin',
  teacher: '/teacher',
  student: '/student',
  account: '/account',
  exam: '/exam',
};

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // If already logged in
  useEffect(() => {
    if (user) {
      const path = roleRedirects[user.role] || '/login';
      navigate(path, { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome, ${res.data.user.name}!`);
      const role = res.data.user.role;
      // HOD is also a teacher but gets hod dashboard
      if (role === 'teacher' && res.data.user.is_hod) {
        navigate('/hod');
      } else {
        navigate(roleRedirects[role] || '/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left Side: Image & Branding */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: `url('https://d13loartjoc1yn.cloudfront.net/upload/institute/images/large/170406112121_CDGI_Image_Building.webp')` }}
        >
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[0.5px]"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-end p-16 text-white w-full">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 tracking-tighter">
              CDGI-Dues
            </h2>
            <p className="text-xl text-blue-50 font-medium leading-relaxed">
              Experience the evolution of student clearance. Faster, smarter, and fully digital.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-8 md:p-16 bg-gray-50/30">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="bg-white w-24 h-24 rounded-[2.25rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100 overflow-hidden">
              <img
                src="https://content.jdmagicbox.com/comp/indore/81/0731p731stdk002581/catalogue/chameli-devi-group-of-institutions-khandwa-road-indore-institutes-3gbf0rj.jpg"
                alt="Logo"
                className="w-20 h-20 object-contain mix-blend-multiply"
              />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h1>
            <p className="text-gray-500 mt-2 font-medium">Please enter your details to login</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-white border-2 border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                placeholder="eg: admin@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full bg-white border-2 border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl text-lg transition-all shadow-xl shadow-blue-200 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-gray-500 font-medium">
              New to the portal?{' '}
              <a href="/register" className="text-blue-600 hover:underline font-bold">Create Account</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
