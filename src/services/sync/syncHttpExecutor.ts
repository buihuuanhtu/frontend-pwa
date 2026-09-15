import { getApiClient } from '@/services/sync/apiClientRegistry'
import type { SyncQueueItem } from '@/services/sync/syncTypes'

export const executeSyncRequest = async (
  item: SyncQueueItem,
): Promise<unknown> => {
  const client = getApiClient(item.apiKey)
  const response = await client.request({
    url: item.endpoint,
    method: item.method,
    data: item.payload,
  })

  return response.data
}
