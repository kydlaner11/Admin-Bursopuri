'use client';

import { useState } from 'react';
// import { useRouter } from 'next/navigation';
import Link from 'next/link';
// import { useAuth } from '@/utils/auth';
import { Icon } from '@iconify/react/dist/iconify.js';

const SignInLayer = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // const router = useRouter();
  // const {signIn}= useAuth();

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError('');

  //   try {
  //     const { data, error } = await signIn(email, password);

  //     if (error) {
  //       setError(error.message);
  //       return;
  //     }

  //     router.push('/');
  //   } catch (err) {
  //     setError('An error occurred during sign-in');
  //     console.error('Sign-in error:', err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <section className="auth bg-base d-flex flex-wrap">
      <div className="auth-left d-lg-block d-none">
        <div className="d-flex align-items-center flex-column h-100 justify-content-center">
          <img src="/assets/images/auth/auth.png" alt="auth" />
        </div>
      </div>

      <div className="auth-right py-32 px-24 d-flex flex-column justify-content-center">
        <div className="max-w-464-px mx-auto w-100">
          <Link href="/" className="mb-40 max-w-290-px d-inline-block">
            <img src="/assets/images/bursopuri.png" alt="Bursopuri" />
          </Link>

          <h4 className="mb-12">Sign In to your Account</h4>
          <p className="mb-32 text-secondary-light text-lg">
            Welcome back! Please enter your detail
          </p>

          {error && (
            <div className="alert alert-danger text-sm mb-3">{error}</div>
          )}

          <form >
            <div className="icon-field mb-16">
              <span className="icon top-50 translate-middle-y">
                <Icon icon="mage:email" />
              </span>
              <input
                type="email"
                className="form-control h-56-px bg-neutral-50 radius-12"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="position-relative mb-20">
              <div className="icon-field">
                <span className="icon top-50 translate-middle-y">
                  <Icon icon="solar:lock-password-outline" />
                </span>
                <input
                  type="password"
                  className="form-control h-56-px bg-neutral-50 radius-12"
                  id="your-password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="d-flex justify-content-between gap-2">
              <div className="form-check style-check d-flex align-items-center">
                {/* <input
                  className="form-check-input border border-neutral-300"
                  type="checkbox"
                  id="remember"
                />
                <label className="form-check-label" htmlFor="remember">
                  Remember me
                </label> */}
              </div>
              <Link href="#" className="text-primary-600 fw-medium">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32"
              disabled={loading}
            >
              {loading ? (
                <span className="d-flex align-items-center justify-content-center">
                  <Icon icon="lucide:loader" className="animate-spin me-2" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>

            {/* <div className="mt-32 center-border-horizontal text-center">
              <span className="bg-base z-1 px-4">Or sign in with</span>
            </div>

            <div className="mt-32 d-flex align-items-center gap-3">
              <button
                type="button"
                className="fw-semibold text-primary-light py-16 px-24 w-50 border radius-12 text-md d-flex align-items-center justify-content-center gap-12 bg-hover-primary-50"
              >
                <Icon icon="ic:baseline-facebook" className="text-primary-600 text-xl" />
                Facebook
              </button>
              <button
                type="button"
                className="fw-semibold text-primary-light py-16 px-24 w-50 border radius-12 text-md d-flex align-items-center justify-content-center gap-12 bg-hover-primary-50"
              >
                <Icon icon="logos:google-icon" className="text-primary-600 text-xl" />
                Google
              </button>
            </div> */}

            <div className="mt-32 text-center text-sm">
              <p className="mb-0">
                Don’t have an account?{' '}
                <Link href="/sign-up" className="text-primary-600 fw-semibold">
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignInLayer;
