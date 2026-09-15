import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Empty,
  Form,
  Input,
  List,
  Popconfirm,
  Spin,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import {
  offlineRecordSchema,
  type OfflineRecordFormValues,
} from '@/features/offlineRecords/schemas/offlineRecordSchema'
import { offlineRecordRepository } from '@/features/offlineRecords/services/offlineRecordRepository'
import type { OfflineRecord } from '@/features/offlineRecords/types/offlineRecord'
import { useSync } from '@/services/sync/syncContext'
import './OfflineRecordsPage.css'

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short',
  timeStyle: 'short',
})

const EMPTY_FORM_VALUES: OfflineRecordFormValues = {
  title: '',
  note: '',
}

const OfflineRecordsPage = () => {
  const [records, setRecords] = useState<OfflineRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null)
  const [messageApi, messageContext] = message.useMessage()
  const isOnline = useOnlineStatus()
  const { sync, isSyncing, lastCompletedAt, lastResult } = useSync()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OfflineRecordFormValues>({
    resolver: zodResolver(offlineRecordSchema),
    defaultValues: EMPTY_FORM_VALUES,
  })

  useEffect(() => {
    let isActive = true

    offlineRecordRepository
      .list()
      .then((storedRecords) => {
        if (isActive) setRecords(storedRecords)
      })
      .catch(() => {
        if (isActive) messageApi.error('Không thể đọc dữ liệu đã lưu trên thiết bị')
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [messageApi])

  useEffect(() => {
    if (!lastCompletedAt || !lastResult) return

    offlineRecordRepository
      .list()
      .then(setRecords)
      .catch(() => messageApi.error('Không thể cập nhật dữ liệu sau đồng bộ'))

    if (lastResult.synced > 0) {
      messageApi.success(`Đã đồng bộ ${lastResult.synced} thao tác`)
    }

    if (lastResult.failed > 0) {
      messageApi.warning(`${lastResult.failed} thao tác chưa thể đồng bộ`)
    }
  }, [lastCompletedAt, lastResult, messageApi])

  const onSubmit = async (values: OfflineRecordFormValues) => {
    try {
      if (editingRecordId) {
        const updatedRecord = await offlineRecordRepository.update(
          editingRecordId,
          values,
        )
        setRecords((currentRecords) =>
          currentRecords.map((record) =>
            record.id === updatedRecord.id ? updatedRecord : record,
          ),
        )
        setEditingRecordId(null)
        reset(EMPTY_FORM_VALUES)
        messageApi.success('Đã cập nhật bản ghi trên thiết bị')
        if (isOnline) void sync()
        return
      }

      const record = await offlineRecordRepository.create(values)
      setRecords((currentRecords) => [record, ...currentRecords])
      reset(EMPTY_FORM_VALUES)
      messageApi.success('Đã lưu bản ghi trên thiết bị')
      if (isOnline) void sync()
    } catch {
      messageApi.error('Không thể lưu bản ghi trên thiết bị')
    }
  }

  const startEditing = (record: OfflineRecord) => {
    setEditingRecordId(record.id)
    reset({ title: record.title, note: record.note })
    document
      .getElementById('record-form-title')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const cancelEditing = () => {
    setEditingRecordId(null)
    reset(EMPTY_FORM_VALUES)
  }

  const removeRecord = async (id: string) => {
    try {
      await offlineRecordRepository.remove(id)
      setRecords((currentRecords) =>
        currentRecords.filter((record) => record.id !== id),
      )
      if (editingRecordId === id) cancelEditing()
      messageApi.success('Đã xóa bản ghi')
      if (isOnline) void sync()
    } catch {
      messageApi.error('Không thể xóa bản ghi')
    }
  }

  return (
    <main className="offline-records-page">
      {messageContext}

      <header className="offline-records-header">
        <div>
          <Typography.Title level={1}>Bản ghi ngoại tuyến</Typography.Title>
          <Typography.Text type="secondary">
            Dữ liệu được lưu trực tiếp trên thiết bị này.
          </Typography.Text>
        </div>
        <Tag color={isOnline ? 'success' : 'warning'}>
          {isOnline ? 'Đang trực tuyến' : 'Đang ngoại tuyến'}
        </Tag>
      </header>

      {!isOnline && (
        <Alert
          showIcon
          type="warning"
          message="Bạn đang ngoại tuyến"
          description="Bạn vẫn có thể tạo và xem các bản ghi đã lưu trên thiết bị."
        />
      )}

      <div className="offline-records-workspace">
      <section className="offline-records-form" aria-labelledby="record-form-title">
        <Typography.Title level={2} id="record-form-title">
          {editingRecordId ? 'Chỉnh sửa bản ghi' : 'Tạo bản ghi'}
        </Typography.Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Form.Item
            label="Tiêu đề"
            htmlFor="offline-record-title"
            validateStatus={errors.title ? 'error' : ''}
            help={errors.title?.message}
          >
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="offline-record-title"
                  placeholder="Nhập tiêu đề"
                  maxLength={120}
                  status={errors.title ? 'error' : ''}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Nội dung"
            htmlFor="offline-record-note"
            validateStatus={errors.note ? 'error' : ''}
            help={errors.note?.message}
          >
            <Controller
              name="note"
              control={control}
              render={({ field }) => (
                <Input.TextArea
                  {...field}
                  id="offline-record-note"
                  placeholder="Nhập nội dung"
                  maxLength={500}
                  autoSize={{ minRows: 3, maxRows: 6 }}
                  status={errors.note ? 'error' : ''}
                />
              )}
            />
          </Form.Item>

          <div className="offline-records-form-actions">
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={isSubmitting}
            >
              {editingRecordId ? 'Cập nhật bản ghi' : 'Lưu bản ghi'}
            </Button>
            {editingRecordId && (
              <Button icon={<CloseOutlined />} onClick={cancelEditing}>
                Hủy chỉnh sửa
              </Button>
            )}
          </div>
        </form>
      </section>

      <section className="offline-records-list" aria-labelledby="saved-records-title">
        <div className="offline-records-list-heading">
          <Typography.Title level={2} id="saved-records-title">
            Bản ghi đã lưu
          </Typography.Title>
          <div className="offline-records-list-meta">
            <Typography.Text type="secondary">{records.length} bản ghi</Typography.Text>
            <Tooltip title="Đồng bộ lại">
              <Button
                type="text"
                icon={<SyncOutlined spin={isSyncing} />}
                aria-label="Đồng bộ lại dữ liệu"
                disabled={!isOnline || isSyncing}
                onClick={() => void sync()}
              />
            </Tooltip>
          </div>
        </div>

        {isLoading ? (
          <div className="offline-records-loading">
            <Spin />
          </div>
        ) : (
          <List
            locale={{ emptyText: <Empty description="Chưa có bản ghi" /> }}
            dataSource={records}
            renderItem={(record) => (
              <List.Item key={record.id} className="offline-record-item">
                <div className="offline-record-content">
                  <div className="offline-record-title-row">
                    <Typography.Text strong>{record.title}</Typography.Text>
                    <Tag color={record.syncStatus === 'synced' ? 'success' : 'processing'}>
                      {record.syncStatus === 'synced' ? 'Đã đồng bộ' : 'Chờ đồng bộ'}
                    </Tag>
                  </div>
                  {record.note && (
                    <Typography.Paragraph>{record.note}</Typography.Paragraph>
                  )}
                  <Typography.Text type="secondary">
                    {record.updatedAt && record.updatedAt !== record.createdAt
                      ? `Đã sửa ${dateFormatter.format(new Date(record.updatedAt))}`
                      : `Đã tạo ${dateFormatter.format(new Date(record.createdAt))}`}
                  </Typography.Text>
                </div>

                <div className="offline-record-actions">
                  <Tooltip title="Sửa bản ghi">
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      aria-label={`Sửa ${record.title}`}
                      onClick={() => startEditing(record)}
                    />
                  </Tooltip>
                  <Popconfirm
                    title="Xóa bản ghi này?"
                    okText="Xóa"
                    cancelText="Hủy"
                    onConfirm={() => removeRecord(record.id)}
                  >
                    <Tooltip title="Xóa bản ghi">
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        aria-label={`Xóa ${record.title}`}
                      />
                    </Tooltip>
                  </Popconfirm>
                </div>
              </List.Item>
            )}
          />
        )}
      </section>
      </div>
    </main>
  )
}

export default OfflineRecordsPage
