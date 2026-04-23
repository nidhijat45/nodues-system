import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>;

  if (user) {
    // Redirect to respective dashboard if already logged in
    switch (user.role) {
      case 'admin': return <Navigate to="/admin" replace />;
      case 'teacher': return <Navigate to="/teacher" replace />; // HOD logic is usually handled within teacher role or specific routes
      case 'student': return <Navigate to="/student" replace />;
      case 'account': return <Navigate to="/account" replace />;
      case 'exam': return <Navigate to="/exam" replace />;
      default: return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default PublicRoute;
