'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type RoleRequest = {
  id: string;
  user_id: string;
  requested_app: string;
  requested_role: string;
  status: string;
}

export default function SuperAdminDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [requests, setRequests] = useState<RoleRequest[]>([])

  useEffect(() => {
    async function checkSuperAdmin() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/super-admin-login')
        return
      }

      const { data, error } = await supabase
        .from('super_admins')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        setIsSuperAdmin(false)
        setLoading(false)
        return
      }

      setIsSuperAdmin(true)
      fetchRequests()
      setLoading(false)
    }

    async function fetchRequests() {
      const { data, error } = await supabase
        .from('role_requests')
        .select('*')
        .eq('status', 'pending')
      
      if (data) {
        setRequests(data)
      }
    }

    checkSuperAdmin()
  }, [router, supabase])

  async function handleApprove(requestId: string, userId: string, appName: string, role: string) {
    // Add to user_roles table
    await supabase.from('user_roles').insert([{ user_id: userId, app_name: appName, role: role }])
    // Update status in role_requests table
    await supabase.from('role_requests').update({ status: 'approved' }).eq('id', requestId)
    // Refresh requests
    setRequests(requests.filter(req => req.id !== requestId))
  }

  async function handleReject(requestId: string) {
    // Update status in role_requests table
    await supabase.from('role_requests').update({ status: 'rejected' }).eq('id', requestId)
    // Refresh requests
    setRequests(requests.filter(req => req.id !== requestId))
  }

  if (loading) {
    return <p>Loading...</p>
  }

  if (!isSuperAdmin) {
    return <p>Unauthorized</p>
  }

  return (
    <div>
      <h1>Super Admin Dashboard</h1>
      <h2>Pending Role Requests</h2>
      <table>
        <thead>
          <tr>
            <th>User ID</th>
            <th>App</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(request => (
            <tr key={request.id}>
              <td>{request.user_id}</td>
              <td>{request.requested_app}</td>
              <td>{request.requested_role}</td>
              <td>
                <button onClick={() => handleApprove(request.id, request.user_id, request.requested_app, request.requested_role)}>Approve</button>
                <button onClick={() => handleReject(request.id)}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
