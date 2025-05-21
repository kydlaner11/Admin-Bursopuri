"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// API service for handling authentication and user data
const apiService = {
  supabase: null,
  
  // Initialize Supabase client
  init() {
    if (!this.supabase) {
      this.supabase = createClientComponentClient();
    }
    return this.supabase;
  },

  // Sign in with email and password
  async signIn(email, password) {
    const supabase = this.init();
    return supabase.auth.signInWithPassword({ email, password });
  },

  // Sign up with email and password
  async signUp(email, password, userData = {}) {
    const supabase = this.init();
    return supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
  },

  // Sign out
  async signOut() {
    const supabase = this.init();
    return supabase.auth.signOut();
  },

  // Get current session
  async getSession() {
    const supabase = this.init();
    return supabase.auth.getSession();
  },

  // Get user profile
  async getProfile(userId) {
    const supabase = this.init();
    return supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
  },

  // Update user profile
  async updateProfile(userId, updates) {
    const supabase = this.init();
    return supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
  },

  // Reset password request
  async resetPassword(email) {
    const supabase = this.init();
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  },

  // Update user password
  async updatePassword(newPassword) {
    const supabase = this.init();
    return supabase.auth.updateUser({ password: newPassword });
  },

  // Create user with specific role (admin only)
  async createUserWithRole(email, password, role, userData = {}) {
    // This should be called from your backend for security
    const response = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        role,
        userData,
      }),
    });
    
    return response.json();
  },
};

export default apiService;