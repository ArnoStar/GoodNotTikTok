import { useEffect, useState } from 'react'
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
  const { logout, token } = useAuth()

  const [me, setMe] = useState<Me | null>(null)

  const [mode, setMode] =
    useState<'for_you' | 'following' | 'friends'>('for_you')

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!res.ok) return

        const data = await res.json()
        setMe(data)
      } catch (err) {
        console.error(err)
      }
    }

    fetchMe()
  }, [token])

  const buttonStyle = (active: boolean) => ({
    padding: '10px 16px',
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.12)',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
    transition: '0.2s',
    color: active ? 'black' : 'white',
    background: active
      ? 'white'
      : 'rgba(27,31,36,0.7)',
    backdropFilter: 'blur(10px)'
  })

  return (
    <div
      style={{
        background: '#0f1115',
        minHeight: '100vh'
      }}
    >
      {/* TOP BAR LEFT */}
      <div
        style={{
          position: 'fixed',
          top: 20,
          left: 20,
          zIndex: 9999,
          display: 'flex',
          gap: 10
        }}
      >
        <button
          onClick={() => navigate('/upload')}
          style={{
            padding: '12px 18px',
            borderRadius: 14,
            border: 'none',
            cursor: 'pointer',
            background:
              'linear-gradient(135deg, #4da6ff, #0066ff)',
            color: 'white',
            fontWeight: 700
          }}
        >
          Загрузить
        </button>
      </div>

      {/* PROFILE */}
      <div
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          alignItems: 'flex-end'
        }}
      >
        <button
          onClick={() => {
            if (!me) return
            navigate(`/profile/${me.id}`)
          }}
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid #4da6ff',
            padding: 0,
            cursor: 'pointer',
            background: '#1b1f24'
          }}
        >
          {me?.image ? (
            <img
              src={`/stream/${me.image}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div
              style={{
                color: 'white',
                fontSize: 26
              }}
            >
              👤
            </div>
          )}
        </button>

        <button
          onClick={() => {
            logout()
            navigate('/login')
          }}
          style={{
            padding: '10px 14px',
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            background:
              'linear-gradient(135deg, #ff4d4d, #cc0000)',
            color: 'white',
            fontWeight: 700,
            fontSize: 13
          }}
        >
          Выйти
        </button>
      </div>

      {/* MODE SELECTOR (CENTER TOP) */}
      <div
        style={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          display: 'flex',
          gap: 10,
          padding: 6,
          borderRadius: 999,
          background: 'rgba(27,31,36,0.6)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <button
          style={buttonStyle(mode === 'for_you')}
          onClick={() => setMode('for_you')}
        >
          Для тебя
        </button>

        <button
          style={buttonStyle(mode === 'following')}
          onClick={() => setMode('following')}
        >
          Подписки
        </button>

        <button
          style={buttonStyle(mode === 'friends')}
          onClick={() => setMode('friends')}
        >
          Друзья
        </button>
      </div>

      {/* FEED */}
      <Feed mode={mode} />
    </div>
  )
}