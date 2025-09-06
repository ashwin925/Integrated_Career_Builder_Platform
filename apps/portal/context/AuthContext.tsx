// apps/portal/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export type User = { id: string; email: string | null };

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;
        setUser(session?.user ? { id: session.user.id, email: session.user.email ?? null } : null);
      } catch (err) {
        console.error("[auth] getSession error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      // log for debugging as requested in your system design
      console.info("[auth] state changed", _event);
      setUser(session?.user ? { id: session.user.id, email: session.user.email ?? null } : null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async (redirectTo?: string) => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: redirectTo ? { redirectTo } : undefined,
      });
    } catch (err) {
      console.error("[auth] signInWithGoogle error:", err);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error("[auth] signOut error:", err);
      throw err;
    }
  };

  // memoize to avoid unnecessary re-renders for consumers
  const value = useMemo(
    () => ({ user, loading, signInWithGoogle, signOut }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
