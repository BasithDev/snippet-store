import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

/**
 * A layout wrapper for protected routes
 * Includes the Header and authentication check
 */
function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[var(--bg-primary)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Redirect to home if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  
  // Render the layout with header and outlet for nested routes
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

export default ProtectedLayout;
