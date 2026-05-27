export async function followUser(id: number, token: string) {
  return fetch(`/api/video/profile/${id}/follow`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

export async function unfollowUser(id: number, token: string) {
  return fetch(`/api/video/profile/${id}/unfollow`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

export async function fetchProfileById(userId: string) {
  const res = await fetch(`/api/video/profile/${userId}`)
  return res.json()
}

export async function fetchFollowers(userId: string) {
  const res = await fetch(`/api/video/profile/${userId}/followers`)
  return res.json()
}

export async function fetchFollowings(userId: string) {
  const res = await fetch(`/api/video/profile/${userId}/followings`)
  return res.json()
}

export async function fetchVideos(userId: string) {
  const res = await fetch(`/api/video/profile/${userId}/videos`)
  return res.json()
}

export async function fetchMe(token: string) {
  const res = await fetch('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) return null

  return res.json()
}

export async function fetchFollowState(
  userId: string,
  token: string
) {
  const res = await fetch(
    `/api/video/profile/${userId}/follow_state`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  if (!res.ok) return false

  return res.json()
}

export async function uploadProfilePictureApi(
  file: File,
  token: string
) {
  const formData = new FormData()

  formData.append('img', file)

  return fetch(
    '/api/auth/change_profile_picture',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    }
  )
}