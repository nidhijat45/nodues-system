import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', mobile: '',
    enrollment_no: '', department_id: '', semester: '', section: '', year: ''
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Reset form on mount
    setForm({
      name: '', email: '', password: '', mobile: '',
      enrollment_no: '', department_id: '', semester: '', section: '', year: ''
    });
    api.get('/admin/departments').then(res => setDepartments(res.data)).catch(() => { });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!form.mobile || !mobileRegex.test(form.mobile)) {
      return toast.error('Mobile number must be exactly 10 digits and start with 6, 7, 8, or 9.');
    }

    const trimmedName = form.name.trim();
    if (trimmedName.split(' ').filter(Boolean).length < 2) {
      return toast.error('Please enter your full name (including surname).');
    }

    const enrollRegex = /^0832[A-Za-z]{2}\d{6}$/;
    if (!enrollRegex.test(form.enrollment_no)) {
      return toast.error('Enrollment number must start with 0832, followed by 2 letters and 6 digits.');
    }

    const dept = departments.find(d => String(d.id) === String(form.department_id));
    if (dept) {
      const enrollBranch = form.enrollment_no.substring(4, 6).toUpperCase();
      const deptPrefix = dept.code.substring(0, 2).toUpperCase();
      if (enrollBranch !== deptPrefix) {
        return toast.error(`Enrollment branch (${enrollBranch}) does not match department prefix (${deptPrefix}).`);
      }
    }

    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@$!%*?&])[A-Za-z\d#@$!%*?&]{8,}$/;
    if (!passRegex.test(form.password)) {
      return toast.error('Password must be 8+ chars, have 1 uppercase, 1 lowercase, 1 number, and 1 symbol (including #).');
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      toast.success(res.data.message || 'Registration successful! Wait for admin approval.', { duration: 6000 });
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

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
              Join CDGI-Dues
            </h2>
            <p className="text-xl text-blue-50 font-medium leading-relaxed">
              Register now to start your digital clearance journey. Fast, transparent, and built for success.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Register Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-6 md:p-12 bg-gray-50/30 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="text-center mb-8">
            <div className="bg-white w-20 h-20 rounded-[1.75rem] flex items-center justify-center mx-auto mb-5 shadow-sm border border-gray-100 overflow-hidden">
              <img 
                src="https://content.jdmagicbox.com/comp/indore/81/0731p731stdk002581/catalogue/chameli-devi-group-of-institutions-khandwa-road-indore-institutes-3gbf0rj.jpg" 
                alt="Logo" 
                className="w-16 h-16 object-contain mix-blend-multiply"
              />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Create Account</h1>
            <p className="text-gray-500 mt-1 font-medium">Step into the digital future of CDGI</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                <input required value={form.name} onChange={e => set('name', e.target.value)}
                  className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all"
                  placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Enrollment</label>
                <input required value={form.enrollment_no} onChange={e => set('enrollment_no', e.target.value)}
                  className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all"
                  placeholder="0832CS..." />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Official Email</label>
              <input required type="email" value={form.email} onChange={e => set('email', e.target.value)}
                className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all"
                placeholder="you@gmail.com" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                <input required type="password" value={form.password} onChange={e => set('password', e.target.value)}
                  className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all"
                  placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Mobile No</label>
                <input required value={form.mobile} onChange={e => set('mobile', e.target.value)}
                  className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all"
                  placeholder="91..." />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Department</label>
              <select required value={form.department_id} onChange={e => set('department_id', e.target.value)}
                className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer">
                <option value="">Select Department</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Semester</label>
                <select required value={form.semester} onChange={e => set('semester', e.target.value)}
                  className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer">
                  <option value="">Sem</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Section</label>
                <select required value={form.section} onChange={e => set('section', e.target.value)}
                  className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer">
                  <option value="">Sec</option>
                  {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Year</label>
                <select required value={form.year} onChange={e => set('year', e.target.value)}
                  className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer">
                  <option value="">Year</option>
                  {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl text-lg transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50 mt-4 leading-none">
              {loading ? 'Processing...' : 'Complete Registration'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 font-medium">
              Already registered?{' '}
              <a href="/login" className="text-blue-600 hover:underline font-bold">Sign In here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
