import { RouterProvider } from 'react-router-dom'
import { router } from '@/app/router'
import { SyncProvider } from '@/services/sync/SyncProvider'

function App() {
  return (
    <SyncProvider>
      <RouterProvider router={router} />
    </SyncProvider>
  )
}

export default App
