import { Navigate, Outlet } from 'react-router-dom'
import { tokenService } from '@/services/tokenService'

const ProtectedRoute = () => {
  const hasToken = tokenService.hasToken()

  if (!hasToken) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute