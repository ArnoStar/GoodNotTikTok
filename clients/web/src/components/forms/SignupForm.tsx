import { useState } from 'react'

export default function SignupForm({
  onSigned
}: {
  onSigned?: () => void
}) {
  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [passwordConfirm,
    setPasswordConfirm] =
    useState('')

  async function onSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault()

    const res = await fetch(
      '/api/auth/signin',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          password_confirm:
            passwordConfirm
        })
      }
    )

    if (!res.ok) {
      alert('Signup failed')
      return
    }

    onSigned?.()
  }

  return (
    <form onSubmit={onSubmit}>
      <h1>Signup</h1>

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

      <input
        type="password"
        placeholder="Confirm password"
        value={passwordConfirm}
        onChange={(e) =>
          setPasswordConfirm(
            e.target.value
          )
        }
      />

      <button>
        Sign up
      </button>
    </form>
  )
}