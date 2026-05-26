import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type Comment = {
  id?: number
  user_id?: number
  text: string
}

type UserProfile = {
  id: number
  email: string
  img?: string | null
}

type Props = {
  onPrev?: () => void
  onNext?: () => void
  onLike?: () => void
  onAccount?: () => void
  onToggleMute?: () => void
  isMuted?: boolean
  likes?: number
  liked?: boolean
  userId?: number | string
  videoId?: string
}

export default function VideoControls({
  onPrev,
  onNext,
  onLike,
  onToggleMute,
  isMuted,
  likes,
  liked,
  userId,
  videoId
}: Props) {

  const navigate = useNavigate()
  const { token } = useAuth()

  const [comments, setComments] = useState<Comment[]>([])
  const [usersCache, setUsersCache] = useState<Record<number, UserProfile>>({})
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)

  const buttonStyle = {
    width: 50,
    height: 50,
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#1b1f24',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '20px'
  } as const

  // ---------------- LOAD COMMENTS ----------------
  useEffect(() => {
    if (!videoId) return

    fetch(`/api/video/${videoId}/comment`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setComments(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [videoId, token])

  // ---------------- LOAD USER PROFILES ----------------
  useEffect(() => {
    if (!comments.length) return

    const uniqueIds = [
      ...new Set(comments.map(c => c.user_id).filter(Boolean))
    ] as number[]

    uniqueIds.forEach(async (id) => {
      if (usersCache[id]) return

      try {
        const res = await fetch(`/api/video/profile/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data: UserProfile = await res.json()

        setUsersCache(prev => ({
          ...prev,
          [id]: data
        }))
      } catch {}
    })
  }, [comments, token])

  // ---------------- SEND COMMENT ----------------
  async function sendComment() {
    if (!videoId || !text.trim()) return

    const res = await fetch(`/api/video/${videoId}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ text })
    })

    if (res.ok) {
      setText('')

      const updated = await fetch(`/api/video/${videoId}/comment`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await updated.json()
      setComments(Array.isArray(data) ? data : [])
    }
  }

  return (
    <div style={{
      position: 'fixed',
      right: 20,
      bottom: 120,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      zIndex: 99999,
      pointerEvents: 'auto'
    }}>

      {/* MUTE */}
      <button onClick={onToggleMute} style={buttonStyle}>
        {isMuted ? '🔈' : '🔊'}
      </button>

      {/* ACCOUNT */}
      <button
        onClick={() => userId && navigate(`/profile/${userId}`)}
        style={buttonStyle}
      >
        👤
      </button>

      {/* LIKE */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
        <button
          onClick={onLike}
          style={{
            ...buttonStyle,
            backgroundColor: liked ? '#0f9d58' : '#1b1f24'
          }}
        >
          ❤️
        </button>

        <span style={{ color: 'white', fontSize: 14 }}>
          {likes ?? 0}
        </span>
      </div>

      {/* COMMENTS BUTTON */}
      <button onClick={() => setOpen(v => !v)} style={buttonStyle}>
        💬
      </button>

      {/* PREV */}
      <button onClick={onPrev} style={buttonStyle}>⬆</button>

      {/* NEXT */}
      <button onClick={onNext} style={buttonStyle}>⬇</button>

      {/* ---------------- COMMENT PANEL ---------------- */}
      {open && (
        <div style={{
          position: 'fixed',
          right: 90,
          bottom: 120,
          width: 320,
          height: 380,
          background: '#11151b',
          border: '1px solid #2a2f38',
          borderRadius: 12,
          display: 'flex',
          flexDirection: 'column',
          padding: 10,
          gap: 10,
          color: 'white'
        }}>
          <div style={{ fontWeight: 700 }}>Комментарии</div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {comments.map((c, i) => {
              const user = c.user_id ? usersCache[c.user_id] : null

              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 8,
                    padding: 8,
                    borderBottom: '1px solid #222',
                    fontSize: 13
                  }}
                >
                  {/* AVATAR */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      background: '#333',
                      flexShrink: 0
                    }}
                  >
                    {user?.img ? (
                      <img
                        src={`/stream/${user.img}`}
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
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        👤
                      </div>
                    )}
                  </div>

                  {/* TEXT */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 11, opacity: 0.7 }}>
                      {user?.email ?? 'unknown'}
                    </span>
                    <span>{c.text}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* INPUT */}
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Комментарий..."
              style={{
                flex: 1,
                padding: 6,
                borderRadius: 6,
                border: '1px solid #333',
                background: '#0f1115',
                color: 'white'
              }}
            />

            <button onClick={sendComment} style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: 'none',
              background: '#0f9d58',
              color: 'white',
              cursor: 'pointer'
            }}>
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  )
}