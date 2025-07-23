import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

interface RouteGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function RouteGuard({ children, requireAuth = true }: RouteGuardProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Don't render anything while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If auth is required but user is not logged in, redirect to home
  if (requireAuth && !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If user is logged in and trying to access home/login pages, redirect to dashboard
  if (!requireAuth && user && (location.pathname === '/' || location.pathname === '/login')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}