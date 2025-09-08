"use client";

import { ReactNode, useEffect, useState } from "react";
import { createClientComponentClient, User } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

interface LayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ full_name: string | null; email: string | null } | null>(
    null
  );
  const [role, setRole] = useState<string | null>(null);

  // 🔹 Load session + profile + role
  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const authedUser = session?.user ?? null;
      setUser(authedUser);

      if (authedUser) {
        // fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", authedUser.id)
          .maybeSingle();
        setProfile(profileData);

        // fetch role for SCB
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", authedUser.id)
          .eq("app", "scb")
          .maybeSingle();
        setRole(roleData?.role ?? "guest");
      }
    };
    loadUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/"); // back to SCB root page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">SCB Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-500 transition"
        >
          Logout
        </button>
      </header>

      <main className="p-6">
        <div className="mb-6 p-4 rounded-lg bg-gray-100 dark:bg-gray-700">
          <p>
            Signed in as:{" "}
            <span className="font-semibold">
              {profile?.full_name || user?.email || "Unknown"}
            </span>
          </p>
          <p>
            Role: <span className="font-semibold">{role ?? "Guest"}</span>
          </p>
        </div>
        {children}
      </main>
    </div>
  );
}
