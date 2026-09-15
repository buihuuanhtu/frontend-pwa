export type OfflineRecordSyncStatus = 'pending'

export type OfflineRecord = {
  id: string
  title: string
  note: string
  createdAt: string
  updatedAt?: string
  syncStatus: OfflineRecordSyncStatus
}
