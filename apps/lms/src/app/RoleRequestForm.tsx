'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'

export default function RoleRequestForm({ userId, appName }: { userId: string, appName: string }) {
  const supabase = createClient()
  const [requestedRole, setRequestedRole] = useState('student')
  const [message, setMessage] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const { error } = await supabase.from('role_requests').insert([
      { user_id: userId, requested_app: appName, requested_role: requestedRole },
    ])

    if (error) {
      setMessage('Error submitting request: ' + error.message)
    } else {
      setMessage('Request submitted successfully. Please wait for admin approval.')
    }
  }

  return (
    <div>
      <h3>Request a Role</h3>
      <form onSubmit={handleSubmit}>
        <label htmlFor="role">Select a role:</label>
        <select
          id="role"
          value={requestedRole}
          onChange={(e) => setRequestedRole(e.target.value)}
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher / Instructor</option>
        </select>
        <button type="submit">Submit Request</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  )
}
