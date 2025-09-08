"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import FeatureCard from "../components/FeatureCard";
import { Button } from "../components/ui/button";

type Role = "student" | "counselor" | "admin" | "superadmin" | "guest";

const featureSets: Record<Role, { title: string; description: string; href: string }[]> = {
  student: [
    { title: "Profile Management", description: "Complete or update your personal profile.", href: "/profile" },
    { title: "Skills Inventory", description: "Add and manage your skills and proficiency levels.", href: "/skills" },
    { title: "Career Goals", description: "Set and track your career objectives.", href: "/goals" },
    { title: "Progress Tracking", description: "View completion metrics and achievements.", href: "/progress" },
    { title: "Roadmap Planning", description: "Create and follow career pathways.", href: "/roadmap" },
    { title: "Resume Upload", description: "Upload your resume to extract skills automatically.", href: "/resume" },
  ],
  counselor: [
    { title: "Counselor Dashboard", description: "Overview of your assigned students.", href: "/counselor" },
    { title: "Student Management", description: "View and guide student progress.", href: "/counselor/students" },
    { title: "Progress Reports", description: "Generate reports on student advancement.", href: "/counselor/reports" },
    { title: "Goal Approval", description: "Review and approve student career plans.", href: "/counselor/goals" },
    { title: "Intervention Tools", description: "Identify and support struggling students.", href: "/counselor/intervene" },
  ],
  admin: [
    { title: "Admin Dashboard", description: "System-wide management console.", href: "/admin" },
    { title: "Pathway Management", description: "Create and edit career pathways.", href: "/admin/pathways" },
    { title: "User Management", description: "Manage all user accounts.", href: "/admin/users" },
    { title: "Analytics", description: "View platform metrics and reports.", href: "/admin/analytics" },
    { title: "System Configuration", description: "Configure platform settings.", href: "/admin/settings" },
  ],
  superadmin: [], // will dynamically show student/counselor/admin based on switch
  guest: [],
};

export default function DashboardPage() {
  const supabase = createClientComponentClient();
  const [role, setRole] = useState<Role>("guest");
  const [viewAs, setViewAs] = useState<Role>("guest"); // superadmin override

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("app", "scb")
        .maybeSingle();

      if (error) {
        console.error("❌ Failed to fetch role:", error.message);
        setRole("guest");
        return;
      }

      setRole((roleData?.role as Role) ?? "guest");
    };

    fetchRole();
  }, [supabase]);

  // Super Admin override logic
  const effectiveRole = role === "superadmin" && viewAs !== "guest" ? viewAs : role;
  const features = featureSets[effectiveRole] ?? [];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">SCB Dashboard</h1>

      {/* Super Admin role switcher */}
      {role === "superadmin" && (
        <div className="mb-6 flex flex-wrap gap-4">
          <span className="font-medium">🔑 View As:</span>
          {["student", "counselor", "admin"].map((r) => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <FeatureCard
              key={f.title}
              title={f.title}
              description={f.description}
              href={f.href}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">
          No features assigned to your role. Contact admin for access.
        </p>
      )}
    </div>
  );
}
