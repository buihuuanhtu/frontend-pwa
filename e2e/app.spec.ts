import { expect, test } from '@playwright/test'

test('redirects private routes and reloads the login shell offline', async ({ page, context }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('button', { name: 'Đăng nhập' })).toBeVisible()
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })

  // A newly installed service worker controls this page after the next navigation.
  await page.reload()
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true)

  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('button', { name: 'Đăng nhập' })).toBeVisible()
})

test('creates and restores a record while offline', async ({ page, context }) => {
  await page.goto('/login')
  await page.getByPlaceholder('Tên đăng nhập').fill('offline-user')
  await page.getByPlaceholder('Mật khẩu').fill('password')
  await page.getByRole('button', { name: 'Đăng nhập' }).click()
  await expect(page).toHaveURL(/\/offline-records$/)

  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  await page.reload()
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true)

  await context.setOffline(true)
  await page.getByPlaceholder('Nhập tiêu đề').fill('Bản ghi khi mất mạng')
  await page.getByPlaceholder('Nhập nội dung').fill('Nội dung được lưu trong IndexedDB')
  await page.getByRole('button', { name: 'Lưu bản ghi' }).click()
  await expect(page.getByText('Bản ghi khi mất mạng')).toBeVisible()

  await page.reload()
  await expect(page.getByText('Bản ghi khi mất mạng')).toBeVisible()

  await page.getByRole('button', { name: 'Sửa Bản ghi khi mất mạng' }).click()
  await page.getByPlaceholder('Nhập tiêu đề').fill('Bản ghi đã chỉnh sửa')
  await page.getByPlaceholder('Nhập nội dung').fill('Nội dung đã cập nhật khi offline')
  await page.getByRole('button', { name: 'Cập nhật bản ghi' }).click()
  await expect(page.getByText('Bản ghi đã chỉnh sửa')).toBeVisible()

  await page.reload()
  await expect(page.getByText('Bản ghi đã chỉnh sửa')).toBeVisible()
})
