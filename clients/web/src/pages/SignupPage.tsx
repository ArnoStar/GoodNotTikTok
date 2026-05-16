import { Link, useNavigate } from 'react-router-dom'
import SignupForm from '../components/forms/SignupForm'

export default function SignupPage() {
  const navigate = useNavigate()

  return (
    <div className="page-center">
      <SignupForm
        onSigned={() => navigate('/confirm')}
      />

      <Link to="/login">
        Back to login
      </Link>
    </div>
  )
}