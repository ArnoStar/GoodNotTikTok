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
    <form
      onSubmit={onSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 18
      }}
    >

      {/* TITLE */}

      <h1
        style={{
          textAlign: 'center',
          margin: 0,
          marginBottom: 10,
          fontSize: 34,
          color: 'white'
        }}
      >
        Регистрация
      </h1>

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

      {/* CONFIRM PASSWORD */}

      <input
        type="password"
        placeholder="Подтвердите пароль"
        value={passwordConfirm}
        onChange={(e) =>
          setPasswordConfirm(
            e.target.value
          )
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
        style={{
          padding: '16px',
          borderRadius: 14,
          border: 'none',
          background:
            'linear-gradient(135deg, #2563eb, #3b82f6)',
          color: 'white',
          fontSize: 16,
          fontWeight: 700,
          cursor: 'pointer',
          transition: '0.2s ease'
        }}
      >
        Зарегистрироваться
      </button>
    </form>
  )
}