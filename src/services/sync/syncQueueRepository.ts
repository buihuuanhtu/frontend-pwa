import { appDb } from '@/services/offline/appDb'
import type {
  SyncHttpMethod,
  SyncQueueItem,
} from '@/services/sync/syncTypes'

type EnqueueSyncItem = {
  apiKey: string
  endpoint: string
  method: SyncHttpMethod
  payload?: unknown
  responseHandlerKey?: string
  entityType: string
  entityId: string
  createdAt?: string
}

export const createSyncQueueItem = (
  input: EnqueueSyncItem,
): SyncQueueItem => ({
  ...input,
  id: crypto.randomUUID(),
  createdAt: input.createdAt ?? new Date().toISOString(),
  status: 'pending',
  retryCount: 0,
})

export const syncQueueRepository = {
  async listInOrder(): Promise<SyncQueueItem[]> {
    const database = await appDb
    const items = await database.getAllFromIndex('sync-queue', 'by-created-at')

    return items.filter(
      (item) =>
        item.status === 'pending' ||
        item.status === 'processing' ||
        item.status === 'failed',
    )
  },

  async markAsProcessing(id: string): Promise<void> {
    const database = await appDb
    const item = await database.get('sync-queue', id)

    if (!item) return

    await database.put('sync-queue', {
      ...item,
      status: 'processing',
      lastAttemptAt: new Date().toISOString(),
      lastError: undefined,
    })
  },

  async markAsFailed(id: string, error: unknown): Promise<void> {
    const database = await appDb
    const item = await database.get('sync-queue', id)

    if (!item) return

    await database.put('sync-queue', {
      ...item,
      status: 'failed',
      retryCount: item.retryCount + 1,
      lastError: error instanceof Error ? error.message : 'Unknown sync error',
    })
  },

  async remove(id: string): Promise<void> {
    const database = await appDb
    await database.delete('sync-queue', id)
  },
}
