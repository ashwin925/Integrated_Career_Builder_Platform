"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient, User } from "@supabase/auth-helpers-nextjs";

type Status = "loading" | "approved" | "rejected" | "pending" | "none";

interface ErrorType {
  message?: string;
}

export default function JRPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  // Session listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Role / request check
  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setStatus("none");
        return;
      }

      try {
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("app", "jr")
          .maybeSingle();

        if (roleError) throw roleError;

        if (roleData) {
          setRole(roleData.role);
          setStatus("approved");
          return;
        }

        const { data: request, error: reqError } = await supabase
          .from("access_requests")
          .select("status")
          .eq("user_id", user.id)
          .eq("app", "jr")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (reqError) throw reqError;

        if (request) {
          setStatus(request.status as Status);
        } else {
          setStatus("none");
        }
      } catch (err: unknown) {
        const e = err as ErrorType;
        console.error("Check profile error:", e.message ?? err);
        setStatus("none");
      }
    };

    checkProfile();
  }, [user, supabase]);

  // 🚀 Safe redirect when approved
  useEffect(() => {
    if (status === "approved" && role) {
      router.push("/dashboard");
    }
  }, [status, role, router]);

  // Login
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "http://localhost:3002" },
    });
  };

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setStatus("none");
  };

  // Request access
  const handleRequest = async () => {
    if (!user) {
      alert("⚠️ Please login before submitting.");
      return;
    }

    try {
      const { data: existing } = await supabase
        .from("access_requests")
        .select("id, status")
        .eq("user_id", user.id)
        .eq("app", "jr")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing && existing.status === "pending") {
        alert("⏳ You already have a pending request.");
        setStatus("pending");
        return;
      }

      const { error } = await supabase.from("access_requests").insert({
        user_id: user.id,
        email: user.email,
        app: "jr",
        requested_role: "student",
        status: "pending",
      });

      if (error) throw error;

      alert("✅ Request submitted successfully!");
      setStatus("pending");
    } catch (err: unknown) {
      const e = err as ErrorType;
      alert("❌ Failed to submit request: " + (e.message ?? "unknown"));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background dark:bg-gray-900 text-foreground dark:text-gray-100">
      <div className="bg-card dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Job Recommender</h1>

        {!user ? (
          <>
            <p className="mb-4">Please sign in to request access.</p>
            <button
              onClick={handleLogin}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all"
            >
              Login with Google
            </button>
          </>
        ) : status === "pending" ? (
          <>
            <p className="mb-4">⏳ Your request is pending approval.</p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-all"
            >
              Logout
            </button>
          </>
        ) : status === "rejected" ? (
          <>
            <p className="mb-4">❌ Your request was rejected.</p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-all"
            >
              Logout
            </button>
          </>
        ) : status === "none" ? (
          <>
            <p className="mb-4">Welcome, {user.email}</p>
            <button
              onClick={handleRequest}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-all mr-2"
            >
              Request Access
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-all"
            >
              Logout
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
