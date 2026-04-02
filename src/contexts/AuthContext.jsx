import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, hasSupabaseEnv } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bootError, setBootError] = useState('');

  useEffect(() => {
    if (!hasSupabaseEnv || !supabase) {
      setBootError('Supabase keys are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.');
      setLoading(false);
      return;
    }

    let mounted = true;

    const init = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error && mounted) setBootError(error.message);
      if (mounted) {
        setSession(data.session ?? null);
        setLoading(false);
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) setSession(nextSession ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.id || !supabase) {
      setProfile(null);
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (cancelled) return;
      if (error) {
        setBootError(error.message);
        return;
      }
      setProfile(data);
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      bootError,
      setProfile,
      signOut: async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
      },
    }),
    [session, profile, loading, bootError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
