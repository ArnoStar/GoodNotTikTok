import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ResetPasswordPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function submit() {
    try {
      setLoading(true)

      await fetch('/api/auth/reset_password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email
        })
      })

      setMessage(
        'If this email exists, a reset code was sent.'
      )

      setTimeout(() => {
        navigate('/confirm-reset-password')
      }, 1000)

    } catch {
      setMessage('Failed to send reset email')
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
        background:
          'linear-gradient(135deg, #0f172a, #111827)',
        color: 'white',
        padding: 20
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          padding: 40,
          borderRadius: 24,
          background: 'rgba(17, 24, 39, 0.95)',
          boxShadow:
            '0 10px 40px rgba(0,0,0,0.45)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }}
      >

        {/* TITLE */}

        <div
          style={{
            textAlign: 'center'
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 34
            }}
          >
            Сброс пароля
          </h1>

          <p
            style={{
              color: '#9ca3af',
              marginTop: 10,
              lineHeight: 1.5
            }}
          >
            Введите вашу почту для получения кода восстановления
          </p>
        </div>

        {/* EMAIL INPUT */}

        <input
          type="email"
          placeholder="Почта"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={{
            padding: '16px 18px',
            borderRadius: 14,
            border: '1px solid #374151',
            background: '#1f2937',
            color: 'white',
            fontSize: 16,
            outline: 'none'
          }}
        />

        {/* BUTTON */}

        <button
          onClick={submit}
          disabled={loading}
          style={{
            padding: '16px',
            borderRadius: 14,
            border: 'none',
            background:
              loading
                ? '#374151'
                : 'linear-gradient(135deg, #2563eb, #3b82f6)',
            color: 'white',
            fontSize: 16,
            fontWeight: 700,
            cursor:
              loading
                ? 'not-allowed'
                : 'pointer',
            transition: '0.2s ease'
          }}
        >
          {loading
            ? 'Отправка...'
            : 'Отправить код'}
        </button>

        {/* MESSAGE */}

        {message && (
          <div
            style={{
              background:
                'rgba(59,130,246,0.12)',
              border:
                '1px solid rgba(59,130,246,0.3)',
              color: '#93c5fd',
              padding: 14,
              borderRadius: 12,
              textAlign: 'center',
              fontSize: 14
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  )
}