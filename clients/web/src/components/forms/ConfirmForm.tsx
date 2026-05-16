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
    <form onSubmit={onSubmit}>
      <h1>Confirm</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <input
        placeholder="Code"
        value={code}
        onChange={(e) =>
          setCode(e.target.value)
        }
      />

      <button>
        Confirm
      </button>
    </form>
  )
}