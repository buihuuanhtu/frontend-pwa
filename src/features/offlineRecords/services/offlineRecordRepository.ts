import { appDb } from '@/services/offline/appDb'
import { createSyncQueueItem } from '@/services/sync/syncQueueRepository'
import { offlineRecordApi } from '@/features/offlineRecords/api/offlineRecordApi'
import type { OfflineRecord } from '@/features/offlineRecords/types/offlineRecord'

type OfflineRecordInput = Pick<OfflineRecord, 'title' | 'note'>

const ENTITY_TYPE = 'offline-record'
const SYNCED_RESPONSE_HANDLER = 'offline-record.mark-synced'

const createUpsertQueueItem = (record: OfflineRecord) =>
  createSyncQueueItem({
    ...offlineRecordApi.createUpsertRequest(record),
    entityType: ENTITY_TYPE,
    entityId: record.id,
    createdAt: record.updatedAt,
  })

export const offlineRecordRepository = {
  async list(): Promise<OfflineRecord[]> {
    const database = await appDb
    const records = await database.getAllFromIndex(
      'offline-records',
      'by-created-at',
    )

    return records.reverse()
  },

  async create(input: OfflineRecordInput): Promise<OfflineRecord> {
    const createdAt = new Date().toISOString()
    const record: OfflineRecord = {
      id: crypto.randomUUID(),
      title: input.title,
      note: input.note,
      createdAt,
      updatedAt: createdAt,
      syncStatus: 'pending',
    }

    const database = await appDb
    const transaction = database.transaction(
      ['offline-records', 'sync-queue'],
      'readwrite',
    )

    await Promise.all([
      transaction.objectStore('offline-records').add(record),
      transaction.objectStore('sync-queue').add(createUpsertQueueItem(record)),
      transaction.done,
    ])

    return record
  },

  async update(
    id: string,
    input: OfflineRecordInput,
  ): Promise<OfflineRecord> {
    const database = await appDb
    const currentRecord = await database.get('offline-records', id)

    if (!currentRecord) {
      throw new Error('Offline record not found')
    }

    const updatedRecord: OfflineRecord = {
      ...currentRecord,
      ...input,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    }

    const transaction = database.transaction(
      ['offline-records', 'sync-queue'],
      'readwrite',
    )

    await Promise.all([
      transaction.objectStore('offline-records').put(updatedRecord),
      transaction
        .objectStore('sync-queue')
        .add(createUpsertQueueItem(updatedRecord)),
      transaction.done,
    ])

    return updatedRecord
  },

  async markAsSynced(
    id: string,
    remoteId: string,
    syncedVersion: string,
  ): Promise<OfflineRecord | undefined> {
    const database = await appDb
    const currentRecord = await database.get('offline-records', id)

    if (!currentRecord) return undefined

    const syncedRecord: OfflineRecord = {
      ...currentRecord,
      remoteId,
      syncedAt: new Date().toISOString(),
      syncStatus:
        currentRecord.updatedAt === syncedVersion ? 'synced' : 'pending',
    }

    await database.put('offline-records', syncedRecord)

    return syncedRecord
  },

  async ensurePendingRecordsAreQueued(): Promise<void> {
    const database = await appDb
    const transaction = database.transaction(
      ['offline-records', 'sync-queue'],
      'readwrite',
    )
    const recordStore = transaction.objectStore('offline-records')
    const queueStore = transaction.objectStore('sync-queue')
    const [pendingRecords, queuedItems] = await Promise.all([
      recordStore.index('by-sync-status').getAll('pending'),
      queueStore.getAll(),
    ])
    const queuedEntityIds = new Set(
      queuedItems
        .filter((item) => item.responseHandlerKey === SYNCED_RESPONSE_HANDLER)
        .map((item) => item.entityId),
    )

    for (const record of pendingRecords) {
      if (!queuedEntityIds.has(record.id)) {
        await queueStore.add(createUpsertQueueItem(record))
      }
    }

    await transaction.done
  },

  async remove(id: string): Promise<void> {
    const database = await appDb
    const transaction = database.transaction(
      ['offline-records', 'sync-queue'],
      'readwrite',
    )
    const recordStore = transaction.objectStore('offline-records')
    const queueStore = transaction.objectStore('sync-queue')
    const currentRecord = await recordStore.get(id)

    if (!currentRecord) return

    const queuedItems = await queueStore.index('by-entity').getAll([
      ENTITY_TYPE,
      id,
    ])

    for (const item of queuedItems) {
      await queueStore.delete(item.id)
    }

    if (currentRecord.remoteId) {
      await queueStore.add(
        createSyncQueueItem({
          ...offlineRecordApi.createDeleteRequest(currentRecord.remoteId),
          entityType: ENTITY_TYPE,
          entityId: id,
        }),
      )
    }

    await recordStore.delete(id)
    await transaction.done
  },
}
