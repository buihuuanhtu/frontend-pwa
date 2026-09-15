import { createBrowserRouter, Navigate } from 'react-router-dom'

import ProtectedRoute from '@/features/auth/components/ProtectedRoute'
import LoginPage from '@/features/auth/pages/LoginPage'
import OfflineRecordsPage from '@/features/offlineRecords/pages/OfflineRecordsPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <Navigate to="/offline-records" replace />,
      },
      {
        path: '/offline-records',
        element: <OfflineRecordsPage />,
      },
    ],
  },
])
