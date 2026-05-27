import { useNavigate } from 'react-router-dom'
import type { Video } from '../../types/profile'

type Props = {
  videos: Video[]
}

export default function ProfileVideos({
  videos
}: Props) {
  const navigate = useNavigate()

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 15,
        padding: 20
      }}
    >
      {videos.map((v) => (
        <div
          key={v.id}
          onClick={() => {
            navigate(`/?watch=${v.id}`)
          }}
          style={{
            width: '100%',
            aspectRatio: '9 / 16',
            background: '#111',
            borderRadius: 14,
            overflow: 'hidden',
            cursor: 'pointer'
          }}
        >
          <video
            src={`/stream/${v.id}.mp4`}
            muted
            preload="metadata"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              background: '#000'
            }}
            onLoadedMetadata={(e) => {
              e.currentTarget.currentTime = 0.1
            }}
            onMouseEnter={(e) => {
              e.currentTarget.play().catch(() => {})
            }}
            onMouseLeave={(e) => {
              e.currentTarget.pause()
            }}
          />
        </div>
      ))}
    </div>
  )
}