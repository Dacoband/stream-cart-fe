"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!token && !refreshToken) {
        router.push('/authentication/login');
        return;
      }
      
      if (!token && refreshToken) {
        import('@/services/api/auth/authentication').then(({ getMe }) => {
          getMe().catch(() => {
            router.push('/authentication/login');
          });
        });
      }
    };

    checkAuth();
  }, [router]);

  return <>{children}</>;
}
