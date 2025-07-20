"use client";

import Link from "next/link";
import React from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/utils/auth';

const AccessDeniedLayer = () => {
  const router = useRouter();
  const { signOut, role } = useAuth();

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Error signing out:', error);
        // Still try to redirect even if there's an error
      }
      // Redirect to home page after sign out
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Contoh role, ganti sesuai implementasi auth Anda
  const userRole = role;
  // Fungsi untuk redirect sesuai role
  const handleRedirectByRole = () => {
    if (userRole === "admin") {
      router.push("/");
    } else if (userRole === "kepala_dapur") {
      router.push("/orders");
    } else {
      router.push("/"); // default
    }
  };

  return (
    <div className='custom-bg'>
      <div className='container container--xl'>
        <div className='d-flex align-items-center justify-content-between py-24'>
          <Link href='/' className='w-200-px'>
            <img src='/assets/images/bursopuri.png' alt='bursopuri' />
          </Link>
         <div className="d-flex align-items-center justify-content-between gap-16">
          <button 
              onClick={handleRedirectByRole}
              className='btn text-sm'
              style={{ borderColor: '#7C0000', color: '#7C0000' }}>
              {" "}
              Go To Home{" "}
            </button>
            <button 
              onClick={handleSignOut}
              className='btn text-sm'
              style={{ backgroundColor: '#7C0000', color: '#FFFFFF' }}>
              
              {" "}
              Sign Out{" "}
            </button>
         </div>
        </div>
        {/* <div class="py-res-120 text-center"> */}
        <div className='pt-48 pb-40 text-center'>
          <div className='max-w-500-px mx-auto'>
            <img src='assets/images/forbidden/access-denied.png' alt='' style={{ maxWidth: '300px', width: '100%', height: 'auto' }} />
          </div>
          <div className='max-w-700-px mx-auto mt-40'>
            <h4 className='mb-24 max-w-1000-px'>Access Denied</h4>
            <p className='text-neutral-500 max-w-700-px text-lg'>
              You don't have authorization to get to this page. If it's not too
              much trouble, contact your site executive to demand access.
            </p>
            <button
              onClick={handleRedirectByRole}
              className='btn  px-32 py-16 flex-shrink-0 d-inline-flex align-items-center justify-content-center gap-8 mt-28'
              style={{ backgroundColor: '#7C0000', color: '#FFFFFF' }}
            >
              <i className='ri-home-4-line' /> Go Back To Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedLayer;
