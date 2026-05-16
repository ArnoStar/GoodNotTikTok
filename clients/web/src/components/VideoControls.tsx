import { useNavigate } from 'react-router-dom'

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
}

export default function VideoControls({
  onPrev,
  onNext,
  onLike,
  onAccount,
  onToggleMute,
  isMuted,
  likes,
  liked,
  userId
}: Props) {

  const navigate = useNavigate()

  const emit = (name: string) => {
    try {
      window.dispatchEvent(
        new Event(name)
      )
    } catch {}
  }

  const buttonStyle = {
    width: 50,
    height: 50,

    borderRadius: '50%',

    border: 'none',

    backgroundColor:
      '#1b1f24',

    color: 'white',

    cursor: 'pointer',

    display: 'flex',

    justifyContent: 'center',

    alignItems: 'center',

    fontSize: '20px'
  } as const

  return (
    <div
      style={{
        position: 'fixed',

        right: 20,

        bottom: 120,

        display: 'flex',

        flexDirection: 'column',

        gap: 12,

        zIndex: 100
      }}
    >

      {/* MUTE */}

      <button
        onClick={() => {
          onToggleMute?.()

          emit('app:toggleMute')
        }}
        style={buttonStyle}
      >
        {isMuted ? '🔈' : '🔊'}
      </button>

      {/* ACCOUNT */}

      <button
        onClick={() => {
          if (!userId) return

          navigate(`/profile/${userId}`)
        }}
        style={buttonStyle}
      >
        👤
      </button>

      {/* LIKE */}

      <div
        style={{
          display: 'flex',

          flexDirection: 'column',

          alignItems: 'center',

          gap: 5
        }}
      >
        <button
          onClick={() => {
            onLike?.()

            emit('app:like')
          }}
          style={{
            ...buttonStyle,

            backgroundColor:
              liked
                ? '#0f9d58'
                : '#1b1f24'
          }}
        >
          ❤️
        </button>

        <span
          style={{
            color: 'white',
            fontSize: 14
          }}
        >
          {likes ?? 0}
        </span>
      </div>

      {/* PREV */}

      <button
        onClick={() => {
          onPrev?.()

          emit('app:prev')
        }}
        style={buttonStyle}
      >
        ⬆
      </button>

      {/* NEXT */}

      <button
        onClick={() => {
          onNext?.()

          emit('app:next')
        }}
        style={buttonStyle}
      >
        ⬇
      </button>

    </div>
  )
}