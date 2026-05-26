import { useState } from 'react'

export default function ConfirmForm() {
  const [email, setEmail] =
    useState('')

  const [code, setCode] =
    useState('')

  async function onSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault()

    const res = await fetch(
      '/api/auth/confirm',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json'
        },
        body: JSON.stringify({
          email,
          code
        })
      }
    )

    if (!res.ok) {
      alert('Confirmation failed')
      return
    }

    alert('Confirmed')
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
        Подтверждение
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

      {/* CODE */}

      <input
        placeholder="Код подтверждения"
        value={code}
        onChange={(e) =>
          setCode(e.target.value)
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
        Подтвердить
      </button>
    </form>
  )
}