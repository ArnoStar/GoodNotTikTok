import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react'

type AuthContextType = {
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error('useAuth must be inside AuthProvider')
  }

  return ctx
}

export function AuthProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token')
  )

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }, [token])

  async function login(email: string, password: string) {
    const form = new URLSearchParams()

    form.append('username', email)
    form.append('password', password)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type':
          'application/x-www-form-urlencoded'
      },
      body: form
    })

    if (!res.ok) {
      throw new Error('Login failed')
    }

    const data = await res.json()

    setToken(data.access_token)
  }

  function logout() {
    setToken(null)
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}