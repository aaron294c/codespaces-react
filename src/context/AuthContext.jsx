import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for demo user first
    const demoUser = localStorage.getItem('demo_user');
    if (demoUser) {
      try {
        const parsed = JSON.parse(demoUser);
        setUser(parsed);
        setToken('demo-token');
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('demo_user');
      }
    }

    // Get initial session from Supabase
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else if (session) {
          setUser(session.user);
          setToken(session.access_token);
          console.log('Initial session loaded:', session.user?.email);
        } else {
          console.log('Initial session loaded: none');
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'no user');
        
        if (session) {
          setUser(session.user);
          setToken(session.access_token);
          localStorage.removeItem('demo_user'); // Clear demo user if real auth happens
        } else {
          setUser(null);
          setToken(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, budget, partnerEmail) => {
    try {
      console.log('Attempting to sign up:', email);
      setLoading(true);

      // First, try to sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/home`,
          data: {
            budget: budget,
            partner_email: partnerEmail
          }
        }
      });

      if (error) {
        console.log('Supabase auth error:', error);
        throw new Error(error.message);
      }

      console.log('Sign up successful:', data);
      
      // If we have a user but no session, email confirmation is required
      if (data.user && !data.session) {
        return { 
          user: data.user, 
          requiresConfirmation: true,
          message: 'Please check your email to confirm your account'
        };
      }

      // If we have both user and session, create the user profile
      if (data.user && data.session) {
        await createUserProfile(data.user, { budget, partnerEmail });
      }

      return data;
    } catch (error) {
      console.log('Sign up failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createUserProfile = async (user, { budget, partnerEmail }) => {
    try {
      // Try to insert into your existing user_profiles table
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          auth_user_id: user.id,
          email: user.email,
          budget: budget || 0,
          partner_email: partnerEmail
        })
        .select()
        .single();

      if (error) {
        console.log('Profile creation error:', error);
        // Don't throw here - auth user is created, we can handle profile later
        return null;
      }

      console.log('Profile created:', data);
      return data;
    } catch (error) {
      console.log('Profile creation failed:', error);
      return null;
    }
  };

  const signIn = async (email, password) => {
    try {
      console.log('Attempting to sign in:', email);
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.log('Sign in error:', error);
        throw new Error(error.message);
      }

      console.log('Sign in successful:', data);
      return data;
    } catch (error) {
      console.log('Sign in failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      
      // Clear demo user
      localStorage.removeItem('demo_user');
      
      // Sign out from Supabase if not demo user
      if (token !== 'demo-token') {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Sign out error:', error);
          throw error;
        }
      }
      
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  };

  // Mock login for development (fallback)
  const mockLogin = (mockToken = 'mock-token') => {
    setUser({ 
      id: 'mock-user', 
      email: 'demo@example.com',
      user_metadata: { full_name: 'Demo User' }
    });
    setToken(mockToken);
    setLoading(false);
  };

  const value = {
    user,
    token,
    loading,
    isAuthed: !!user,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    login: mockLogin, // Keep for compatibility
    logout: signOut,
    supabase // Expose supabase client for direct usage
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};