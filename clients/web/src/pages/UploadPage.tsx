import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

export default function UploadPage() {
  const { token } = useAuth()

  const navigate = useNavigate()

  const [file, setFile] =
    useState<File | null>(null)

  const [title, setTitle] =
    useState('')

  const [description, setDescription] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  async function upload() {
    if (!file) {
      setError('Выберите видео')
      return
    }

    const isMp4 =
      file.type === 'video/mp4' ||
      file.name.toLowerCase().endsWith('.mp4')

    if (!isMp4) {
      setError('Можно загружать только MP4 видео')
      return
    }

    setError('')

    const formData = new FormData()

    // FILE
    formData.append('file', file)

    // VIDEO INFO
    formData.append('title', title)
    formData.append('description', description)

    setLoading(true)

    try {
      const res = await fetch('/api/video/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      if (res.ok) {
        alert('Upload successful')
        navigate('/')
      } else {
        const err = await res.json()
        console.error(err)

        alert('Upload failed')
      }

    } catch (err) {
      console.error(err)
      alert('Upload failed')
    } finally {
      setLoading(false)
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
          boxShadow:
            '0 10px 30px rgba(0,0,0,0.4)'
        }}
      >
        <h1
          style={{
            margin: 0,
            textAlign: 'center'
          }}
        >
          Загрузка видео
        </h1>

        {/* TITLE */}

        <input
          type="text"
          placeholder="Название видео"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          style={{
            padding: 14,
            borderRadius: 10,
            border: '1px solid #444',
            background: '#0f1115',
            color: 'white',
            outline: 'none'
          }}
        />

        {/* DESCRIPTION */}

        <textarea
          placeholder="Описание"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          rows={4}
          style={{
            padding: 14,
            borderRadius: 10,
            border: '1px solid #444',
            background: '#0f1115',
            color: 'white',
            resize: 'none',
            outline: 'none'
          }}
        />

        {/* FILE */}

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
            accept="video/mp4,.mp4"
            onChange={(e) => {
              const selected =
                e.target.files?.[0] ?? null

              if (!selected) {
                setFile(null)
                return
              }

              const isMp4 =
                selected.type === 'video/mp4' ||
                selected.name
                  .toLowerCase()
                  .endsWith('.mp4')

              if (!isMp4) {
                setError(
                  'Можно загружать только MP4 видео'
                )
                setFile(null)
                return
              }

              setError('')
              setFile(selected)
            }}
            style={{
              color: 'white'
            }}
          />
        </div>

        {/* ERROR */}

        {error && (
          <div
            style={{
              color: '#ff6b6b',
              fontSize: 14
            }}
          >
            {error}
          </div>
        )}

        {/* UPLOAD BUTTON */}

        <button
          onClick={upload}
          disabled={!file || loading}
          style={{
            padding: 12,
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',

            background:
              !file || loading
                ? '#333'
                : '#0f9d58',

            color: 'white',
            fontWeight: 600
          }}
        >
          {loading
            ? 'Загрузка...'
            : 'Загрузить'}
        </button>

        {/* BACK */}

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