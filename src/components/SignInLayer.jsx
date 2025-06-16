'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/utils/auth';
import { Icon } from '@iconify/react/dist/iconify.js';

const SignInLayer = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { signIn, isLoggedIn, role } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn && role === 'admin') {
      router.push('/');
    } else if (isLoggedIn && role !== 'admin') {
      router.push('/orders');
    }
  }, [isLoggedIn, router]);

  // Reset error saat user mengubah email atau password
  useEffect(() => {
    setError('');
  }, [email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await signIn(email, password);

      if (error) {
        // Mapping pesan error agar lebih mudah dipahami user
        const msg = error.toLowerCase();
        if (msg.includes('tidak terdaftar') || msg.includes('not found')) {
          setError('Email tidak ditemukan. Silakan cek kembali atau hubungi admin.');
        } else if (msg.includes('password salah') || msg.includes('email atau password salah') || msg.includes('wrong password') || msg.includes('invalid password')) {
          setError('Email atau password yang Anda masukkan salah.');
        } else {
          setError('Terjadi kesalahan. Silakan coba lagi.');
        }
        return;
      }

    } catch (err) {
      setError('Terjadi kesalahan saat sign-in.');
      console.error('Sign-in error:', err);
    } finally {
      setLoading(false);
    }
  };

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
            <div className="alert alert-danger text-sm mb-3">
              {error} 
            </div>
          )}

          <form onSubmit={handleSubmit}>
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
                disabled={loading}
              />
            </div>

            <div className="position-relative mb-20">
              <div className="icon-field">
                <span className="icon top-50 translate-middle-y">
                  <Icon icon="solar:lock-password-outline" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control h-56-px bg-neutral-50 radius-12"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn btn-link position-absolute top-50 end-0 translate-middle-y pe-3"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <Icon 
                    icon={showPassword ? "solar:eye-outline" : "solar:eye-closed-outline"} 
                    className="text-secondary"
                  />
                </button>
              </div>
            </div>

            {/* <div className="d-flex justify-content-between gap-2 mb-20">
              <div className="form-check style-check d-flex align-items-center">
                <input
                  className="form-check-input border border-neutral-300"
                  type="checkbox"
                  id="remember"
                  disabled={loading}
                />
                <label className="form-check-label" htmlFor="remember">
                  Remember me
                </label>
              </div>
              <Link href="/forgot-password" className="text-primary-600 fw-medium">
                Forgot Password?
              </Link>
            </div> */}

            <button
              type="submit"
              className="btn btn-sm px-12 py-16 w-100 radius-12"
              style={{ backgroundColor: '#7C0000', borderColor: '#7C0000', color: 'white' }}
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

            {/* <div className="mt-32 text-center text-sm">
              <p className="mb-0">
                Don't have an account?{' '}
                <Link href="/sign-up" className="text-primary-600 fw-semibold">
                  Sign Up
                </Link>
              </p>
            </div> */}
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignInLayer;