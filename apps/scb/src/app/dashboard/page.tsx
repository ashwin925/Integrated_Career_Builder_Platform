"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient, User } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import Link from "next/link";

type Role = "student" | "admin" | string;

export default function SCBDashboardPage() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();


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

        // Fetch role for SCB (user_roles table)
        const { data: roleData, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", currentUser.id)
          .eq("app", "scb")
          .maybeSingle();

        if (error) throw error;
        setRole(roleData?.role ?? null);
      } catch (e: any) {
        console.error("SCB dashboard fetch error:", e);
        setErr(e?.message ?? "Unknown error");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      // role will be re-fetched by effect below
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  // optionally re-check role when user changes
  useEffect(() => {
    if (!user) return;
    // simple re-check is already done above; if you want polling or socket you can add later
  }, [user]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-900 text-foreground">
        <div className="card max-w-md w-full text-center">
          <p className="text-lg">Loading your SCB dashboard…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-900 text-foreground">
        <div className="card max-w-md w-full text-center">
          <h2 className="text-xl font-bold mb-3">Not signed in</h2>
          <p className="mb-4">Please sign in using the Portal or SCB login to access your dashboard.</p>
          {/* <Link href="/"><a className="btn-primary">Back to Portal</a></Link> */}
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-900 text-foreground p-4">
        <div className="card max-w-lg w-full text-center">
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-sm text-muted mb-4">{err}</p>
          <button
            className="btn-primary"
            onClick={() => {
              setErr(null);
              setLoading(true);
              // simple page reload to retry
              window.location.reload();
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Role-specific actions for SCB
  const studentActions = [
    { id: "my-courses", label: "My Career Courses" },
    { id: "career-profile", label: "Edit Career Profile" },
    { id: "job-suggestions", label: "Job Suggestions" },
  ];

  const adminActions = [
    { id: "manage-students", label: "Manage Students" },
    { id: "approve-requests", label: "Approve Access Requests" },
    { id: "reports", label: "Reports & Metrics" },
  ];

  const actions = role === "admin" ? adminActions : studentActions;

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 text-foreground p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="title">SCB Dashboard</h1>
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
                <p className="text-sm text-muted">Quick access to {a.label.toLowerCase()}.</p>
              </div>
              <div className="mt-4">
                <button className="btn-primary w-full">{role === "admin" ? "Open Admin" : "Open"}</button>
              </div>
            </div>
          ))}
        </div>

        {/* bottom area - account info */}
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
