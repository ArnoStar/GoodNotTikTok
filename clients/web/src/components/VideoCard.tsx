import {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle
} from 'react'
import { useNavigate } from 'react-router-dom'

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

const VideoCard = forwardRef<
  VideoCardHandle,
  Props
>(
(
  {
    video,
    active,
    onLike,
    onDislike,
    onNext,
    onPrev,
    onAccount,
    likes
  },
  ref
) => {
  const navigate = useNavigate()

  const vref =
    useRef<HTMLVideoElement | null>(null)

  const [muted, setMuted] =
    useState(false)

  const [localLikes, setLocalLikes] =
    useState(likes ?? 0)

  useEffect(() => {
    setLocalLikes(likes ?? 0)
  }, [likes])

  useImperativeHandle(ref, () => ({
    play: async () => {
      try {
        await vref.current?.play()
      } catch {}
    },

    pause: () => {
      vref.current?.pause()
    },

    toggleMute: () => {
      if (!vref.current) return

      vref.current.muted =
        !vref.current.muted

      setMuted(vref.current.muted)
    },

    setMuted: (m: boolean) => {
      if (!vref.current) return

      vref.current.muted = m

      setMuted(m)
    },

    isMuted: () => {
      return !!vref.current?.muted
    },

    like: () => {
      onLike?.()

      setLocalLikes((l) => l + 1)
    },

    dislike: () => {
      onDislike?.()

      setLocalLikes((l) =>
        Math.max(0, l - 1)
      )
    },

    next: () => {
      onNext?.()
    },

    prev: () => {
      onPrev?.()
    },

    account: () => {
      onAccount?.()
    }
  }))

  useEffect(() => {
    const el = vref.current

    if (!el) return

    const streamUrl =
      `/stream/${video.id}.mp4`

    if (active) {
      el.muted = muted

      el.src = streamUrl

      try {
        el.preload = 'auto'

        el.load()
      } catch {}

      el.play().catch(() => {})
    } else {
      try {
        el.pause()
      } catch {}

      try {
        el.removeAttribute('src')

        el.load()
      } catch {}
    }

    return () => {
      try {
        el.pause()
      } catch {}

      try {
        el.removeAttribute('src')

        el.load()
      } catch {}
    }
  }, [
    active,
    video.id,
    muted
  ])

  return (
    <div
      className={`video-card ${
        active ? 'active' : ''
      }`}
    >
      <video
        ref={vref}
        loop
        playsInline
        preload="auto"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          backgroundColor: 'black'
        }}
      />

      <div className="meta">
        <div
          className="author"
          onClick={() =>
            navigate(
              `/profile/${video.id}`
            )
          }
          style={{ cursor: 'pointer' }}
        >
          @{video.author ?? 'unknown'}
        </div>

        <div className="caption">
          {video.caption ?? ''}
        </div>

        <div>
          ❤️ {localLikes}
        </div>
      </div>
    </div>
  )
})

export default VideoCard