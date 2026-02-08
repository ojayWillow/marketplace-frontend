import { Navigate } from 'react-router-dom';

// Register now redirects to the unified login page
// Phone auth handles both login and registration automatically
export default function Register() {
  return <Navigate to="/login" replace />;
}
