"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient, User } from "@supabase/auth-helpers-nextjs";
import { Button } from "../../../components/ui/button";
import FeatureCard from "../../../components/FeatureCard";

type Role = "student" | "teacher" | "admin" | "superadmin" | "guest";

const featureSets: Record<Role, { title: string; description: string; href: string }[]> = {
  student: [
    { title: "Learning Dashboard", description: "Course overview and progress.", href: "/dashboard" },
    { title: "Course Catalog", description: "Browse and search available courses.", href: "/courses" },
    { title: "My Courses", description: "Access enrolled learning content.", href: "/my-courses" },
    { title: "Assignments", description: "Submit and track your assignments.", href: "/assignments" },
    { title: "Grades", description: "View your scores and feedback.", href: "/grades" },
    { title: "Certificates", description: "Earn and download course completions.", href: "/certificates" },
  ],
  teacher: [
    { title: "Teacher Dashboard", description: "Manage your teaching hub.", href: "/teacher" },
    { title: "Course Creation", description: "Develop new courses.", href: "/teacher/create" },
    { title: "Content Management", description: "Upload materials and resources.", href: "/teacher/content" },
    { title: "Gradebook", description: "Evaluate student work and manage grades.", href: "/teacher/gradebook" },
    { title: "Analytics", description: "Track learner performance.", href: "/teacher/analytics" },
    { title: "Communication", description: "Message your students directly.", href: "/teacher/communication" },
  ],
  admin: [
    { title: "LMS Admin Console", description: "Manage the entire platform.", href: "/admin" },
    { title: "Course Approval", description: "Review and approve course submissions.", href: "/admin/approvals" },
    { title: "User Management", description: "Manage learners and instructors.", href: "/admin/users" },
    { title: "Reporting", description: "Generate platform usage reports.", href: "/admin/reports" },
    { title: "System Settings", description: "Configure LMS options.", href: "/admin/settings" },
  ],
  superadmin: [], // super admin can "view as"
  guest: [],
};

export default function LMSDashboardPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>("guest");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [viewAs, setViewAs] = useState<Role>("guest"); // superadmin override

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
          setRole("guest");
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
        setRole((roleData?.role as Role) ?? "guest");
      } catch (e: any) {
        console.error("❌ LMS dashboard fetch error:", e);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading)
    return (
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

  const effectiveRole = role === "superadmin" && viewAs !== "guest" ? viewAs : role;
  const features = featureSets[effectiveRole] ?? [];

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="title">📚 LMS Dashboard</h1>
          <div className="text-right">
            <p className="text-sm text-muted">Signed in as</p>
            <p className="font-medium">{user.email}</p>
            <p className="text-sm text-muted">
              Role: <span className="font-semibold">{effectiveRole}</span>
            </p>
          </div>
        </div>

        {/* Super Admin role switcher */}
        {role === "superadmin" && (
          <div className="mb-6 flex flex-wrap gap-4">
            <span className="font-medium">🔑 View As:</span>
            {["student", "teacher", "admin"].map((r) => (
              <Button
                key={r}
                variant={viewAs === r ? "default" : "outline"}
                onClick={() => setViewAs(r as Role)}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </Button>
            ))}
          </div>
        )}

        {features.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <FeatureCard key={f.title} title={f.title} description={f.description} href={f.href} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No features assigned to your role. Contact admin for access.
          </p>
        )}

        <div className="card p-4 mt-8">
          <h3 className="font-semibold mb-2">Account</h3>
          <p className="text-sm text-muted mb-1">User ID</p>
          <p className="text-xs break-all">{user.id}</p>
          <Button onClick={handleLogout} className="mt-4 bg-red-600 text-white hover:bg-red-700">
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
