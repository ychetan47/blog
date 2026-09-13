import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, openAuthModal } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      openAuthModal('signin');
    }
  }, [loading, user, openAuthModal]);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center">
        <div className="font-editorial text-xl text-[#8A867E]">
          Opening the journal...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
