// "use client";

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '../utils/auth';

// const ProtectedRoute = ({ children, allowedRoles = [] }) => {
//   const { user, role, loading } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     // If not loading and no user, redirect to sign-in
//     if (!loading && !user) {
//       router.push('/sign-in');
//     }
    
//     // If user exists but role is not allowed, redirect to unauthorized page
//     // Only check if allowedRoles is not empty
//     if (!loading && !user && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
//       router.push('/access-denied');
//     }
//   }, [user, role, loading, router, allowedRoles]);

//   // Show loading while checking authentication
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
//       </div>
//     );
//   }

//   // If no user or role not allowed, don't render children
//   if (!user || (allowedRoles.length > 0 && !allowedRoles.includes(role))) {
//     return null;
//   }

//   // Render children if authenticated and authorized
//   return <>{children}</>;
// };

// export default ProtectedRoute;