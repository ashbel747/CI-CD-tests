import { test, expect } from '@playwright/test';

test.describe('Help & FAQs Page', () => {
  test('should render Help & FAQs page', async ({ page }) => {
    // Go to /help page
    await page.goto('/help');

    // Check the page title
    await expect(page).toHaveTitle(/Help & FAQs/);

    // Verify the main heading
    await expect(
      page.getByRole('heading', { name: 'Help & FAQs' })
    ).toBeVisible();

    // Verify FAQs component is present
    await expect(page.getByTestId('faqs-container')).toBeVisible();
  });
});
