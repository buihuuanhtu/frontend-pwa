import { openDB, type DBSchema } from 'idb'

import type { OfflineRecord } from '@/features/offlineRecords/types/offlineRecord'
import type { SyncQueueItem } from '@/services/sync/syncTypes'

interface AppDbSchema extends DBSchema {
  'offline-records': {
    key: string
    value: OfflineRecord
    indexes: {
      'by-created-at': string
      'by-sync-status': OfflineRecord['syncStatus']
    }
  }
  'sync-queue': {
    key: string
    value: SyncQueueItem
    indexes: {
      'by-created-at': string
      'by-status': SyncQueueItem['status']
      'by-entity': [string, string]
    }
  }
}

export const appDb = openDB<AppDbSchema>('frontend-pwa-db', 4, {
  upgrade(database) {
    // Demo reset: rebuild the latest schema without preserving older local data.
    if (database.objectStoreNames.contains('offline-records')) {
      database.deleteObjectStore('offline-records')
    }

    if (database.objectStoreNames.contains('sync-queue')) {
      database.deleteObjectStore('sync-queue')
    }

    const recordStore = database.createObjectStore('offline-records', {
      keyPath: 'id',
    })
    recordStore.createIndex('by-created-at', 'createdAt')
    recordStore.createIndex('by-sync-status', 'syncStatus')

    const syncQueueStore = database.createObjectStore('sync-queue', {
      keyPath: 'id',
    })
    syncQueueStore.createIndex('by-created-at', 'createdAt')
    syncQueueStore.createIndex('by-status', 'status')
    syncQueueStore.createIndex('by-entity', ['entityType', 'entityId'])
  },
})
