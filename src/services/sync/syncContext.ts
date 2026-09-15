import { createContext, useContext } from 'react'

import type { SyncResult } from '@/services/sync/syncTypes'

export type SyncContextValue = {
  isSyncing: boolean
  lastCompletedAt: string | null
  lastResult: SyncResult | null
  sync: () => Promise<SyncResult>
}

export const SyncContext = createContext<SyncContextValue | null>(null)

export const useSync = (): SyncContextValue => {
  const context = useContext(SyncContext)

  if (!context) {
    throw new Error('useSync must be used within SyncProvider')
  }

  return context
}
