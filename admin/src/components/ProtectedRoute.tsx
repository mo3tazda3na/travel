import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const { token, user } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="page">
        <div className="card">
          <h1>Access denied</h1>
          <p>You must be an administrator to use this panel.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
