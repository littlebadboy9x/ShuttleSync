"use client"

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = 'CUSTOMER' 
}) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Redirect to login if not authenticated
        router.push('/login');
        return;
      }

      if (requiredRole && user.role !== requiredRole) {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          router.push('/customer/dashboard');
        }
        return;
      }
    }
  }, [user, isLoading, router, requiredRole]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mb-8 mx-auto">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 animate-pulse">Đang kiểm tra xác thực...</h2>
          <p className="text-gray-600 animate-pulse">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user || (requiredRole && user.role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}; 