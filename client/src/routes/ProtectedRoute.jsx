/**
 * ProtectedRoute — Redirects unauthenticated users to /login
 * Shows full-page spinner while auth is being hydrated
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import DashboardLayout from '@components/layout/DashboardLayout';
import Skeleton from '@components/common/Skeleton';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <DashboardLayout title="PrepWise" subtitle="Loading your workspace…">
        <Skeleton.Dashboard />
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
