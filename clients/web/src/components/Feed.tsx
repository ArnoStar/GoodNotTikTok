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
  added_by_id?: number 
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
      added_by_id: v.added_by_id
    }
  }

  async function fetchById(id: string): Promise<Video | null> {
    const res = await fetch(`/api/video/${id}`)
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
      added_by_id: v.added_by_id
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
    <div
      className="feed"
      style={{
        position: 'relative',

        width: '100%',
        height: '100vh',

        overflow: 'hidden',

        background:
          'linear-gradient(180deg, #0f1115 0%, #090b0f 100%)'
      }}
    >

      {/* HEADER */}

      <div
        style={{
          position: 'fixed',

          top: 18,
          left: '50%',

          transform: 'translateX(-50%)',

          zIndex: 9999,

          padding: '10px 22px',

          borderRadius: 18,

          background:
            'rgba(27,31,36,0.85)',

          backdropFilter: 'blur(12px)',

          border:
            '1px solid rgba(255,255,255,0.08)',

          color: 'white',

          fontWeight: 700,

          fontSize: 18,

          letterSpacing: 1,

          boxShadow:
            '0 8px 30px rgba(0,0,0,0.35)'
        }}
      >
        Видео Лента
      </div>

      {/* VIDEOS */}

      {videos.map((v, i) => (
        <VideoCard
          key={v.id}
          ref={i === safeIndex ? vcRef : null}
          video={{
            ...v,
            url: v.url || `/stream/${v.id}.mp4`,
            added_by_id: v.added_by_id
          }}
          active={i === safeIndex}
        />
      ))}

      {/* CONTROLS */}

      <div
        style={{
          position: 'fixed',

          right: 18,
          bottom: 100,

          zIndex: 9999,

          padding: 12,

          borderRadius: 24,

          background:
            'rgba(27,31,36,0.82)',

          backdropFilter: 'blur(14px)',

          border:
            '1px solid rgba(255,255,255,0.08)',

          boxShadow:
            '0 8px 35px rgba(0,0,0,0.4)'
        }}
      >
        <VideoControls
          isMuted={muted}
          liked={videos[safeIndex]?.liked}
          likes={
            videos[safeIndex]?.likes ?? 0
          }
          userId={videos[safeIndex]?.added_by_id}
          onPrev={prev}
          onNext={next}
          onLike={() => {
            const id =
              videos[safeIndex]?.id

            if (id)
              toggleLike(id)
          }}
          onToggleMute={() => {
            const player = vcRef.current

            if (!player) return

            player.toggleMute()

            setMuted(
              player.isMuted()
            )
          }}
          videoId={videos[safeIndex]?.id}
        />
      </div>

      {/* BOTTOM INFO */}

      <div
        style={{
          position: 'fixed',

          bottom: 18,
          left: '50%',

          transform: 'translateX(-50%)',

          zIndex: 9999,

          padding: '8px 18px',

          borderRadius: 14,

          background:
            'rgba(0,0,0,0.45)',

          color: '#d1d5db',

          fontSize: 13,

          backdropFilter: 'blur(8px)'
        }}
      >
        Используйте кнопки справа для
        управления видео
      </div>

    </div>
  )
}