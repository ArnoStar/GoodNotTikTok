import { Link, useNavigate } from 'react-router-dom'
import LoginForm from '../components/forms/LoginForm'

export default function LoginPage() {
  const navigate = useNavigate()

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
            Вход
          </h1>

          <p
            style={{
              color: '#9ca3af',
              marginTop: 10
            }}
          >
            Войдите в свой аккаунт
          </p>
        </div>

        {/* LOGIN FORM */}

        <LoginForm
          onSuccess={() => navigate('/')}
        />

        {/* SIGN UP */}

        <Link
          to="/signup"
          style={{
            textAlign: 'center',
            color: '#4da6ff',
            textDecoration: 'none',
            fontWeight: 600,
            transition: '0.2s'
          }}
        >
          Создать аккаунт
        </Link>

        {/* RESET PASSWORD */}

        <div
          onClick={() =>
            navigate('/reset-password')
          }
          style={{
            cursor: 'pointer',
            color: '#9ca3af',
            textAlign: 'center',
            fontSize: 14,
            transition: '0.2s'
          }}
        >
          Забыли пароль?
        </div>
      </div>
    </div>
  )
}