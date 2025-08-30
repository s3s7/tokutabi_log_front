'use client';

import { useSession } from 'next-auth/react';

export const useAuth = () => {
  const { data: session, status } = useSession();

  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const isAdmin = session?.user?.role === 2; // 2: admin

  return {
    session,
    status,
    isAuthenticated,
    isLoading,
    isAdmin,
    user: session?.user
  };
};

export const useAdminGuard = () => {
  const { isAdmin, isAuthenticated, isLoading } = useAuth();

  return {
    isAuthorized: isAuthenticated && isAdmin,
    isLoading,
    canAccess: isAuthenticated && isAdmin
  };
};