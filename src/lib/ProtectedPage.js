"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/utils/auth';

const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/sign-in',
  unauthorizedRedirect = '/access-denied',
  showLoading = true 
}) => {
  const { user, role, loading, initializing } = useAuth();
  const router = useRouter();
  const [hasCheckedAccess, setHasCheckedAccess] = useState(false);

  useEffect(() => {
    // Don't do anything while still initializing
    if (initializing || loading) {
      return;
    }

    // If no user, redirect to sign-in
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // If user exists but no role (profile not loaded), wait a bit
    if (user && role === null) {
      // Don't redirect immediately, give it some time to load the profile
      const timeout = setTimeout(() => {
        setHasCheckedAccess(true);
      }, 2000); // Wait 2 seconds for profile to load

      return () => clearTimeout(timeout);
    }

    // If user exists and role is loaded
    if (user && role !== null) {
      // Check if role is allowed (only if allowedRoles is specified)
      if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        router.push(unauthorizedRedirect);
        return;
      }
      
      setHasCheckedAccess(true);
    }
  }, [user, role, loading, initializing, router, allowedRoles, redirectTo, unauthorizedRedirect]);

  // Show loading during initialization or while checking access
  if (initializing || loading || !hasCheckedAccess) {
    if (!showLoading) return null;
    
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Checking access...</p>
        </div>
      </div>
    );
  }

  // If no user, don't render (will redirect)
  if (!user) {
    return null;
  }

  // If role checking is required and user doesn't have required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return null;
  }

  // If user has no role and we've waited long enough, show error
  if (user && role === null && hasCheckedAccess) {
    return (
      <div className="d-flex align-items-center justify-content-center flex-column" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="alert alert-warning">
            <h5>Profile Loading Error</h5>
            <p>There was an issue loading your profile. Please try refreshing the page or contact support.</p>
            <button 
              className="btn btn-primary" 
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render children if all checks pass
  return <>{children}</>;
};

export default ProtectedRoute;