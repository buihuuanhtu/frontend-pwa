import { appDb } from '@/services/offline/appDb'
import type { OfflineRecord } from '@/features/offlineRecords/types/offlineRecord'

type OfflineRecordInput = Pick<OfflineRecord, 'title' | 'note'>

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
    await database.add('offline-records', record)

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

    await database.put('offline-records', updatedRecord)

    return updatedRecord
  },

  async remove(id: string): Promise<void> {
    const database = await appDb
    await database.delete('offline-records', id)
  },
}
