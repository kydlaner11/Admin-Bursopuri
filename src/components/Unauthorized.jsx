"use client";

import { useRouter } from 'next/navigation';
import { Icon } from "@iconify/react/dist/iconify.js";
import { useAuth } from '@/utils/auth';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <Icon icon="carbon:unauthorized" className="w-24 h-24 text-red-500 mb-6" />
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
      <p className="text-lg text-gray-600 max-w-md mb-8">
        You don't have permission to access this page. Please contact your administrator if you believe this is an error.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Go to Home
        </button>
        <button
          onClick={signOut}
          className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}