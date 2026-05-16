import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type UserProfile = {
  id: number
  email: string
}

type Video = {
  id: string
  caption?: string
}

export default function ProfilePage() {
  const { user_id } = useParams()
  const { token } = useAuth()

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
      const profileRes =
        await fetch(
          `/api/video/profile/${user_id}`
        )

      const profileData =
        await profileRes.json()

      setProfile(profileData)

      // 2. followers
      const followersRes =
        await fetch(
          `/api/video/profile/${user_id}/followers`
        )

      const followersData =
        await followersRes.json()

      setFollowers(
        Array.isArray(followersData)
          ? followersData.length
          : 0
      )

      // 3. followings
      const followingsRes =
        await fetch(
          `/api/video/profile/${user_id}/followings`
        )

      const followingsData =
        await followingsRes.json()

      setFollowings(
        Array.isArray(followingsData)
          ? followingsData.length
          : 0
      )

      // 4. videos (from profile response)
      if (profileData?.video_added) {
        setVideos(profileData.video_added)
      }

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
    <div style={{ padding: 20, color: 'white' }}>

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
            'repeat(3, 1fr)',
          gap: 10
        }}
      >
        {videos.map((v) => (
          <div
            key={v.id}
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
              src={`/stream/${v.id}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              muted
              preload="metadata"
            />
          </div>
        ))}
      </div>
    </div>
  )
}