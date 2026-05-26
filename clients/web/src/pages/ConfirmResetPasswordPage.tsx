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
        '/api/auth/confirm_reset_password',
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

          padding: 35,

          borderRadius: 20,

          border: '1px solid #2a2f38',

          background: 'rgba(17, 24, 39, 0.95)',
          
          boxShadow:
            '0 10px 40px rgba(0,0,0,0.45)',

          display: 'flex',
          flexDirection: 'column',

          gap: 18
        }}
      >
        <h1
          style={{
            margin: 0,
            textAlign: 'center',
            fontSize: 32,
            fontWeight: 700
          }}
        >
          Сброс пароля
        </h1>

        <div
          style={{
            textAlign: 'center',
            color: '#9aa4b2',
            fontSize: 14,
            marginTop: -5
          }}
        >
          Введите код из письма и новый пароль
        </div>

        <input
          type="email"
          placeholder="Электронная почта"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={{
            padding: 14,

            borderRadius: 12,

            border: '1px solid #2f3540',

            background: '#0f1115',

            color: 'white',

            fontSize: 15,

            outline: 'none'
          }}
        />

        <input
          type="text"
          placeholder="Код подтверждения"
          value={code}
          onChange={(e) =>
            setCode(e.target.value)
          }
          style={{
            padding: 14,

            borderRadius: 12,

            border: '1px solid #2f3540',

            background: '#0f1115',

            color: 'white',

            fontSize: 15,

            outline: 'none'
          }}
        />

        <input
          type="password"
          placeholder="Новый пароль"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={{
            padding: 14,

            borderRadius: 12,

            border: '1px solid #2f3540',

            background: '#0f1115',

            color: 'white',

            fontSize: 15,

            outline: 'none'
          }}
        />

        <button
          onClick={submit}
          disabled={loading}
          style={{
            marginTop: 5,

            padding: 14,

            border: 'none',

            borderRadius: 12,

            cursor: 'pointer',

            background:
              loading
                ? '#3a3f47'
                : 'linear-gradient(135deg, #4da6ff, #0066ff)',

            color: 'white',

            fontWeight: 700,

            fontSize: 16,

            transition: '0.2s'
          }}
        >
          {loading
            ? 'Изменение пароля...'
            : 'Изменить пароль'}
        </button>

        {message && (
          <div
            style={{
              marginTop: 5,

              padding: 12,

              borderRadius: 10,

              background: '#11151b',

              border: '1px solid #2a2f38',

              textAlign: 'center',

              color: '#d1d5db',

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