"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient, User } from "@supabase/auth-helpers-nextjs";

type Role = "job_seeker" | "recruiter" | "admin" | "super_admin" | string;

export default function JRDashboardPage() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  // 🔹 Ensure user is logged in
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

  // 🔹 Fetch session + role
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
          .eq("app", "jr")
          .maybeSingle();

        if (error) throw error;
        setRole(roleData?.role ?? null);
      } catch (e: any) {
        console.error("JR dashboard fetch error:", e);
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

  // 🔹 Logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-900 text-foreground">
        <div className="card max-w-md w-full text-center">Loading JR dashboard…</div>
      </div>
    );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-900 text-foreground">
        <div className="card max-w-md w-full text-center">
          <h2 className="text-xl font-bold mb-3">Not signed in</h2>
          <p className="mb-4">Please sign in to access JR features.</p>
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
          <button className="btn-primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // 🔹 Actions per role
  const jobSeekerActions = [
    { id: "dashboard", label: "Job Dashboard" },
    { id: "jobs", label: "Job Search" },
    { id: "applications", label: "Applications" },
    { id: "interviews", label: "Interviews" },
    { id: "alerts", label: "Job Alerts" },
  ];

  const recruiterActions = [
    { id: "recruiter-dashboard", label: "Recruiter Dashboard" },
    { id: "post-job", label: "Post New Job" },
    { id: "candidates", label: "Candidate Search" },
    { id: "applications", label: "Application Review" },
    { id: "interviews", label: "Interview Management" },
    { id: "pipeline", label: "Talent Pipeline" },
  ];

  const adminActions = [
    { id: "admin-dashboard", label: "JR Admin Dashboard" },
    { id: "verify-jobs", label: "Job Verification" },
    { id: "recruiters", label: "Recruiter Management" },
    { id: "compliance", label: "Compliance" },
    { id: "analytics", label: "Analytics & Reports" },
  ];

  let actions: { id: string; label: string }[] = [];
  if (role === "recruiter") actions = recruiterActions;
  else if (role === "admin") actions = adminActions;
  else actions = jobSeekerActions;

  // 🔹 Super Admin sees everything
  if (role === "super_admin") {
    actions = [
      ...jobSeekerActions.map((a) => ({ ...a, label: `[Job Seeker] ${a.label}` })),
      ...recruiterActions.map((a) => ({ ...a, label: `[Recruiter] ${a.label}` })),
      ...adminActions.map((a) => ({ ...a, label: `[Admin] ${a.label}` })),
    ];
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 text-foreground p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="title">JR Dashboard</h1>
          <div className="text-right">
            <p className="text-sm text-muted">Signed in as</p>
            <p className="font-medium">{user.email}</p>
            <p className="text-sm text-muted">
              Role: <span className="font-semibold">{role ?? "—"}</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {actions.map((a) => (
            <div key={a.id} className="card p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">{a.label}</h3>
                <p className="text-sm text-muted">Open {a.label}.</p>
              </div>
              <div className="mt-4">
                <button className="btn-primary w-full">Open</button>
              </div>
            </div>
          ))}
        </div>

        {/* Account */}
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
