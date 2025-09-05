// apps/super-admin/src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type CheckResult = { ok: boolean; isAdmin?: boolean; message?: string };

export default function SuperAdminApp() {
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [viewingRequests, setViewingRequests] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setMsg(null);

      try {
        const {
          data: { session },
          error: sessionErr,
        } = await supabase.auth.getSession();

        if (sessionErr) {
          console.error("[super-admin] getSession error", sessionErr);
          setMsg("Session fetch failed.");
          setLoading(false);
          return;
        }

        if (!session?.user) {
          setLoading(false);
          return;
        }

        setEmail(session.user.email ?? null);

        // Query super_admins table safely
        const { data, error, status } = await supabase
          .from("super_admins")
          .select("id")
          .eq("id", session.user.id)
          .maybeSingle();

        if (error) {
          // Expose clear error message but keep friendly UI
          console.error("[super-admin] table check error", { error, status });
          setMsg(`Authorization check failed: ${error.message}`);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        if (data && data.id) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("[super-admin] unexpected error:", err);
        setMsg("Unexpected error. See console.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: "http://localhost:3003" },
      });
    } catch (err) {
      console.error("[super-admin] oauth error", err);
      setMsg("Login failed, check console for details.");
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setEmail(null);
      setIsAdmin(false);
    } catch (err) {
      console.error("[super-admin] signOut error", err);
      setMsg("Logout failed. See console.");
    }
  };

  const fetchRequests = async () => {
  const { data, error } = await supabase
    .from("access_requests")
    .select("*")
    .eq("status", "pending");

  if (error) {
    alert("❌ Failed to load requests: " + error.message);
  } else {
    setRequests(data);
    setViewingRequests(true);
  }
};

  return (
    <main className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-900 text-foreground p-6">
      <div className="max-w-2xl w-full bg-card dark:bg-gray-800 rounded-xl shadow-2xl border border-white/5 p-6">
        <h1 className="text-3xl font-bold mb-2">Super Admin</h1>
        <p className="text-muted-foreground mb-4">Admin panel (restricted).</p>

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : !email ? (
          <div className="space-y-4">
            <p className="text-sm">Please log in with Google to continue.</p>
            <div className="flex gap-3">
              <button onClick={handleLogin} className="px-4 py-2 rounded-lg bg-primary/90 transition-all duration-300 hover:scale-105">
                Login with Google
              </button>
            </div>
            {msg && <div className="text-rose-400 text-sm mt-2">{msg}</div>}
          </div>
        ) : !isAdmin ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Access Denied — your account is not a super admin.</p>
            <div className="flex items-center gap-3">
              <div className="text-sm">Signed in as: <span className="font-medium">{email}</span></div>
              <button onClick={handleLogout} className="px-3 py-1 rounded-md bg-red-600 text-white ml-auto">Logout</button>
            </div>
            {msg && <div className="text-rose-400 text-sm mt-2">{msg}</div>}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm">Welcome, <span className="font-medium">{email}</span> — you are a Super Admin.</p>
            {/* Dashboard: pending requests preview and quick assign UI could go here.
                For now we keep a minimal panel but with hooks to expand. */}
            <div className="mt-6">
                <button
                  onClick={fetchRequests}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all"
                >
                  View Pending Requests
                </button>

                {viewingRequests && (
                  <div className="mt-4 bg-card dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold mb-2">Pending Requests</h2>
                    {requests.length === 0 ? (
                      <p>No pending requests</p>
                    ) : (
                      <ul className="space-y-2">
                        {requests.map((req) => (
                          <li
                            key={req.id}
                            className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex justify-between"
                          >
                            <span>{req.email}</span>
                            <span className="italic text-sm text-gray-500">{req.status}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            {msg && <div className="text-rose-400 text-sm mt-2">{msg}</div>}
          </div>
        )}
      </div>
    </main>
  );
}
