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
    <form onSubmit={onSubmit}>
      <h1>Login</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <button disabled={loading}>
        {loading
          ? 'Loading...'
          : 'Login'}
      </button>

      {error && (
        <div>{error}</div>
      )}
    </form>
  )
}