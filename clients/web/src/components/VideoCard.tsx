import {
  useRef,
  useEffect,
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
    added_by_id?: number  
  }

  active: boolean
  likes?: number
}

export type VideoCardHandle = {
  play: () => Promise<void>
  pause: () => void
  toggleMute: () => void
  isMuted: () => boolean
}

const VideoCard = forwardRef<VideoCardHandle, Props>(
(
  { video, active },
  ref
) => {
  const navigate = useNavigate()
  const vref = useRef<HTMLVideoElement | null>(null)

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
      vref.current.muted = !vref.current.muted
    },

    isMuted: () => {
      return !!vref.current?.muted
    }
  }))

  useEffect(() => {
    const el = vref.current
    if (!el) return

    const src = `/stream/${video.id}.mp4`

    el.pause()
    el.src = src
    el.load()

    if (active) {
      el.play().catch(() => {})
    }
  }, [active, video.id])

  return (
    <div className={`video-card ${active ? 'active' : ''}`}>
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

      <div className="meta" style={{ padding: 10 }}>
        <div
          onClick={() =>
            video.added_by_id && navigate(`/profile/${video.added_by_id}`)
          }
          style={{
            cursor: 'pointer',
            fontWeight: 600,
            color: '#4da6ff'
          }}
        >
          @{video.author ?? 'неизвестно'}
        </div>

        <div style={{ marginTop: 5 }}>
          {video.caption ?? 'Без описания'}
        </div>
      </div>
    </div>
  )
})

export default VideoCard