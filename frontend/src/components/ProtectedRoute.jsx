import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// This component protects routes that require authentication
const ProtectedRoute = ({ children }) => {

  // Get the current user and loading status from AuthContext
  const { user, loading } = useAuth();

  // If auth status is still loading, show a loading message
  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  // If user is authenticated, show the protected content
  // Otherwise, redirect to the login page
  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
