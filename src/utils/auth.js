'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Api from '../api'; // Adjust the import path as needed

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();

  // Load user info from localStorage token
  const loadUser = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      
      // Check if token is expired
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        localStorage.removeItem('token');
        return null;
      }
      
      return decoded;
    } catch (err) {
      console.error('Invalid token:', err);
      localStorage.removeItem('token');
      return null;
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      // Send request to Express API, not directly to Supabase
      const res = await Api.post('/login', { email, password });
      console.log('Login response:', res.data);

      if (res.data.ok && res.data.user?.token) {
        const token = res.data.user.token;
        localStorage.setItem('token', token);
        const decoded = jwtDecode(token);
        setUser({
          id: decoded.id,
          email: decoded.email,
          user_metadata: {
            full_name: res.data.user.full_name
          }
        });
        setRole(decoded.role);
        return { error: null };
      } else {
        // Custom error handling for specific cases
        const msg = res.data.message?.toLowerCase() || '';
        if (msg.includes('not found') || msg.includes('tidak terdaftar')) {
          return { error: 'Email tidak terdaftar, hubungi admin.' };
        } else if (msg.includes('wrong password') || msg.includes('invalid password') || msg.includes('password salah')) {
          return { error: 'Email atau password salah.' };
        } else {
          return { error: res.data.message || 'Login failed' };
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message?.toLowerCase() || '';
      if (msg.includes('not found') || msg.includes('tidak terdaftar')) {
        return { error: 'Email tidak terdaftar, hubungi admin.' };
      } else if (msg.includes('wrong password') || msg.includes('invalid password') || msg.includes('password salah')) {
        return { error: 'Email atau password salah.' };
      } else {
        return { error: err.response?.data?.message || 'Login failed' };
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async ({ email, password, full_name }) => {
    try {
      setLoading(true);
      
      // Send request to Express API, not directly to Supabase
      const res = await Api.post('/register', {
        email, 
        password, 
        full_name
      });

      if (res.data.ok) {
        return { error: null };
      } else {
        return { error: res.data.message || 'Registration failed' };
      }
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.response?.data?.message || 'Registration error';
      return { error: msg };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Optional: Call logout endpoint if you have one
      // await Api.post('/auth/logout');
      
      localStorage.removeItem('token');
      setUser(null);
      setRole(null);
      
      return { error: null };
    } catch (err) {
      console.error('Sign out error:', err);
      // Still clear local storage even if API call fails
      localStorage.removeItem('token');
      setUser(null);
      setRole(null);
      
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Initialize user from token when app loads
  useEffect(() => {
    try {
      const decodedUser = loadUser();
      if (decodedUser) {
        setUser({
          id: decodedUser.id,
          email: decodedUser.email,
          user_metadata: {
            full_name: decodedUser.full_name
          }
        });
        setRole(decodedUser.role);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setInitializing(false);
    }
  }, []);

  const value = {
    user,
    role,
    isLoggedIn: !!user,
    loading,
    initializing,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {initializing ? (
        <div className="d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Initializing...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};