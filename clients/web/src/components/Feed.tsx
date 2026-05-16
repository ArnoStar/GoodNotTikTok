import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import VideoCard from './VideoCard'
import type { VideoCardHandle } from './VideoCard'
import { useAuth } from '../context/AuthContext'
import VideoControls from './VideoControls'

type Video = {
  id: string
  url?: string
  added_by?: { id: number }
  caption?: string
  likes?: number
  liked?: boolean
}

export default function Feed() {
  const auth = useAuth()
  const vcRef = useRef<VideoCardHandle | null>(null)

  const [videos, setVideos] = useState<Video[]>([])
  const [muted, setMuted] = useState(true)

  const [searchParams, setSearchParams] = useSearchParams()
  const watchId = searchParams.get('watch')

  // ---------------- FETCH ----------------
  async function fetchRandom(): Promise<Video | null> {
    const res = await fetch('/api/video/')
    if (!res.ok) return null

    const v = await res.json()

    const likeRes = await fetch(`/api/video/${v.id}/like`)
    const likes = likeRes.ok ? Number(await likeRes.json()) : 0

    const likedRes = await fetch(`/api/video/${v.id}/like_state`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    })

    const liked = likedRes.ok
      ? Boolean(await likedRes.json())
      : false

    return {
      id: v.id,
      url: `/stream/${v.id}.mp4`,
      caption: v.caption,
      likes,
      liked,
      added_by: { id: v.added_by_id }
    }
  }

  async function fetchById(id: string): Promise<Video | null> {
    const res = await fetch(`/api/video/${id}`)
    if (!res.ok) return null

    const v = await res.json()

    return {
      id: v.id,
      url: `/stream/${v.id}.mp4`,
      caption: v.caption,
      likes: 0,
      liked: false,
      added_by: { id: v.added_by_id }
    }
  }

  // ---------------- INIT ----------------
  useEffect(() => {
    async function init() {
      const arr: Video[] = []

      if (watchId) {
        const watched = await fetchById(watchId)
        if (watched) arr.push(watched)
      }

      while (arr.length < 5) {
        const v = await fetchRandom()
        if (!v) continue
        if (arr.find(x => x.id === v.id)) continue
        arr.push(v)
      }

      setVideos(arr)

      if (!watchId && arr.length >= 3) {
        setSearchParams({ watch: arr[2].id }, { replace: true })
      }
    }

    init()
  }, [])

  // ---------------- INDEX (always derived from URL) ----------------
  const index = videos.findIndex(v => v.id === watchId)
  const safeIndex = index === -1 ? 2 : index

  // ---------------- UPDATE URL ONLY ----------------
  const setCurrent = useCallback((id: string) => {
    setSearchParams({ watch: id }, { replace: true })
  }, [])

  // ---------------- LIKE FIX (IMPORTANT) ----------------
  const toggleLike = useCallback((videoId: string) => {
    setVideos(prev =>
      prev.map(v => {
        if (v.id !== videoId) return v

        const nextLiked = !v.liked
        const nextLikes = (v.likes ?? 0) + (nextLiked ? 1 : -1)

        if (v.liked) {
          fetch(`/api/video/${videoId}/dislike`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${auth.token}` }
          })
        } else {
          fetch(`/api/video/${videoId}/like`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${auth.token}` }
          })
        }

        return {
          ...v,
          liked: nextLiked,
          likes: Math.max(0, nextLikes)
        }
      })
    )
  }, [auth.token])

  // ---------------- NAV ----------------
  const prev = useCallback(() => {
    const prevVideo = videos[safeIndex - 1]
    if (prevVideo) setCurrent(prevVideo.id)
  }, [videos, safeIndex, setCurrent])

  const next = useCallback(async () => {
    const nextVideo = videos[safeIndex + 1]

    if (nextVideo) {
      setCurrent(nextVideo.id)
      return
    }

    const v = await fetchRandom()
    if (!v) return

    setVideos(prev => [...prev.slice(1), v])
    setCurrent(v.id)
  }, [videos, safeIndex])

  // ---------------- GLOBAL EVENTS ----------------

  // ---------------- RENDER ----------------
  return (
    <div className="feed">
      {videos.map((v, i) => (
        <VideoCard
          key={v.id}
          ref={i === safeIndex ? vcRef : null}
          video={{
            ...v,
            url: v.url || `/stream/${v.id}.mp4`
          }}
          active={i === safeIndex}
        />
      ))}

      <VideoControls
        isMuted={muted}
        liked={videos[safeIndex]?.liked}
        likes={videos[safeIndex]?.likes ?? 0}
        userId={videos[safeIndex]?.added_by?.id}
        onPrev={prev}
        onNext={next}
        onLike={() => {
          const id = videos[safeIndex]?.id
          if (id) toggleLike(id)
        }}
        onToggleMute={() => {
          const player = vcRef.current
          if (!player) return
          player.toggleMute()
          setMuted(player.isMuted())
        }}
      />
    </div>
  )
}