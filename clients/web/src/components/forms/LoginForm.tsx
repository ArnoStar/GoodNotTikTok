import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function LoginForm({
  onSuccess
}: {
  onSuccess?: () => void
}) {
  const { login } = useAuth()

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  async function onSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault()

    setLoading(true)
    setError(null)

    try {
      await login(email, password)

      onSuccess?.()
    } catch (err) {
      setError(
        (err as Error).message
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 18
      }}
    >

      {/* EMAIL */}

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

      {/* PASSWORD */}

      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
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
          cursor: loading
            ? 'not-allowed'
            : 'pointer',
          transition: '0.2s ease'
        }}
      >
        {loading
          ? 'Загрузка...'
          : 'Войти'}
      </button>

      {/* ERROR */}

      {error && (
        <div
          style={{
            background:
              'rgba(239,68,68,0.15)',
            border:
              '1px solid rgba(239,68,68,0.4)',
            color: '#fca5a5',
            padding: 14,
            borderRadius: 12,
            textAlign: 'center',
            fontSize: 14
          }}
        >
          {error}
        </div>
      )}
    </form>
  )
}