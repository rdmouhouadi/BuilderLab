import { test, expect } from '@playwright/test'

test.describe('Contact form', () => {
  test('submits a suggestion and shows a success message', async ({ page }) => {
    await page.goto('/contact')

    await page.getByPlaceholder('Your name').fill('E2E Test User')
    await page.getByPlaceholder('you@example.com').fill(`e2e-${Date.now()}@example.com`)
    await page.getByPlaceholder("What's on your mind?").fill('This is an automated E2E smoke test submission.')

    await page.getByRole('button', { name: 'Send message' }).click()

    await expect(page.getByText('Thanks for the suggestion!')).toBeVisible()
  })
})
