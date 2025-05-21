"use client";

import Link from "next/link";
import React from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/utils/auth';

const AccessDeniedLayer = () => {
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <div className='custom-bg'>
      <div className='container container--xl'>
        <div className='d-flex align-items-center justify-content-between py-24'>
          <Link href='/' className=''>
            <img src='/assets/images/bursopuri.png' alt='bursopuri' />
          </Link>
         <div className="d-flex align-items-center justify-content-between gap-16">
          <button 
              onClick={() => router.push('/')}
              className='btn btn-outline-primary-600 text-sm'>
              {" "}
              Go To Home{" "}
            </button>
            <button 
              onClick={signOut}
              className='btn btn-primary-600 text-sm'>
              {" "}
              Sign Out{" "}
            </button>
         </div>
        </div>
        {/* <div class="py-res-120 text-center"> */}
        <div className='pt-48 pb-40 text-center'>
          <div className='max-w-500-px mx-auto'>
            <img src='assets/images/forbidden/forbidden-img.png' alt='' />
          </div>
          <div className='max-w-700-px mx-auto mt-40'>
            <h3 className='mb-24 max-w-1000-px'>Access Denied</h3>
            <p className='text-neutral-500 max-w-700-px text-lg'>
              You don't have authorization to get to this page. If it's not too
              much trouble, contact your site executive to demand access.
            </p>
            <button
              onClick={() => router.back()}
              className='btn btn-primary-600 px-32 py-16 flex-shrink-0 d-inline-flex align-items-center justify-content-center gap-8 mt-28'
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
