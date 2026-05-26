import {
  useEffect,
  useState,
} from 'react'
import type { CSSProperties } from 'react'
import {
  useParams,
  useNavigate
} from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

type UserProfile = {
  id: number
  email: string
  img?: string | null
}

type Video = {
  id: string
  caption?: string
}

type CurrentUser = {
  id: number
}

export default function ProfilePage() {
  const navigate = useNavigate()

  const { token } = useAuth()

  const { user_id } = useParams()

  const [profile, setProfile] =
    useState<UserProfile | null>(null)

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null)

  const [followers, setFollowers] =
    useState<number>(0)

  const [followings, setFollowings] =
    useState<number>(0)

  const [videos, setVideos] =
    useState<Video[]>([])

  const [loading, setLoading] =
    useState(true)

  const [isFollowing, setIsFollowing] =
    useState(false)

  const [showUploadPopup, setShowUploadPopup] =
    useState(false)
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [followersList, setFollowersList] = useState<UserProfile[]>([])
  const [followingsList, setFollowingsList] = useState<UserProfile[]>([])

  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowings, setShowFollowings] = useState(false)

  async function loadFollowersList() {
    const res = await fetch(`/api/video/profile/${user_id}/followers`)
    const data = await res.json()

    const arr = Array.isArray(data) ? data : []

    const fullProfiles = await Promise.all(
      arr.map(async (rel: any) => {
        const id = rel.follower_id

        const r = await fetch(`/api/video/profile/${id}`)
        return r.ok ? await r.json() : null
      })
    )

    setFollowersList(fullProfiles.filter(Boolean))
  }

  async function loadFollowingsList() {
    const res = await fetch(`/api/video/profile/${user_id}/followings`)
    const data = await res.json()

    const arr = Array.isArray(data) ? data : []

    const fullProfiles = await Promise.all(
      arr.map(async (rel: any) => {
        const id = rel.following_id

        const r = await fetch(`/api/video/profile/${id}`)
        return r.ok ? await r.json() : null
      })
    )

    setFollowingsList(fullProfiles.filter(Boolean))
  }

  async function followUser(id: number) {
    await fetch(`/api/video/profile/${id}/follow`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    })
  }

  async function unfollowUser(id: number) {
    await fetch(`/api/video/profile/${id}/unfollow`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    })
  }

  async function fetchProfile() {
    try {
      setLoading(true)

      // CURRENT USER
      let meData: any = null

      const meRes = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (meRes.ok) {
        meData = await meRes.json()
        setCurrentUser(meData)
      }

      // PROFILE
      const profileRes = await fetch(
        `/api/video/profile/${user_id}`
      )
      const profileData = await profileRes.json()
      setProfile(profileData)

      // FOLLOWERS
      const followersRes = await fetch(
        `/api/video/profile/${user_id}/followers`
      )
      const followersData = await followersRes.json()

      const followersArray = Array.isArray(followersData)
        ? followersData
        : []

      setFollowers(followersArray.length)

      // CHECK FOLLOW STATE
      if (meData) {
        const followStateRes = await fetch(
          `/api/video/profile/${user_id}/follow_state`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        if (followStateRes.ok) {
          const state = await followStateRes.json()

          setIsFollowing(Boolean(state))
        }
      }

      // FOLLOWINGS
      const followingsRes = await fetch(
        `/api/video/profile/${user_id}/followings`
      )
      const followingsData = await followingsRes.json()

      setFollowings(
        Array.isArray(followingsData)
          ? followingsData.length
          : 0
      )

      // VIDEOS
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

  async function follow() {
    const res = await fetch(
      `/api/video/profile/${user_id}/follow`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (res.ok) {
      setIsFollowing(true)
      setFollowers(v => v + 1)
    }
  }

  async function unfollow() {
    const res = await fetch(
      `/api/video/profile/${user_id}/unfollow`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (res.ok) {
      setIsFollowing(false)
      setFollowers(v =>
        Math.max(0, v - 1)
      )
    }
  }

  async function uploadProfilePicture(
    file: File
  ) {
    const formData = new FormData()

    formData.append(
      'img',
      file
    )

    const res = await fetch(
      '/api/auth/change_profile_picture',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      }
    )

    if (res.ok) {
      setShowUploadPopup(false)
      fetchProfile()
    }
  }

  useEffect(() => {
    if (user_id) {
      fetchProfile()
    }
  }, [user_id])

  if (loading) {
    return (
      <div
        style={{
          color: 'white',
          padding: 30
        }}
      >
        Loading profile...
      </div>
    )
  }

  if (!profile) {
    return (
      <div
        style={{
          color: 'white',
          padding: 30
        }}
      >
        Profile not found
      </div>
    )
  }

  const isOwnProfile =
    currentUser?.id === Number(user_id)

  const modalStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  }

  const modalBox: CSSProperties = {
    background: '#111',
    padding: 20,
    maxHeight: '70vh',
    width: 400,
    color: 'white',
    borderRadius: 12,

    overflowY: 'auto',   // ✅ ADD THIS
    display: 'flex',
    flexDirection: 'column'
  }

  const userRow = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
    width: '100%',
    overflow: 'hidden'
  }

  const avatar = {
    width: 40,
    height: 40,
    borderRadius: '50%'
  }

  const btn = {
    marginLeft: 'auto',
    padding: '6px 10px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer'
  }

  return (
    <div
      style={{
        position: 'fixed',

        top: 0,
        left: 0,
        right: 0,
        bottom: 0,

        overflowY: 'auto',
        overflowX: 'hidden',

        background: 'black',
        color: 'white',

        paddingBottom: 50
      }}
    >
      <div
        style={{
          position: 'fixed',
          top: 20,
          left: 20,
          zIndex: 9999
        }}
      >
        <button
          onClick={() =>
            navigate('/')
          }
        >
          Go Back
        </button>
      </div>

      {/* POPUP */}

      {showUploadPopup && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background:
              'rgba(0,0,0,0.7)',

            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',

            zIndex: 9999
          }}
        >
          <div
            style={{
              background: '#111',
              padding: 30,
              borderRadius: 16
            }}
          >
            <h2>
              Change profile picture
            </h2>

            <input
              type="file"
              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setSelectedFile(file)
              }}
            />

            <button
              onClick={() => {
                if (!selectedFile) return
                uploadProfilePicture(selectedFile)
                setShowUploadPopup(false)
                setSelectedFile(null)
              }}
              style={{
                marginTop: 20,
                marginRight: 10,
                padding: '10px 16px',
                borderRadius: 10,
                border: 'none',
                background: '#0f9d58',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Submit
            </button>

            <button
              onClick={() =>
                setShowUploadPopup(false)
              }
              style={{
                marginTop: 20
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* PROFILE HEADER */}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',

          alignItems: 'center',

          marginBottom: 40,

          paddingTop: 40
        }}
      >

        {/* PROFILE IMAGE */}

        <div
          style={{
            width: 140,
            height: 140,

            borderRadius: '50%',

            overflow: 'hidden',

            border: '4px solid white',

            background: '#1b1f24',

            marginBottom: 20
          }}
        >
          {profile.img ? (
            <img
              src={`/stream/${profile.img}`}
              alt="profile"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',

                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',

                fontSize: 60
              }}
            >
              👤
            </div>
          )}
        </div>

        {/* EMAIL */}

        <h1
          style={{
            margin: 0,
            marginBottom: 20
          }}
        >
          {profile.email}
        </h1>

        {/* BUTTON */}

        {token && isOwnProfile ? (
          <button
            onClick={() =>
              setShowUploadPopup(true)
            }
            style={{
              marginBottom: 20,
              padding: '10px 20px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Change profile picture
          </button>
        ) : token && !isOwnProfile ? (
          <button
            onClick={() => {
              if (isFollowing) {
                unfollow()
              } else {
                follow()
              }
            }}
            style={{
              marginBottom: 20,
              padding: '10px 20px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              background:
                isFollowing
                  ? '#333'
                  : '#0f9d58',
              color: 'white'
            }}
          >
            {isFollowing
              ? 'Unfollow'
              : 'Follow'}
          </button>
        ) : null}

        {/* FOLLOW STATS */}

        <div
          style={{
            display: 'flex',
            gap: 40,

            fontSize: 18
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 40,
              fontSize: 18
            }}
          >
            <div
              style={{ cursor: 'pointer' }}
              onClick={async () => {
                await loadFollowersList()
                setShowFollowers(true)
              }}
            >
              <b>{followers}</b>
              <div>Подписчики</div>
            </div>

            <div
              style={{ cursor: 'pointer' }}
              onClick={async () => {
                await loadFollowingsList()
                setShowFollowings(true)
              }}
            >
              <b>{followings}</b>
              <div>Подписки</div>
            </div>
          </div>
        </div>
      </div>

      {/* VIDEOS */}

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
                e.currentTarget
                  .play()
                  .catch(() => {})
              }}

              onMouseLeave={(e) => {
                e.currentTarget.pause()
              }}
            />
          </div>
        ))}
      </div>
      {showFollowers && (
        <div style={modalStyle}>
          <div style={modalBox}>
            <h2>Подписчики</h2>
            <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
            {followersList.map(user => (
              <div key={user.id}
                style={{
                  ...userRow,
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/profile/${user.id}`)}
              >
                <div
                  style={{
                    ...avatar,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#1b1f24',
                    fontSize: 20
                  }}
                >
                  {user.img ? (
                    <img
                      src={`/stream/${user.img}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '50%'
                      }}
                    />
                  ) : (
                    '👤'
                  )}
                </div>

                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {user.email}
                </span>

                <button
                  onClick={() => unfollowUser(user.id)}
                  style={btn}
                >
                  Отписаться
                </button>
              </div>
            ))}
            </div>
            <button onClick={() => setShowFollowers(false)}>
              Закрыть
            </button>
          </div>
        </div>
      )}
      {showFollowings && (
        <div style={modalStyle}>
          <div style={modalBox}>
            <h2>Подписки</h2>
            <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
              {followingsList.map(user => (
                <div key={user.id}
                  style={{
                    ...userRow,
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/profile/${user.id}`)}
                >
                  <div
                    style={{
                      ...avatar,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#1b1f24',
                      fontSize: 20
                    }}
                  >
                    {user.img ? (
                      <img
                        src={`/stream/${user.img}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '50%'
                        }}
                      />
                    ) : (
                      '👤'
                    )}
                  </div>

                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {user.email}
                  </span>

                  <button
                    onClick={() => followUser(user.id)}
                    style={btn}
                  >
                    Подписаться
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => setShowFollowings(false)}>
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  )
}