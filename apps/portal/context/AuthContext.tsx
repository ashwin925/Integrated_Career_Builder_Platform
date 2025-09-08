"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// ---- Types ----
export type User = {
  id: string;
  email: string | null;
  role?: string; // ✅ add role here
};

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

// ---- AuthProvider ----
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

        if (session?.user) {
          const baseUser: User = {
            id: session.user.id,
            email: session.user.email ?? null,
          };

          // ✅ fetch role from user_roles for SCB
          const { data: roleData, error } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .eq("app", "scb") // 👈 IMPORTANT: change "scb" -> "lms" or "jr" in those apps
            .single();

          if (error) {
            console.warn("[auth] no role found in user_roles:", error.message);
            setUser({ ...baseUser, role: "Guest" });
          } else {
            setUser({ ...baseUser, role: roleData?.role ?? "Guest" });
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("[auth] getSession error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.info("[auth] state changed", _event);
        if (session?.user) {
          const baseUser: User = {
            id: session.user.id,
            email: session.user.email ?? null,
          };

          const { data: roleData, error } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .eq("app", "scb")
            .single();

          if (error) {
            setUser({ ...baseUser, role: "Guest" });
          } else {
            setUser({ ...baseUser, role: roleData?.role ?? "Guest" });
          }
        } else {
          setUser(null);
        }
      }
    );

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

  const value = useMemo(
    () => ({ user, loading, signInWithGoogle, signOut }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
