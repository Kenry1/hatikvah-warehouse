import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types/auth';

export function useNavigation() {
  const navigate = useNavigate();

  const navigateToPage = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const navigateToDashboard = useCallback((role?: UserRole) => {
    // Always navigate to /dashboard which will show the appropriate dashboard for the role
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  const navigateWithReplace = useCallback((path: string) => {
    navigate(path, { replace: true });
  }, [navigate]);

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return {
    navigateToPage,
    navigateToDashboard,
    navigateWithReplace,
    goBack
  };
}