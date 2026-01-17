import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Register page - Redirects to Phone Login
 * 
 * New users must register with phone verification for security.
 * Existing users can still login with email at /login.
 * 
 * This redirect ensures backward compatibility with any links to /register.
 */
export default function Register() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to phone login for new registrations
    navigate('/phone-login', { replace: true })
  }, [navigate])

  // Show nothing while redirecting
  return null
}
