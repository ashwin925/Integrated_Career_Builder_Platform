"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient, User } from "@supabase/auth-helpers-nextjs";

export default function LMSPage() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "approved" | "rejected" | "pending" | "none">("loading");

  // 🔹 Session listener
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

  // 🔹 Role / Request check
  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setStatus("none");
        return;
      }

      try {
        // 1️⃣ Check existing approved role
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("app", "lms") // ✅ lowercase app key
          .maybeSingle();

        if (roleError) throw roleError;

        if (roleData) {
          setRole(roleData.role);
          setStatus("approved");
          return;
        }

        // 2️⃣ Else check latest access request
        const { data: request, error: reqError } = await supabase
          .from("access_requests")
          .select("status")
          .eq("user_id", user.id)
          .eq("app", "LMS") // ✅ match how you stored it in SuperAdmin
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (reqError) throw reqError;

        if (request) {
          setStatus(request.status as "pending" | "rejected");
        } else {
          setStatus("none");
        }
      } catch (err: any) {
        console.error("Check profile error:", err.message);
        setStatus("none");
      }
    };

    checkProfile();
  }, [user, supabase]);

  // 🔹 Login
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "http://localhost:3001" }, // ✅ LMS app port
    });
  };

  // 🔹 Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setStatus("none");
  };

  // 🔹 Request Access
  const handleRequest = async () => {
    if (!user) {
      alert("⚠️ Please login before submitting.");
      return;
    }

    try {
      // Prevent duplicate pending requests
      const { data: existing } = await supabase
        .from("access_requests")
        .select("id, status")
        .eq("user_id", user.id)
        .eq("app", "LMS") // ✅ consistent
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
        app: "LMS", // ✅ uppercase key for request
        requested_role: "student",
        status: "pending",
      });

      if (error) throw error;

      alert("✅ Request submitted successfully!");
      setStatus("pending");
    } catch (err: any) {
      alert("❌ Failed to submit request: " + err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background dark:bg-gray-900 text-foreground dark:text-gray-100">
      <div className="bg-card dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Learning Management System</h1>

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
