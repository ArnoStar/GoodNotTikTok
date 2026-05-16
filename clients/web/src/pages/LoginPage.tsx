import { Link, useNavigate } from 'react-router-dom'
import LoginForm from '../components/forms/LoginForm'

export default function LoginPage() {
  const navigate = useNavigate()

  return (
    <div className="page-center">
      <LoginForm
        onSuccess={() => navigate('/')}
      />

      <Link to="/signup">
        Sign up
      </Link>
    </div>
  )
}