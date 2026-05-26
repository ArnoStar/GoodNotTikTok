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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#0f1115',
        color: 'white'
      }}
    >
      <div
        style={{
          width: 420,
          padding: 30,
          borderRadius: 14,
          background: '#1b1f24',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
        }}
      >
        <h1 style={{ margin: 0, textAlign: 'center' }}>
          Загрузка видео
        </h1>

        <div
          style={{
            padding: 14,
            border: '1px dashed #444',
            borderRadius: 10,
            background: '#0f1115'
          }}
        >
          <input
            type="file"
            accept="video/mp4"
            onChange={(e) =>
              setFile(e.target.files?.[0] ?? null)
            }
            style={{ color: 'white' }}
          />
        </div>

        <button
          onClick={upload}
          disabled={!file || loading}
          style={{
            padding: 12,
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            background: !file || loading ? '#333' : '#0f9d58',
            color: 'white',
            fontWeight: 600
          }}
        >
          {loading ? 'Загрузка...' : 'Загрузить'}
        </button>

        <button
          onClick={() => navigate('/')}
          style={{
            padding: 12,
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            background: '#2a2f38',
            color: 'white'
          }}
        >
          Назад
        </button>
      </div>
    </div>
  )
}