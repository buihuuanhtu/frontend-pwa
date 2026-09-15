import {
  getSyncResponseHandler,
  prepareSyncQueue,
} from '@/services/sync/syncRegistry'
import { executeSyncRequest } from '@/services/sync/syncHttpExecutor'
import { syncQueueRepository } from '@/services/sync/syncQueueRepository'
import type { SyncResult } from '@/services/sync/syncTypes'

let activeSync: Promise<SyncResult> | null = null

const runSync = async (): Promise<SyncResult> => {
  await prepareSyncQueue()
  const items = await syncQueueRepository.listInOrder()
  const result: SyncResult = { synced: 0, failed: 0 }

  for (const item of items) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) break

    try {
      await syncQueueRepository.markAsProcessing(item.id)
      const responseData = await executeSyncRequest(item)

      if (item.responseHandlerKey) {
        const responseHandler = getSyncResponseHandler(item.responseHandlerKey)
        await responseHandler(item, responseData)
      }

      await syncQueueRepository.remove(item.id)
      result.synced += 1
    } catch (error) {
      await syncQueueRepository.markAsFailed(item.id, error)
      result.failed += 1
    }
  }

  return result
}

export const syncCoordinator = {
  syncPending(): Promise<SyncResult> {
    if (activeSync) return activeSync

    activeSync = runSync().finally(() => {
      activeSync = null
    })

    return activeSync
  },
}
