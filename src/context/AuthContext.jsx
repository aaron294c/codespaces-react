// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, dbHelpers } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [householdId, setHouseholdId] = useState(null);

  // Helper function to ensure user has household
  const ensureUserHousehold = async (user) => {
    if (!user) return null;
    
    try {
      // First try to get existing household
      const existingHouseholdId = await dbHelpers.getUserHouseholdId();
      if (existingHouseholdId) {
        return existingHouseholdId;
      }
      
      // If no household exists, create one
      console.log('No household found, creating one for user:', user.email);
      const newHouseholdId = await dbHelpers.setupNewUser(user);
      return newHouseholdId;
    } catch (error) {
      console.error('Error ensuring user household:', error);
      return null;
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Ensure user has household
            const userHouseholdId = await ensureUserHousehold(session.user);
            setHouseholdId(userHouseholdId);
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Ensure user has household whenever they sign in
          const userHouseholdId = await ensureUserHousehold(session.user);
          setHouseholdId(userHouseholdId);
        } else {
          setHouseholdId(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email, password, options = {}) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: options.metadata || {}
        }
      });

      if (error) throw error;

      // If email confirmation is disabled and user is immediately available
      if (data.user && data.user.email_confirmed_at) {
        try {
          const householdId = await dbHelpers.setupNewUser(data.user);
          setHouseholdId(householdId);
        } catch (setupError) {
          console.error('Failed to setup user during signup:', setupError);
          // Don't fail the signup, but the household setup will be retried on next login
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Household setup will be handled by the auth state change listener

      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Clear local state
      setUser(null);
      setSession(null);
      setHouseholdId(null);
      
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error('Password reset error:', error);
      return { error };
    }
  };

  const updatePassword = async (password) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error('Update password error:', error);
      return { error };
    }
  };

  const updateProfile = async (updates) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: updates
      });
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    householdId,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile
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