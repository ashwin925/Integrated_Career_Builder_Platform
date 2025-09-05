"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient, User } from "@supabase/auth-helpers-nextjs";

export default function SCBPage() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "approved" | "rejected" | "pending" | "none">("loading");

  // 🔹 Listen for user session
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

  // 🔹 Check role or request status
  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setStatus("none");
        return;
      }

      // First check if user has an approved role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("app", "scb")
        .maybeSingle();

      if (roleError) {
        console.error("Role check error:", roleError.message);
        setStatus("none");
        return;
      }

      if (roleData) {
        setRole(roleData.role);
        setStatus("approved");
        return;
      }

      // If no role, check if request exists
      const { data: request, error: reqError } = await supabase
        .from("access_requests")
        .select("status")
        .eq("user_id", user.id)
        .eq("app", "scb")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (reqError) {
        console.error("Request check error:", reqError.message);
        setStatus("none");
      } else if (request) {
        setStatus(request.status as "pending" | "rejected");
      } else {
        setStatus("none");
      }
    };

    checkProfile();
  }, [user, supabase]);

  // 🔹 Login with Google
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "http://localhost:3000" }, // 🔧 change in prod
    });
  };

  // 🔹 Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setStatus("none");
  };

  // 🔹 Request Access (prevent duplicate pending requests)
  const handleRequest = async () => {
    if (!user) {
      alert("⚠️ Please login before submitting.");
      return;
    }

    // Check if a pending request already exists
    const { data: existing } = await supabase
      .from("access_requests")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("app", "SCB")
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
      app: "SCB",
      requested_role: "student",
      status: "pending",
    });

    if (error) {
      alert("❌ Failed to submit request: " + error.message);
    } else {
      alert("✅ Request submitted successfully!");
      setStatus("pending");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background dark:bg-gray-900 text-foreground dark:text-gray-100">
      <div className="bg-card dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Student Career Builder</h1>

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
        ) : status === "approved" ? (
          <>
            <p className="mb-4">✅ Welcome, {user.email}! Role: {role}</p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-all"
            >
              Logout
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
        ) : (
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
        )}
      </div>
    </div>
  );
}
