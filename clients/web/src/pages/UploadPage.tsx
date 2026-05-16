import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

export default function UploadPage() {
  const { token } = useAuth()

  const navigate = useNavigate()

  const [file, setFile] =
    useState<File | null>(null)

  const [loading, setLoading] =
    useState(false)

  async function upload() {
    if (!file) return

    const formData = new FormData()

    formData.append('file', file)

    setLoading(true)

    const res = await fetch('/api/video/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    })

    setLoading(false)

    if (res.ok) {
      alert('Upload successful')
      navigate('/')
    } else {
      alert('Upload failed')
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Upload Video</h1>

      <input
        type="file"
        accept="video/mp4"
        onChange={(e) =>
          setFile(e.target.files?.[0] ?? null)
        }
      />

      <br />
      <br />

      <button
        onClick={upload}
        disabled={!file || loading}
      >
        {loading
          ? 'Uploading...'
          : 'Upload'}
      </button>

      <br />
      <br />

      <button onClick={() => navigate('/')}>
        Back
      </button>
    </div>
  )
}