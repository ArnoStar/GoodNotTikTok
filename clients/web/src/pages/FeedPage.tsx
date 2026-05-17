import {
  useEffect,
  useState
} from 'react'

import { useNavigate } from 'react-router-dom'

import Feed from '../components/Feed'

import { useAuth } from '../context/AuthContext'

type Me = {
  id: number
  email: string
  image?: string
}

export default function FeedPage() {
  const navigate = useNavigate()

  const { logout, token } =
    useAuth()

  const [me, setMe] =
    useState<Me | null>(null)

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch(
          '/api/auth/me',
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        )

        if (!res.ok) return

        const data = await res.json()

        setMe(data)

      } catch (err) {
        console.error(err)
      }
    }

    fetchMe()
  }, [token])

  return (
    <div>

      {/* PROFILE BUTTON */}

      <div
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999
        }}
      >
        <button
          onClick={() => {
            if (!me) return

            navigate(
              `/profile/${me.id}`
            )
          }}
          style={{
            width: 55,
            height: 55,

            borderRadius: '50%',

            overflow: 'hidden',

            border: '2px solid white',

            padding: 0,

            cursor: 'pointer',

            background: '#111'
          }}
        >
          {me?.image ? (
            <img
              src={`/stream/${me.image}`}
              alt="profile"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',

                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',

                color: 'white',
                fontSize: 24
              }}
            >
              👤
            </div>
          )}
        </button>
      </div>

      {/* LOGOUT */}

      <div
        style={{
          position: 'fixed',
          top: 90,
          right: 20,
          zIndex: 9999
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

      {/* UPLOAD */}

      <div
        style={{
          position: 'fixed',
          top: 20,
          left: 20,
          zIndex: 9999
        }}
      >
        <button
          onClick={() =>
            navigate('/upload')
          }
        >
          Upload
        </button>
      </div>

      <Feed />
    </div>
  )
}