export type SyncHttpMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type SyncQueueStatus = 'pending' | 'processing' | 'failed'

export type SyncQueueItem = {
  id: string
  apiKey: string
  endpoint: string
  method: SyncHttpMethod
  payload?: unknown
  responseHandlerKey?: string
  entityType: string
  entityId: string
  status: SyncQueueStatus
  retryCount: number
  createdAt: string
  lastAttemptAt?: string
  lastError?: string
}

export type SyncResponseHandler = (
  item: SyncQueueItem,
  responseData: unknown,
) => Promise<void>

export type SyncResult = {
  synced: number
  failed: number
}
