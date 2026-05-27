import {
  useState,
  useEffect,
  useRef,
  useCallback
} from 'react'

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

type Mode = 'for_you' | 'following' | 'friends'

export default function Feed({
  mode
}: {
  mode: Mode
}) {
  const auth = useAuth()
  const vcRef = useRef<VideoCardHandle | null>(null)

  const [videos, setVideos] = useState<Video[]>([])
  const [muted, setMuted] = useState(true)

  const [searchParams, setSearchParams] =
    useSearchParams()

  const watchId = searchParams.get('watch')

  // ---------------- VIEW TRACKING ----------------
  const lastViewedId = useRef<string | null>(null)

  const registerView = useCallback(
    (videoId: string) => {
      if (lastViewedId.current === videoId) return
      lastViewedId.current = videoId

      fetch(`/api/video/view/${videoId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      }).catch(() => {})
    },
    [auth.token]
  )

  // ---------------- FETCH ----------------
  async function fetchVideo(): Promise<Video | null> {
    const endpoint =
      mode === 'for_you'
        ? '/api/video/random'
        : mode === 'following'
          ? '/api/video/followed'
          : '/api/video/friends'

    const res = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })

    if (!res.ok) return null

    const v = await res.json()
    if (!v) return null

    return {
      id: v.id,
      url: `/stream/${v.id}.mp4`,
      caption: v.caption,
      likes: 0,
      liked: false,
      added_by_id: v.added_by_id
    }
  }

  async function enrichVideo(v: Video): Promise<Video> {
    const likeRes = await fetch(`/api/video/${v.id}/like`)
    const likes = likeRes.ok ? Number(await likeRes.json()) : 0

    const likedRes = await fetch(
      `/api/video/${v.id}/like_state`,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      }
    )

    const liked = likedRes.ok
      ? Boolean(await likedRes.json())
      : false

    return { ...v, likes, liked }
  }

  async function fetchById(
    id: string
  ): Promise<Video | null> {
    const res = await fetch(`/api/video/${id}`)

    if (!res.ok) return null

    const v = await res.json()

    return {
      id: v.id,
      url: `/stream/${v.id}.mp4`,
      caption: v.caption,
      likes: 0,
      liked: false,
      added_by_id: v.added_by_id
    }
  }

  // ---------------- INIT (FIXED LOOP SAFE) ----------------
  useEffect(() => {
    let cancelled = false

    async function init() {
      const base: Video[] = []
      const seen = new Set<string>()

      const MAX_ATTEMPTS = 6
      let attempts = 0

      if (watchId) {
        const watched = await fetchById(watchId)

        if (watched) {
          base.push(watched)
          seen.add(watched.id)
        }
      }

      if (base.length === 0) {
        const first = await fetchVideo()

        if (!first) {
          setVideos([])
          return
        }

        base.push(first)
        seen.add(first.id)
      }

      while (base.length < 5 && attempts < MAX_ATTEMPTS) {
        attempts++

        const v = await fetchVideo()

        if (!v) break
        if (seen.has(v.id)) continue

        seen.add(v.id)
        base.push(v)
      }

      const enriched = await Promise.all(base.map(enrichVideo))

      if (cancelled) return

      setVideos(enriched)

      // IMPORTANT: only set URL ONCE, and only if needed
      if (!watchId && enriched.length > 0) {
        const main = enriched[Math.min(2, enriched.length - 1)]

        // guard: do not spam URL updates
        if (searchParams.get('watch') !== main.id) {
          setSearchParams(
            { watch: main.id },
            { replace: true }
          )

          registerView(main.id)
        }
      }
    }

    init()

    return () => {
      cancelled = true
    }
  }, [mode]) // keep ONLY mode

  // ---------------- INDEX ----------------
  const index = videos.findIndex(v => v.id === watchId)
  const safeIndex = index === -1 ? 2 : index

  // ---------------- SET CURRENT ----------------
  const setCurrent = useCallback(
    (id: string) => {
      setSearchParams({ watch: id }, { replace: true })
      registerView(id)
    },
    [registerView]
  )

  // ---------------- LIKE ----------------
  const toggleLike = useCallback(
    (videoId: string) => {
      setVideos(prev =>
        prev.map(v => {
          if (v.id !== videoId) return v

          const nextLiked = !v.liked
          const nextLikes =
            (v.likes ?? 0) +
            (nextLiked ? 1 : -1)

          if (v.liked) {
            fetch(`/api/video/${videoId}/dislike`, {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${auth.token}`
              }
            })
          } else {
            fetch(`/api/video/${videoId}/like`, {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${auth.token}`
              }
            })
          }

          return {
            ...v,
            liked: nextLiked,
            likes: Math.max(0, nextLikes)
          }
        })
      )
    },
    [auth.token]
  )

  // ---------------- NAV ----------------
  const prev = useCallback(() => {
    const prevVideo = videos[safeIndex - 1]
    if (prevVideo) setCurrent(prevVideo.id)
  }, [videos, safeIndex])

  const next = useCallback(async () => {
    const nextVideo = videos[safeIndex + 1]

    if (nextVideo) {
      setCurrent(nextVideo.id)
      return
    }

    const v = await fetchVideo()
    if (!v) return

    const enriched = await enrichVideo(v)

    setVideos(prev => [...prev.slice(1), enriched])
    setCurrent(enriched.id)
  }, [videos, safeIndex])

  // ---------------- EMPTY ----------------
  if (videos.length === 0) {
    const messages: Record<Mode, string> = {
      for_you: "We don't have any new videos for you",
      following: "We don't have any new videos from your followed creators",
      friends: "We don't have any new videos from your friends"
    }

    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white'
        }}
      >
        {messages[mode]}
      </div>
    )
  }

  // ---------------- UI ----------------
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      overflow: 'hidden',
      background: 'linear-gradient(180deg, #0f1115 0%, #090b0f 100%)'
    }}>
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

      <div style={{
        position: 'fixed',
        right: 18,
        bottom: 100,
        zIndex: 9999
      }}>
        <VideoControls
          isMuted={muted}
          liked={videos[safeIndex]?.liked}
          likes={videos[safeIndex]?.likes ?? 0}
          userId={videos[safeIndex]?.added_by_id}
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
          videoId={videos[safeIndex]?.id}
        />
      </div>
    </div>
  )
}