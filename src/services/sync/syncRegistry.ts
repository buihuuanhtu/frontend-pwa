import { offlineRecordSyncResponseHandlers } from '@/features/offlineRecords/services/offlineRecordSyncService'
import { offlineRecordRepository } from '@/features/offlineRecords/services/offlineRecordRepository'
import type { SyncResponseHandler } from '@/services/sync/syncTypes'

const responseHandlers: Record<string, SyncResponseHandler> = {
  ...offlineRecordSyncResponseHandlers,
}

export const getSyncResponseHandler = (
  handlerKey: string,
): SyncResponseHandler => {
  const handler = responseHandlers[handlerKey]

  if (!handler) {
    throw new Error(`No sync response handler registered for ${handlerKey}`)
  }

  return handler
}

export const prepareSyncQueue = async (): Promise<void> => {
  await offlineRecordRepository.ensurePendingRecordsAreQueued()
}
