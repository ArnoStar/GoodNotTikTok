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
    <div
      style={{
        background: '#0f1115',
        minHeight: '100vh'
      }}
    >

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
            width: 60,
            height: 60,

            borderRadius: '50%',

            overflow: 'hidden',

            border: '2px solid #4da6ff',

            padding: 0,

            cursor: 'pointer',

            background: '#1b1f24',

            boxShadow:
              '0 4px 15px rgba(0,0,0,0.4)',

            transition: '0.2s'
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
                fontSize: 26
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
          top: 95,
          right: 20,
          zIndex: 9999
        }}
      >
        <button
          onClick={() => {
            logout()
            navigate('/login')
          }}
          style={{
            padding: '12px 18px',

            borderRadius: 14,

            border: 'none',

            cursor: 'pointer',

            background:
              'linear-gradient(135deg, #ff4d4d, #cc0000)',

            color: 'white',

            fontWeight: 700,

            fontSize: 14,

            boxShadow:
              '0 4px 15px rgba(0,0,0,0.35)',

            transition: '0.2s'
          }}
        >
          Выйти
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
          style={{
            padding: '14px 20px',

            borderRadius: 14,

            border: 'none',

            cursor: 'pointer',

            background:
              'linear-gradient(135deg, #4da6ff, #0066ff)',

            color: 'white',

            fontWeight: 700,

            fontSize: 15,

            boxShadow:
              '0 4px 15px rgba(0,0,0,0.35)',

            transition: '0.2s'
          }}
        >
          Загрузить
        </button>
      </div>

      <Feed />
    </div>
  )
}