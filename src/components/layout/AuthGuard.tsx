/**
 * AuthGuard — route protection component.
 * Redirects unauthenticated users to /welcome.
 * Wraps all protected routes via React Router's Outlet pattern.
 */
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function AuthGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }

  return <Outlet />;
}
