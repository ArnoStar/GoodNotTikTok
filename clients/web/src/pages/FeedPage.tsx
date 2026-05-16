import { useNavigate } from 'react-router-dom'
import Feed from '../components/Feed'
import { useAuth } from '../context/AuthContext'

export default function FeedPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  return (
    <div>
      <div
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 100
        }}
      >
        <button
          onClick={() => {
            logout()
            navigate('/login')
          }}
        >
          Logout
        </button>
      </div>

      <div
        style={{
          position: 'fixed',
          top: 20,
          left: 20,
          zIndex: 100
        }}
      >
        <button
          onClick={() => navigate('/upload')}
        >
          Upload
        </button>
      </div>

      <Feed />
    </div>
  )
}