import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ConfirmResetPasswordPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function submit() {
    try {
      setLoading(true)

      const res = await fetch(
        '/auth/confirm_reset_password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            new_password: {
              password
            },
            confirmation: {
              code,
              email
            }
          })
        }
      )

      if (!res.ok) {
        setMessage('Invalid code or email')
        return
      }

      setMessage(
        'Password changed successfully'
      )

      setTimeout(() => {
        navigate('/login')
      }, 1000)

    } catch {
      setMessage('Reset failed')
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
        <h1>Confirm Reset</h1>

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

        <input
          type="text"
          placeholder="Code"
          value={code}
          onChange={(e) =>
            setCode(e.target.value)
          }
          style={{
            padding: 12,
            borderRadius: 8,
            border: 'none'
          }}
        />

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
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
            ? 'Changing...'
            : 'Change Password'}
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