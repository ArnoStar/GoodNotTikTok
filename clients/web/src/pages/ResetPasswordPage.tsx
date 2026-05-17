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
        background: '#0f1115',
        color: 'white'
      }}
    >
      <div
        style={{
          width: 400,
          padding: 30,
          borderRadius: 12,
          background: '#1b1f24',
          display: 'flex',
          flexDirection: 'column',
          gap: 15
        }}
      >
        <h1>Reset Password</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={{
            padding: 12,
            borderRadius: 8,
            border: 'none'
          }}
        />

        <button
          onClick={submit}
          disabled={loading}
          style={{
            padding: 12,
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer'
          }}
        >
          {loading
            ? 'Sending...'
            : 'Send Reset Code'}
        </button>

        {message && (
          <div>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}