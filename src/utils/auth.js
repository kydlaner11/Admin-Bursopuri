"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getSessionAndProfile = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session?.user) {
          const userId = session.user.id;
          setUser(session.user);

          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

            console.log("📄 Profile result:", profile, "❌ Error:", profileError);

          if (profileError || !profile) {
            console.warn('Profile not found, logging out...');
            await supabase.auth.signOut();
            setUser(null);
            setRole(null);
            router.push('/sign-in');
            return;
          }

          setRole(profile.role);
        }
      } catch (err) {
        console.error('Error fetching session or profile:', err);
      } finally {
        setLoading(false);
      }
    };

    getSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);

          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

            console.log("📄 Profile result:", profile, "❌ Error:", profileError);

          if (profileError || !profile) {
            console.warn('Profile not found (state change), logging out...');
            await supabase.auth.signOut();
            setUser(null);
            setRole(null);
            router.push('/sign-in');
            return;
          }

          setRole(profile.role);
        } else {
          setUser(null);
          setRole(null);
        }
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, [supabase, router]);

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setRole(null);
      router.push('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signIn, signOut }}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};
