import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [householdId, setHouseholdId] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadInitialSession() {
    try {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await loadUserHousehold(session.user.id);
      } else {
        setHouseholdId(null);
      }
    } catch (error) {
      console.error('Error loading initial session:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadUserHousehold(userId) {
    try {
      const { data, error } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading household:', error);
        return;
      }

      setHouseholdId(data?.household_id ?? null);
    } catch (error) {
      console.error('Error loading user household:', error);
      setHouseholdId(null);
    }
  }

  useEffect(() => {
    loadInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await loadUserHousehold(session.user.id);
        } else {
          setHouseholdId(null);
        }

        // Don't set loading false here - let the initial load handle it
        if (event === 'SIGNED_OUT') {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Helper function to refresh household membership after creating/joining
  const refreshHousehold = async () => {
    if (user?.id) {
      await loadUserHousehold(user.id);
    }
  };

  const value = {
    session,
    user,
    householdId,
    loading,
    setHouseholdId,
    refreshHousehold,
    // Convenience getters
    isAuthenticated: !!session,
    hasHousehold: !!householdId
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}