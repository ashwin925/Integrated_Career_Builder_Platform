"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function SuperAdminPage() {
  const supabase = createClientComponentClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setLoading(false);
        return;
      }

      setUserEmail(session.user.email ?? null);

      // Check if this user is in super_admins table
      const { data, error } = await supabase
        .from("super_admins")
        .select("id")
        .eq("id", session.user.id)
        .single();

      if (data && !error) {
        setIsSuperAdmin(true);
      }

      setLoading(false);
    };

    checkAuth();
  }, [supabase]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3003",
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsSuperAdmin(false);
    setUserEmail(null);
  };

  if (loading) return <p>Loading...</p>;

  if (!userEmail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Super Admin Dashboard</h1>
        <p>Please log in to access Super Admin Dashboard.</p>
        <button
          onClick={handleLogin}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Login with Google
        </button>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>{userEmail}, you are not authorized to view this page.</p>
        <button
          onClick={handleLogout}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Super Admin Dashboard</h1>
      <p>Welcome, {userEmail}! ✅ You are a Super Admin.</p>
      <button
        onClick={handleLogout}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
      >
        Logout
      </button>
    </div>
  );
}
