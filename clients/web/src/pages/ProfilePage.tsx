import {
  useEffect,
  useState
} from 'react'

import {
  useNavigate,
  useParams
} from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

import type {
  CurrentUser,
  UserProfile,
  Video
} from '../types/profile'

import {
  fetchFollowers,
  fetchFollowings,
  fetchFollowState,
  fetchMe,
  fetchProfileById,
  followUser,
  unfollowUser,
  uploadProfilePictureApi
} from '../services/profileApi'

import UploadProfilePictureModal from '../components/profile/UploadProfilePictureModal'
import ProfileVideos from '../components/profile/ProfileVideos'
import FollowListModal from '../components/profile/FollowListModal'

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

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null)

  const [followersList, setFollowersList] =
    useState<UserProfile[]>([])

  const [followingsList, setFollowingsList] =
    useState<UserProfile[]>([])

  const [showFollowers, setShowFollowers] =
    useState(false)

  const [showFollowings, setShowFollowings] =
    useState(false)

  const [activeTab, setActiveTab] =
    useState<
      'videos' |
      'saved' |
      'liked'
    >('videos')

  async function loadFollowersList() {
    if (!user_id) return

    const data = await fetchFollowers(user_id)

    const arr = Array.isArray(data)
      ? data
      : []

    const fullProfiles = await Promise.all(
      arr.map(async (rel: any) => {
        const id = rel.follower_id

        try {
          return await fetchProfileById(
            String(id)
          )
        } catch {
          return null
        }
      })
    )

    setFollowersList(
      fullProfiles.filter(Boolean)
    )
  }

  async function loadFollowingsList() {
    if (!user_id) return

    const data = await fetchFollowings(
      user_id
    )

    const arr = Array.isArray(data)
      ? data
      : []

    const fullProfiles = await Promise.all(
      arr.map(async (rel: any) => {
        const id = rel.following_id

        try {
          return await fetchProfileById(
            String(id)
          )
        } catch {
          return null
        }
      })
    )

    setFollowingsList(
      fullProfiles.filter(Boolean)
    )
  }

  async function fetchTabVideos(
    type:
      | 'videos'
      | 'saved'
      | 'liked'
  ) {
    if (!user_id) return

    try {
      let endpoint = ''

      if (type === 'videos') {
        endpoint =
          `/api/video/profile/${user_id}/videos`
      }

      if (type === 'saved') {
        endpoint =
          `/api/video/profile/${user_id}/videos/saved`
      }

      if (type === 'liked') {
        endpoint =
          `/api/video/profile/${user_id}/videos/liked`
      }

      const response =
        await fetch(endpoint)

      const data =
        await response.json()

      setVideos(
        Array.isArray(data)
          ? data
          : []
      )

    } catch (err) {
      console.error(err)

      setVideos([])
    }
  }

  async function fetchProfile() {
    if (!user_id) return

    try {
      setLoading(true)

      let meData: CurrentUser | null = null

      if (token) {
        meData = await fetchMe(token)

        if (meData) {
          setCurrentUser(meData)
        }
      }

      const profileData =
        await fetchProfileById(user_id)

      setProfile(profileData)

      const followersData =
        await fetchFollowers(user_id)

      const followersArray =
        Array.isArray(followersData)
          ? followersData
          : []

      setFollowers(
        followersArray.length
      )

      if (meData && token) {
        const state =
          await fetchFollowState(
            user_id,
            token
          )

        setIsFollowing(
          Boolean(state)
        )
      }

      const followingsData =
        await fetchFollowings(user_id)

      setFollowings(
        Array.isArray(followingsData)
          ? followingsData.length
          : 0
      )

      await fetchTabVideos(
        activeTab
      )

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleFollow() {
    if (!user_id || !token) return

    const res = await followUser(
      Number(user_id),
      token
    )

    if (res.ok) {
      setIsFollowing(true)

      setFollowers(v => v + 1)
    }
  }

  async function handleUnfollow() {
    if (!user_id || !token) return

    const res = await unfollowUser(
      Number(user_id),
      token
    )

    if (res.ok) {
      setIsFollowing(false)

      setFollowers(v =>
        Math.max(0, v - 1)
      )
    }
  }

  async function handleUpload() {
    if (!selectedFile || !token) return

    const res =
      await uploadProfilePictureApi(
        selectedFile,
        token
      )

    if (res.ok) {
      setShowUploadPopup(false)

      setSelectedFile(null)

      fetchProfile()
    }
  }

  async function handleFollowUser(
    id: number
  ) {
    if (!token) return

    await followUser(id, token)
  }

  async function handleUnfollowUser(
    id: number
  ) {
    if (!token) return

    await unfollowUser(id, token)
  }

  useEffect(() => {
    fetchProfile()
  }, [user_id])

  useEffect(() => {
    fetchTabVideos(activeTab)
  }, [activeTab, user_id])

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
    currentUser?.id ===
    Number(user_id)

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
      {/* GO BACK */}

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

      {/* UPLOAD MODAL */}

      {showUploadPopup && (
        <UploadProfilePictureModal
          selectedFile={selectedFile}
          setSelectedFile={
            setSelectedFile
          }
          onSubmit={handleUpload}
          onClose={() => {
            setShowUploadPopup(false)
            setSelectedFile(null)
          }}
        />
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

            border:
              '4px solid white',

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
                justifyContent:
                  'center',
                alignItems:
                  'center',

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
        ) : token &&
          !isOwnProfile ? (
          <button
            onClick={() => {
              if (isFollowing) {
                handleUnfollow()
              } else {
                handleFollow()
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

        {/* STATS */}

        <div
          style={{
            display: 'flex',
            gap: 40,
            fontSize: 18
          }}
        >
          <div
            style={{
              cursor: 'pointer'
            }}
            onClick={async () => {
              await loadFollowersList()

              setShowFollowers(true)
            }}
          >
            <b>{followers}</b>

            <div>
              Подписчики
            </div>
          </div>

          <div
            style={{
              cursor: 'pointer'
            }}
            onClick={async () => {
              await loadFollowingsList()

              setShowFollowings(true)
            }}
          >
            <b>{followings}</b>

            <div>
              Подписки
            </div>
          </div>
        </div>
      </div>

      {/* VIDEO TABS */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 20,
          marginBottom: 30
        }}
      >
        <button
          onClick={() =>
            setActiveTab(
              'videos'
            )
          }
          style={{
            padding:
              '10px 20px',

            borderRadius: 12,

            border: 'none',

            cursor: 'pointer',

            background:
              activeTab ===
              'videos'
                ? '#0f9d58'
                : '#333',

            color: 'white'
          }}
        >
          Videos
        </button>

        <button
          onClick={() =>
            setActiveTab(
              'saved'
            )
          }
          style={{
            padding:
              '10px 20px',

            borderRadius: 12,

            border: 'none',

            cursor: 'pointer',

            background:
              activeTab ===
              'saved'
                ? '#0f9d58'
                : '#333',

            color: 'white'
          }}
        >
          Saved
        </button>

        <button
          onClick={() =>
            setActiveTab(
              'liked'
            )
          }
          style={{
            padding:
              '10px 20px',

            borderRadius: 12,

            border: 'none',

            cursor: 'pointer',

            background:
              activeTab ===
              'liked'
                ? '#0f9d58'
                : '#333',

            color: 'white'
          }}
        >
          Liked
        </button>
      </div>

      {/* VIDEOS */}

      <ProfileVideos
        videos={videos}
      />

      {/* FOLLOWERS MODAL */}

      {showFollowers && (
        <FollowListModal
          title="Подписчики"
          users={followersList}
          buttonText="Отписаться"
          onAction={
            handleUnfollowUser
          }
          onClose={() =>
            setShowFollowers(false)
          }
        />
      )}

      {/* FOLLOWINGS MODAL */}

      {showFollowings && (
        <FollowListModal
          title="Подписки"
          users={followingsList}
          buttonText="Подписаться"
          onAction={
            handleFollowUser
          }
          onClose={() =>
            setShowFollowings(false)
          }
        />
      )}
    </div>
  )
}