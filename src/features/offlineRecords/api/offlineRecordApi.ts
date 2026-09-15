import type { OfflineRecord } from '@/features/offlineRecords/types/offlineRecord'
import type { SyncHttpMethod } from '@/services/sync/syncTypes'

type SyncRequestDescriptor = {
  apiKey: string
  endpoint: string
  method: SyncHttpMethod
  payload?: unknown
  responseHandlerKey?: string
}

const API_KEY = 'demo-api'
const POSTS_ENDPOINT = '/posts'

export const offlineRecordApi = {
  createUpsertRequest(record: OfflineRecord): SyncRequestDescriptor {
    return {
      apiKey: API_KEY,
      endpoint: POSTS_ENDPOINT,
      method: 'POST',
      payload: {
        title: record.title,
        body: record.note,
        userId: 1,
        clientId: record.id,
        updatedAt: record.updatedAt,
        remoteId: record.remoteId,
      },
      responseHandlerKey: 'offline-record.mark-synced',
    }
  },

  createDeleteRequest(remoteId: string): SyncRequestDescriptor {
    return {
      apiKey: API_KEY,
      endpoint: `${POSTS_ENDPOINT}/${encodeURIComponent(remoteId)}`,
      method: 'DELETE',
    }
  },
}
