import { useMutation } from '@tanstack/react-query'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'

import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { syncCoordinator } from '@/services/sync/syncCoordinator'
import {
  SyncContext,
  type SyncContextValue,
} from '@/services/sync/syncContext'
import type { SyncResult } from '@/services/sync/syncTypes'

export const SyncProvider = ({ children }: PropsWithChildren) => {
  const isOnline = useOnlineStatus()
  const [lastCompletedAt, setLastCompletedAt] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<SyncResult | null>(null)
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['sync-queue'],
    mutationFn: syncCoordinator.syncPending,
    onSuccess: (result) => {
      setLastResult(result)
      setLastCompletedAt(new Date().toISOString())
    },
  })

  const sync = useCallback(() => mutateAsync(), [mutateAsync])

  useEffect(() => {
    if (isOnline) void sync()
  }, [isOnline, sync])

  const value = useMemo<SyncContextValue>(
    () => ({
      isSyncing: isPending,
      lastCompletedAt,
      lastResult,
      sync,
    }),
    [isPending, lastCompletedAt, lastResult, sync],
  )

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>
}
