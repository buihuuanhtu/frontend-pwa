import { z } from 'zod'

import { offlineRecordRepository } from '@/features/offlineRecords/services/offlineRecordRepository'
import type { SyncResponseHandler } from '@/services/sync/syncTypes'

const upsertPayloadSchema = z.object({
  title: z.string(),
  body: z.string(),
  userId: z.number(),
  clientId: z.string(),
  updatedAt: z.string(),
  remoteId: z.string().optional(),
})

const upsertResponseSchema = z.object({
  id: z.union([z.string(), z.number()]),
})

const markRecordAsSynced: SyncResponseHandler = async (
  item,
  responseData,
) => {
  const payload = upsertPayloadSchema.parse(item.payload)
  const response = upsertResponseSchema.parse(responseData)

  await offlineRecordRepository.markAsSynced(
    item.entityId,
    String(response.id),
    payload.updatedAt,
  )
}

export const offlineRecordSyncResponseHandlers: Record<
  string,
  SyncResponseHandler
> = {
  'offline-record.mark-synced': markRecordAsSynced,
}
