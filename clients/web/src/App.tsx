import React, { createContext, useContext, useState, useEffect } from 'react'
import Feed from './components/Feed'
import UploadPage from "./components/UploadPage"

type AuthContextType = {
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))

  useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  async function login(email: string, password: string) {
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', password)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: form
    })

    if (!res.ok) throw new Error('Login failed')

    const data = await res.json()
    setToken(data.access_token)
  }

  function logout() {
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

function LoginForm() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      setError((err as Error).message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="login-form" style={{color: '#fff'}}>
      <h2>Завести аккаунт</h2>
      <div>
        <input placeholder="Электронная почта" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div>
        <input placeholder="Пароль" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <div>
        <button type="submit" disabled={loading}>{loading ? 'Вход в систему...' : 'Авторизоваться'}</button>
      </div>
      {error && <div style={{color: 'salmon'}}>{error}</div>}
    </form>
  )
}

// New: Sign up form that calls /auth/signin
function SignUpForm({ onSigned }: { onSigned: (email: string, password: string) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [okMsg, setOkMsg] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setOkMsg(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, password_confirm: passwordConfirm })
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || 'Signup failed')
      }
      setOkMsg('Зарегистрирован. Проверьте свою электронную почту на наличие кода подтверждения.')
      onSigned(email, password)
    } catch (err) {
      setError((err as Error).message || 'Регистрация не удалась')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="login-form" style={{ color: '#fff' }}>
      <h2>Sign up</h2>
      <div>
        <input placeholder="Электронная почта" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div>
        <input placeholder="Пароль" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <div>
        <input placeholder="Подтвердите пароль" type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} />
      </div>
      <div>
        <button type="submit" disabled={loading}>{loading ? 'Подписание...' : 'Зарегистрироваться'}</button>
      </div>
      {okMsg && <div style={{ color: 'lightgreen' }}>{okMsg}</div>}
      {error && <div style={{ color: 'salmon' }}>{error}</div>}
    </form>
  )
}

// New: Confirm form that calls /auth/confirm
function ConfirmForm({ email, onConfirmed }: { email?: string; onConfirmed?: () => void }) {
  const [code, setCode] = useState('')
  const [addr, setAddr] = useState(email ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [okMsg, setOkMsg] = useState<string | null>(null)

  useEffect(() => {
    if (email) setAddr(email)
  }, [email])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setOkMsg(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, email: addr })
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || 'Подтверждение не удалось')
      }
      setOkMsg('Учетная запись подтверждена. Теперь вы можете войти в систему.')
      onConfirmed && onConfirmed()
    } catch (err) {
      setError((err as Error).message || 'Подтверждение не удалось')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="login-form" style={{ color: '#fff' }}>
      <h2>Confirm account</h2>
      <div>
        <input placeholder="Электронная почта" value={addr} onChange={e => setAddr(e.target.value)} />
      </div>
      <div>
        <input placeholder="Код подтверждения" value={code} onChange={e => setCode(e.target.value)} />
      </div>
      <div>
        <button type="submit" disabled={loading}>{loading ? 'Подтверждение...' : 'Подтверждать'}</button>
      </div>
      {okMsg && <div style={{ color: 'lightgreen' }}>{okMsg}</div>}
      {error && <div style={{ color: 'salmon' }}>{error}</div>}
    </form>
  )
}

// Replace Main to allow switching between login / signup / confirm
function Main() {
  const auth = useContext(AuthContext)
  if (!auth) return null

  const [view, setView] = useState<'login' | 'signup' | 'confirm' | 'upload'>('login')
  const [signed, setSigned] = useState<{ email: string; password: string } | null>(null)

  if (auth.token) {
    if (view === "upload") {
      return <UploadPage onBack={() => setView("login")} />
    }

    return (
      <div id="app-root" style={{ position: 'relative' }}>

        <div style={{ position: 'fixed', top: '1em', right: '1em'}}>
          <button onClick={auth.logout}>Выход</button>
        </div>

        <div style={{ position: 'fixed', top: '1em', left: '1em'}}>
          <button onClick={() => setView("upload")}>
            Загрузить
          </button>
        </div>

        <Feed />

      </div>
    )
  }

  return (
    <div id="app-root">
      {view === 'login' && (
        <div>
          <LoginForm />
          <div style={{ marginTop: 12 }}>
            <button onClick={() => setView('signup')}>Зарегистрироваться</button>
          </div>
        </div>
      )}

      {view === 'signup' && (
        <div>
          <SignUpForm onSigned={(email, password) => { setSigned({ email, password }); setView('confirm') }} />
          <div style={{ marginTop: 12 }}>
            <button onClick={() => setView('login')}>Вернуться к авторизации</button>
          </div>
        </div>
      )}

      {view === 'confirm' && (
        <div>
          <ConfirmForm email={signed?.email} onConfirmed={async () => {
            // try to auto-login after confirm if we have the password
            if (signed?.password && signed?.email) {
              try {
                await auth.login(signed.email, signed.password)
              } catch { /* ignore errors */ }
            }
          }} />
          <div style={{ marginTop: 12 }}>
            <button onClick={() => setView('login')}>Вернуться к авторизации</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  )
}
