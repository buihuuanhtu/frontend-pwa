import { openDB, type DBSchema } from 'idb'

import type { OfflineRecord } from '@/features/offlineRecords/types/offlineRecord'

interface AppDbSchema extends DBSchema {
  'offline-records': {
    key: string
    value: OfflineRecord
    indexes: {
      'by-created-at': string
      'by-sync-status': OfflineRecord['syncStatus']
    }
  }
}

export const appDb = openDB<AppDbSchema>('frontend-pwa-db', 1, {
  upgrade(database) {
    const recordStore = database.createObjectStore('offline-records', {
      keyPath: 'id',
    })

    recordStore.createIndex('by-created-at', 'createdAt')
    recordStore.createIndex('by-sync-status', 'syncStatus')
  },
})
