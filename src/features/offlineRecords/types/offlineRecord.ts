export type OfflineRecordSyncStatus = 'pending' | 'synced'

export type OfflineRecord = {
  id: string
  title: string
  note: string
  createdAt: string
  updatedAt?: string
  syncStatus: OfflineRecordSyncStatus
  remoteId?: string
  syncedAt?: string
}
