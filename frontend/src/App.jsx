import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';

// Auth & Public pages
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import PublicRoute from './routes/PublicRoute';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageTeachers from './pages/admin/ManageTeachers';
import ManageStudents from './pages/admin/ManageStudents';
import ManageStaff from './pages/admin/ManageStaff';
import AdminReports from './pages/admin/Reports';

// Teacher pages
import TeacherDashboard from './pages/teacher/Dashboard';
import Assignments from './pages/teacher/Assignments';
import LabManuals from './pages/teacher/LabManuals';
import StudentList from './pages/teacher/StudentList';
import TeacherRequests from './pages/teacher/Requests';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import MyAssignments from './pages/student/MyAssignments';
import MyLabManuals from './pages/student/MyLabManuals';
import NoDuesRequest from './pages/student/NoDuesRequest';
import TrackRequests from './pages/student/TrackRequests';

// Account pages
import AccountDashboard from './pages/account/Dashboard';
import AccountApproved from './pages/account/Approved';
import AccountFees from './pages/account/Fees';

// HOD page
import HODDashboard from './pages/hod/Dashboard';
import DepartmentReport from './pages/hod/DepartmentReport';

// Exam page
import ExamDashboard from './pages/exam/Dashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/teachers" element={<PrivateRoute roles={['admin']}><ManageTeachers /></PrivateRoute>} />
          <Route path="/admin/students" element={<PrivateRoute roles={['admin']}><ManageStudents /></PrivateRoute>} />
          <Route path="/admin/staff" element={<PrivateRoute roles={['admin']}><ManageStaff /></PrivateRoute>} />
          <Route path="/admin/reports" element={<PrivateRoute roles={['admin']}><AdminReports /></PrivateRoute>} />

          {/* Teacher */}
          <Route path="/teacher" element={<PrivateRoute roles={['teacher']}><TeacherDashboard /></PrivateRoute>} />
          <Route path="/teacher/assignments" element={<PrivateRoute roles={['teacher']}><Assignments /></PrivateRoute>} />
          <Route path="/teacher/lab-manuals" element={<PrivateRoute roles={['teacher']}><LabManuals /></PrivateRoute>} />
          <Route path="/teacher/students" element={<PrivateRoute roles={['teacher']}><StudentList /></PrivateRoute>} />
          <Route path="/teacher/requests" element={<PrivateRoute roles={['teacher']}><TeacherRequests /></PrivateRoute>} />

          {/* Student */}
          <Route path="/student" element={<PrivateRoute roles={['student']}><StudentDashboard /></PrivateRoute>} />
          <Route path="/student/assignments" element={<PrivateRoute roles={['student']}><MyAssignments /></PrivateRoute>} />
          <Route path="/student/lab-manuals" element={<PrivateRoute roles={['student']}><MyLabManuals /></PrivateRoute>} />
          <Route path="/student/nodues" element={<PrivateRoute roles={['student']}><NoDuesRequest /></PrivateRoute>} />
          <Route path="/student/track" element={<PrivateRoute roles={['student']}><TrackRequests /></PrivateRoute>} />

          {/* Account */}
          <Route path="/account" element={<PrivateRoute roles={['account']}><AccountDashboard /></PrivateRoute>} />
          <Route path="/account/pending" element={<PrivateRoute roles={['account']}><AccountDashboard /></PrivateRoute>} />
          <Route path="/account/approved" element={<PrivateRoute roles={['account']}><AccountApproved /></PrivateRoute>} />
          <Route path="/account/fees" element={<PrivateRoute roles={['account']}><AccountFees /></PrivateRoute>} />

          {/* HOD */}
          <Route path="/hod" element={<PrivateRoute roles={['teacher']}><HODDashboard /></PrivateRoute>} />
          <Route path="/hod/requests" element={<PrivateRoute roles={['teacher']}><HODDashboard /></PrivateRoute>} />
          <Route path="/hod/reports" element={<PrivateRoute roles={['teacher']}><DepartmentReport /></PrivateRoute>} />

          {/* Exam */}
          <Route path="/exam" element={<PrivateRoute roles={['exam']}><ExamDashboard /></PrivateRoute>} />
          <Route path="/exam/requests" element={<PrivateRoute roles={['exam']}><ExamDashboard /></PrivateRoute>} />

          {/* Fallback */}
          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
