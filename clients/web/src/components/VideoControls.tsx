type Props = {
  onPrev?: () => void
  onNext?: () => void
  onLike?: () => void
  onAccount?: () => void
  onToggleMute?: () => void
  isMuted?: boolean
  likes?: number
  liked?: boolean
}

export default function VideoControls({ onPrev, onNext, onLike, onAccount, onToggleMute, isMuted, likes, liked}: Props) {
  const emit = (name: string) => {
    try { window.dispatchEvent(new Event(name)) } catch {}
  }

  console.log(likes)

  const buttonStyle = {
    width: 50,
    height: 50,
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',           // enable flex
    justifyContent: 'center',  // center horizontally
    alignItems: 'center',      // center vertically
    fontSize: '20px',          // optional: make the emoji bigger
    lineHeight: 1
  } as const

  return (
    <div style={{position: "relative", display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 10, left:210, top:-150}}>
      <button
        onClick={() => {
          onToggleMute?.()
          emit('app:toggleMute')

          try {
            const videos = Array.from(document.querySelectorAll('video')) as HTMLVideoElement[]
            if (videos.length) {
              const currentMuted = videos[0].muted
              const newMuted = !currentMuted
              videos.forEach(v => {
                try { v.muted = newMuted } catch {}
                if (!newMuted) v.play().catch(() => {})
              })
            }
          } catch {}
        }}
        style={{width: 50,
                height: 50,
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#007bff',
                color: 'white',
                cursor: 'pointer',
                margin: '150px',
                display: 'flex',           // enable flex
                justifyContent: 'center',  // center horizontally
                alignItems: 'center',      // center vertically
                fontSize: '20px', 
              }}
      >
        {isMuted ? '🔈' : '🔊'}
      </button>

      <button
        onClick={() => { onAccount?.(); emit('app:account') }}
        style={buttonStyle}
      >
        Acc
      </button>

      {/* LIKE BUTTON + COUNTER */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <button
          onClick={() => { onLike?.(); emit('app:like') }}
          style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',           // enable flex
            justifyContent: 'center',  // center horizontally
            alignItems: 'center',      // center vertically
            fontSize: '20px',
            backgroundColor: liked ? '#007b55' : '#007bff'
          }}
        >
          ❤️
        </button>

        <span style={{ color: 'black', fontSize: 14 }}>
          {likes}
        </span>
      </div>

      <button
        onClick={() => { onPrev?.(); emit('app:prev') }}
        style={buttonStyle}
      >
        ⬆
      </button>

      <button
        onClick={() => { onNext?.(); emit('app:next') }}
        style={buttonStyle}
      >
        ⬇
      </button>

    </div>
  )
}
