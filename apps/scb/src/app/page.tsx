"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient, User } from "@supabase/auth-helpers-nextjs";

export default function SCBPage() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null); // 👈 Proper type

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

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "http://localhost:3000" }, // SCB runs on 3000
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleRequest = async () => {
    if (!user) {
      alert("⚠️ Please login before submitting.");
      return;
    }

    const { error } = await supabase.from("access_requests").insert({
      user_id: user.id,
      email: user.email,
      app: "SCB",
      requested_role: "student",  // 👈 required field
      status: "pending",
    });


    if (error) {
      alert("❌ Failed to submit request: " + error.message);
    } else {
      alert("✅ Request submitted successfully!");
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
