import { Link } from 'react-router-dom'
import ConfirmForm from '../components/forms/ConfirmForm'

export default function ConfirmPage() {
  return (
    <div className="page-center">
      <ConfirmForm />

      <Link to="/login">
        Back to login
      </Link>
    </div>
  )
}