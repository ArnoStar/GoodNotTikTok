import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'

type Props = {
  video: {
    id: string
    url: string
    author?: string
    caption?: string
  }
  active: boolean
  onLike?: () => void
  onDislike?: () => void
  onNext?: () => void
  onPrev?: () => void
  onAccount?: () => void
  likes?: number
}

export type VideoCardHandle = {
  play: () => Promise<void>
  pause: () => void
  toggleMute: () => void
  setMuted: (m: boolean) => void
  isMuted: () => boolean
  like: () => void
  next: () => void
  prev: () => void
  account: () => void
}



const VideoCard = forwardRef<VideoCardHandle, Props>(
({ video, active, onLike, onDislike, onNext, onPrev, onAccount, likes }, ref) => {

  const vref = useRef<HTMLVideoElement | null>(null)
  const [muted, setMuted] = useState(false)
  const [localLikes, setLocalLikes] = useState(likes ?? 0) // ✅ local state

  console.log(localLikes)

  // Update localLikes whenever likes prop changes
  useEffect(() => {
    setLocalLikes(likes ?? 0)
  }, [likes])

  useImperativeHandle(ref, () => ({
    play: async () => { try { await vref.current?.play() } catch {} },
    pause: () => { vref.current?.pause() },
    toggleMute: () => {
      if (!vref.current) return
      vref.current.muted = !vref.current.muted
      setMuted(vref.current.muted)
    },
    setMuted: (m: boolean) => {
      if (!vref.current) return
      vref.current.muted = m
      setMuted(m)
    },
    isMuted: () => !!vref.current?.muted,
    like: () => {
      onLike?.()
      setLocalLikes(l => l + 1) // immediate UI feedback
    },
    dislike: () => {
      onDislike?.()
      setLocalLikes(l => Math.max(0, l - 1)) // immediate UI feedback
    },
    next: () => onNext?.(),
    prev: () => onPrev?.(),
    account: () => onAccount?.(),
  }), [onLike, onDislike, onNext, onPrev, onAccount])

  // video playback logic...
  useEffect(() => {
    const el = vref.current
    if (!el) return

    const streamUrl = (() => {
      try {
        if (video.url && (video.url.startsWith('http://') || video.url.startsWith('https://'))) {
          const origin = new URL(video.url).origin
          return `${origin}/stream/${video.id}.mp4`
        }
      } catch {}
      return `/stream/${video.id}.mp4`
    })()

    if (active) {
      el.muted = muted
      el.src = streamUrl
      try { el.preload = 'auto'; el.load() } catch {}
      el.play().catch(() => {})
    } else {
      try { el.pause() } catch {}
      try { el.removeAttribute('src'); el.load() } catch {}
    }

    return () => {
      try { el.pause() } catch {}
      try { el.removeAttribute('src'); el.load() } catch {}
    }
  }, [active, video.id, video.url, muted])

  return (
    <div className={`video-card ${active ? 'active' : ''}`}
         style={{objectFit: 'contain',display: 'block'}}>
      <video
        ref={vref}
        loop
        playsInline
        preload="auto"
        style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: 'black' }}
      />
      {/*<VideoControls
        onLike={() => {
          onLike?.()
          setLocalLikes(l => l + 1) // also update UI immediately
        }}
        onPrev={onPrev}
        onNext={onNext}
        onAccount={onAccount}
        likes={likes} // pass the updated localLikes
      />*/}
      <div className="meta">
        <div className="author">@{video.author ?? 'unknown'}</div>
        <div className="caption">{video.caption ?? ''}</div>
      </div>
    </div>
  )
})

export default VideoCard
