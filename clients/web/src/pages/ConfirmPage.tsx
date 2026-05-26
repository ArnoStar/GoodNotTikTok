import { Link } from 'react-router-dom'
import ConfirmForm from '../components/forms/ConfirmForm'

export default function ConfirmPage() {
  return (
    <div
      className="page-center"
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background:
          'linear-gradient(135deg, #0f172a, #111827)',
        padding: 20
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'rgba(17, 24, 39, 0.95)',
          borderRadius: 24,
          padding: 40,
          boxShadow:
            '0 10px 40px rgba(0,0,0,0.45)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          color: 'white'
        }}
      >
        {/* TITLE */}

        <div
          style={{
            textAlign: 'center',
            marginBottom: 10
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 36
            }}
          >
            Подтверждение
          </h1>

          <p
            style={{
              color: '#9ca3af',
              marginTop: 10
            }}
          >
            Введите код подтверждения,
            отправленный на вашу почту
          </p>
        </div>

        {/* CONFIRM FORM */}

        <ConfirmForm />

        {/* BACK TO LOGIN */}

        <Link
          to="/login"
          style={{
            textAlign: 'center',
            color: '#4da6ff',
            textDecoration: 'none',
            fontWeight: 600,
            transition: '0.2s'
          }}
        >
          Назад ко входу
        </Link>
      </div>
    </div>
  )
}