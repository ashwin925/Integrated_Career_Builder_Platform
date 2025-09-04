import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import RoleRequestForm from './RoleRequestForm'

export default async function Page() {
  const cookieStore = cookies()
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('http://localhost:3000')
  }

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', session.user.id)
    .eq('app_name', 'jr')
    .single()

  return (
    <div>
      {roleData ? (
        <h1>
          Welcome, {roleData.role} ({session.user.email})
        </h1>
      ) : (
        <div>
          <h1>Welcome, {session.user.email}</h1>
          <p>You don't have a role assigned for the JR application yet.</p>
          <RoleRequestForm userId={session.user.id} appName="jr" />
        </div>
      )}
    </div>
  )
}