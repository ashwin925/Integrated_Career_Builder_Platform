import Link from 'next/link'

export default function AuthCodeError() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <h1>Authentication Error</h1>
      <p>Sorry, we couldn't sign you in. Please try again.</p>
      <Link href="/">
        Return to Login Page
      </Link>
    </div>
  )
}
