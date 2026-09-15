import { z } from 'zod'

export const offlineRecordSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập tiêu đề')
    .max(120, 'Tiêu đề không được vượt quá 120 ký tự'),
  note: z
    .string()
    .trim()
    .max(500, 'Nội dung không được vượt quá 500 ký tự'),
})

export type OfflineRecordFormValues = z.infer<typeof offlineRecordSchema>
