import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'

import { AuthProvider, useAuth } from '../context/AuthContext'

import LoginPage from '../pages/LoginPage'
import SignupPage from '../pages/SignupPage'
import ConfirmPage from '../pages/ConfirmPage'
import FeedPage from '../pages/FeedPage'
import UploadPage from '../pages/UploadPage'
import ProfilePage from '../pages/ProfilePage'
import ResetPasswordPage from '../pages/ResetPasswordPage'
import ConfirmResetPasswordPage from '../pages/ConfirmResetPasswordPage'

function ProtectedRoute({
  children
}: {
  children: React.ReactNode
}) {
  const { token } = useAuth()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/signup"
        element={<SignupPage />}
      />

      <Route
        path="/confirm"
        element={<ConfirmPage />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <FeedPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/:user_id"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reset-password"
        element={<ResetPasswordPage />}
      />

      <Route
        path="/confirm-reset-password"
        element={<ConfirmResetPasswordPage />}
      />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}