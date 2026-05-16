import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

type UserProfile = {
  id: number
  email: string
}

type Video = {
  id: string
  caption?: string
}

export default function ProfilePage() {
  const navigate = useNavigate()

  const { user_id } = useParams()

  const [profile, setProfile] =
    useState<UserProfile | null>(null)

  const [followers, setFollowers] =
    useState<number>(0)

  const [followings, setFollowings] =
    useState<number>(0)

  const [videos, setVideos] =
    useState<Video[]>([])

  const [loading, setLoading] =
    useState(true)

  async function fetchProfile() {
    try {
      setLoading(true)

      // 1. user info
      const profileRes = await fetch(
        `/api/video/profile/${user_id}`
      )

      const profileData = await profileRes.json()
      setProfile(profileData)

      // 2. followers
      const followersRes = await fetch(
        `/api/video/profile/${user_id}/followers`
      )

      const followersData = await followersRes.json()

      setFollowers(
        Array.isArray(followersData)
          ? followersData.length
          : 0
      )

      // 3. followings
      const followingsRes = await fetch(
        `/api/video/profile/${user_id}/followings`
      )

      const followingsData = await followingsRes.json()

      setFollowings(
        Array.isArray(followingsData)
          ? followingsData.length
          : 0
      )

      // 4. ✅ NEW: videos from dedicated endpoint
      const videosRes = await fetch(
        `/api/video/profile/${user_id}/videos`
      )

      const videosData = await videosRes.json()

      setVideos(Array.isArray(videosData) ? videosData : [])

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user_id) {
      fetchProfile()
    }
  }, [user_id])

  if (loading) {
    return <div>Loading profile...</div>
  }

  if (!profile) {
    return <div>Profile not found</div>
  }

  return (
    <div
      style={{
        height: '100vh',
        overflowY: 'auto',
        padding: 20,
        color: 'white'
      }}
    >

      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <h1>{profile.email}</h1>

        <div style={{ display: 'flex', gap: 20 }}>
          <div>
            <b>{followers}</b> followers
          </div>

          <div>
            <b>{followings}</b> following
          </div>
        </div>
      </div>

      {/* VIDEO GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 10
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
              borderRadius: 10,
              overflow: 'hidden',
              cursor: 'pointer'
            }}
          >
            <video
              src={`/stream/${v.id}.mp4`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                background: '#000'
              }}
              muted
              preload="metadata"
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

    </div>
  )
}