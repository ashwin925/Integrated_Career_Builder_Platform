"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { createClientComponentClient, User } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";

type Role = "student" | "teacher" | "admin" | string;

export default function LMSDashboardPage() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);  
  const router = useRouter();


    useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/"); // redirect if not logged in
      } else {
        setUser(data.user);
      }
    };
    fetchUser();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  useEffect(() => {
    let mounted = true;
    async function init() {
      setLoading(true);
      setErr(null);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!mounted) return;
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (!currentUser) {
          setRole(null);
          setLoading(false);
          return;
        }

        const { data: roleData, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", currentUser.id)
          .eq("app", "lms")
          .maybeSingle();

        if (error) throw error;
        setRole(roleData?.role ?? null);
      } catch (e: any) {
        console.error("LMS dashboard fetch error:", e);
        setErr(e?.message ?? "Unknown error");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-900 text-foreground">
      <div className="card max-w-md w-full text-center">Loading LMS dashboard…</div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-900 text-foreground">
        <div className="card max-w-md w-full text-center">
          <h2 className="text-xl font-bold mb-3">Not signed in</h2>
          <p className="mb-4">Please sign in to access LMS features.</p>
          {/* <Link href="/"><a className="btn-primary">Back to Portal</a></Link> */}
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-900 text-foreground p-4">
        <div className="card max-w-lg w-full text-center">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="text-sm text-muted mb-4">{err}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  const studentActions = [
    { id: "courses", label: "My Courses" },
    { id: "progress", label: "Progress & Grades" },
  ];
  const teacherActions = [
    { id: "manage-classes", label: "Manage Classes" },
    { id: "assignments", label: "Create Assignment" },
  ];
  const adminActions = [
    { id: "manage-users", label: "Manage Users" },
    { id: "site-config", label: "Platform Settings" },
  ];

  const actions = role === "teacher" ? teacherActions : role === "admin" ? adminActions : studentActions;

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 text-foreground p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="title">LMS Dashboard</h1>
          <div className="text-right">
            <p className="text-sm text-muted">Signed in as</p>
            <p className="font-medium">{user.email}</p>
            <p className="text-sm text-muted">Role: <span className="font-semibold">{role ?? "—"}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {actions.map((a) => (
            <div key={a.id} className="card p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">{a.label}</h3>
                <p className="text-sm text-muted">Open {a.label.toLowerCase()}.</p>
              </div>
              <div className="mt-4">
                <button className="btn-primary w-full">Open</button>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-4">
          <h3 className="font-semibold mb-2">Account</h3>
          <p className="text-sm text-muted mb-1">User ID</p>
          <p className="text-xs break-all">{user.id}</p>
                  <button
          onClick={handleLogout}
          className="mt-4 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
        >
          Logout
        </button>
        </div>
      </div>
    </div>
  );
}
