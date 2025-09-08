"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface AccessRequest {
  id: string;
  email: string;
  app: string;
  requested_role: string;
  status: string;
  user_id: string;
}

const roleOptions: Record<string, string[]> = {
  scb: ["student", "admin", "counselor"],
  lms: ["student", "teacher", "admin"],
  jr: ["student", "admin", "recruiter"],
};

export default function SuperAdminPage() {
  const supabase = createClientComponentClient();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});

  const fetchRequests = async () => {
    const { data, error } = await supabase.from("access_requests").select("*");
    if (error) {
      console.error("Error fetching requests:", error.message);
    } else if (data) {
      setRequests(data);
      // initialize selected roles state
      const initRoles: Record<string, string> = {};
      data.forEach((r) => {
        initRoles[r.id] = r.requested_role;
      });
      setSelectedRoles(initRoles);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDecision = async (
    request: AccessRequest,
    decision: "approve" | "reject"
  ) => {
    setLoading(true);

    try {
      if (decision === "approve") {
        const newRole = selectedRoles[request.id];

        // 1. Ensure profile exists
        const { error: profileError } = await supabase.rpc("upsert_profile", {
          p_id: request.user_id,
          p_email: request.email,
        });
        if (profileError) throw profileError;

        // 2. Insert/update role
        const { error: roleError } = await supabase.rpc("insert_user_role", {
          p_user_id: request.user_id,
          p_app: request.app.toLowerCase(),
          p_role: newRole,
        });
        if (roleError) throw roleError;

        // 3. Update request status
        const { error: reqError } = await supabase
          .from("access_requests")
          .update({ status: "approved" })
          .eq("id", request.id);
        if (reqError) throw reqError;
      } else if (decision === "reject") {
        const { error } = await supabase
          .from("access_requests")
          .update({ status: "rejected" })
          .eq("id", request.id);
        if (error) throw error;
      }
    } catch (err) {
      console.error("Decision error:", err);
    } finally {
      setLoading(false);
      fetchRequests();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this request?")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("access_requests")
        .delete()
        .eq("id", id);
      if (error) throw error;
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setLoading(false);
      fetchRequests();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background dark:bg-gray-900 text-foreground dark:text-gray-100 p-4">
      <div className="bg-card dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-4">Super Admin Dashboard</h1>

        {requests.length === 0 ? (
          <p>No pending requests.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-700 text-left">
                <th className="p-2">Email</th>
                <th className="p-2">App</th>
                <th className="p-2">Requested Role</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-b border-gray-600">
                  <td className="p-2">{req.email}</td>
                  <td className="p-2">{req.app}</td>
                  <td className="p-2">{req.requested_role}</td>
                  <td className="p-2">{req.status}</td>
                  <td className="p-2 flex flex-wrap gap-2">
                    {req.status === "pending" && (
                      <>
                        <select
                          value={selectedRoles[req.id]}
                          onChange={(e) =>
                            setSelectedRoles((prev) => ({
                              ...prev,
                              [req.id]: e.target.value,
                            }))
                          }
                          className="px-2 py-1 rounded bg-gray-700 text-white"
                        >
                          {(roleOptions[req.app.toLowerCase()] || []).map(
                            (role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            )
                          )}
                        </select>
                        <button
                          onClick={() => handleDecision(req, "approve")}
                          disabled={loading}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-500 transition-all"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDecision(req, "reject")}
                          disabled={loading}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500 transition-all"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {req.status !== "pending" && <span>{req.status}</span>}

                    <button
                      onClick={() => handleDelete(req.id)}
                      disabled={loading}
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 transition-all"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
