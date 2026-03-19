import { useState, useEffect, useRef } from 'react'
import VideoCard from './VideoCard'
import type { VideoCardHandle } from './VideoCard'
import { useAuth } from '../App'
import VideoControls from './VideoControls'

type Video = {
  id: string
  url?: string
  added_by?: { id: number }
  caption?: string
  likes?: number
  liked?: boolean
}

export type FeedHandle = {
  prev: () => void
  next: () => void
  toggleMute: () => void
  like: () => void
  isMuted: () => boolean
}

export default function Feed() {
  const [videos, setVideos] = useState<Video[]>([])
  const [index, setIndex] = useState(0)
  const auth = useAuth()
  const vcRef = useRef<VideoCardHandle | null>(null)
  const [muted, setMuted] = useState(true)

  // Fetch one random video
  async function fetchVideo(): Promise<Video | null> {
    try {
      const res = await fetch('/api/video/')
      if (!res.ok) return null
      const v = await res.json()

      // get likes
      const likeRes = await fetch(`/api/video/${v.id}/like`)
      const likes = likeRes.ok ? Number(await likeRes.json()) : 0

      const likedRes = await fetch(`/api/video/${v.id}/like_state`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${auth.token}` }
          })

      const liked = likeRes.ok ? Boolean(await likedRes.json()) : false

      return {
        id: v.id,
        url: `/stream/${v.id}.mp4`,
        caption: v.caption,
        likes,
        liked
      }
    } catch {
      return null
    }
  }

  // Load initial buffer (5 videos)
  async function loadInitial() {
    const arr: Video[] = []
    const ids = new Set()

    while (arr.length < 5) {
      const v = await fetchVideo()
      if (!v || ids.has(v.id)) continue
      
      ids.add(v.id)
      arr.push(v) 
    }

    setVideos(arr)
    setIndex(2) // start in the middle
  }

  useEffect(() => {
    loadInitial()
  }, [])

  // Scroll wheel navigation
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) next()
      else prev()
    }

    window.addEventListener('wheel', onWheel)
    return () => window.removeEventListener('wheel', onWheel)
  }, [index, videos])

  async function like(id: string) {
    if (!auth.token) return

    setVideos(v =>
      v.map(video => {
        if (video.id !== id) return video

        const alreadyLiked = video.liked

        if (alreadyLiked) {
          fetch(`/api/video/${id}/dislike`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${auth.token}` }
          })

          return {
            ...video,
            liked: false,
            likes: Math.max(0, (video.likes ?? 0) - 1)
          }
        }

        fetch(`/api/video/${id}/like`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${auth.token}` }
        })

        return {
          ...video,
          liked: true,
          likes: (video.likes ?? 0) + 1
        }
      })
    )
  }


  function prev() {
    setIndex(i => Math.max(0, i - 1))
  }

  async function next() {
    if (index < 2) {
      setIndex(i => Math.min(videos.length - 1, i + 1))
      return
    }

    const newVideo = await fetchVideo()
    if (!newVideo) return

    setVideos(prev => {
      const updated = [...prev.slice(1), newVideo]
      return updated
    })
    
    setIndex(2)
  }

  // Global controls
  useEffect(() => {
    const onPrev = () => prev()
    const onNext = () => next()

    const onToggleMute = () => {
      const current = vcRef.current
      if (!current) return
      current.toggleMute?.()
      const isMuted = current.isMuted?.() ?? true
      setMuted(isMuted)
    }

    const onLike = () => {
      const id = videos[index]?.id
      if (id) like(id)
    }

    window.addEventListener('app:prev', onPrev)
    window.addEventListener('app:next', onNext)
    window.addEventListener('app:toggleMute', onToggleMute)
    window.addEventListener('app:like', onLike)

    return () => {
      window.removeEventListener('app:prev', onPrev)
      window.removeEventListener('app:next', onNext)
      window.removeEventListener('app:toggleMute', onToggleMute)
      window.removeEventListener('app:like', onLike)
    }
  }, [videos, index])

  return (
    <div className="feed">

      {videos.map((v, i) => (
        <VideoCard
          key={`${v.id}-${i}`}
          ref={i === index ? vcRef : null}
          video={{ ...v, url: v.url || `/stream/${v.id}.mp4` }}
          active={i === index}
          onLike={() => like(v.id)}
          likes={videos[index]?.likes ?? 0}
        />
      ))}
      <VideoControls isMuted={muted} liked={videos[index]?.liked} likes={videos[index]?.likes ?? 0 } />
    </div>
  )
}