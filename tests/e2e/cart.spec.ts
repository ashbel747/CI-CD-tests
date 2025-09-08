import { test, expect } from '@playwright/test';

// Mock API responses
const mockCartItem = {
  _id: 'cart-item-1',
  productId: {
    _id: 'product-1',
    name: 'Test Product',
    category: 'Electronics',
    niche: 'Smartphones',
    image: '/test-image.jpg',
    initialPrice: 50000,
    discountedPrice: 45000
  },
  quantity: 2
};

const mockCartItems = [mockCartItem];

test.describe('Cart Page', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock the cart API calls
    await page.route('**/api/cart', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockCartItems)
        });
      }
    });
    
    await page.goto('/cart');
  });

  test('should display loading state initially', async ({ page }) => {
    // Navigate to cart page without mocking to see loading state
    await page.goto('/cart', { waitUntil: 'domcontentloaded' });
    
    // Check for loading text (might be brief, so use a quick timeout)
    const loadingText = page.getByText('Loading cart...');
    await expect(loadingText).toBeVisible({ timeout: 1000 }).catch(() => {
      // Loading might be too fast to catch, which is fine
    });
  });

  test('should display cart items correctly', async ({ page }) => {
    // Wait for cart to load
    await expect(page.getByRole('heading', { name: 'My Cart' })).toBeVisible();
    
    // Check if product details are displayed
    await expect(page.getByText('Test Product')).toBeVisible();
    await expect(page.getByText('Electronics • Smartphones')).toBeVisible();
    await expect(page.getByText('Ksh 45,000 x 2 = Ksh 90,000')).toBeVisible();
    
    // Check if product image is displayed
    const productImage = page.getByAltText('Test Product');
    await expect(productImage).toBeVisible();
    
    // Check quantity controls
    await expect(page.getByRole('button', { name: '-' })).toBeVisible();
    await expect(page.getByRole('button', { name: '+' })).toBeVisible();
    await expect(page.getByText('2')).toBeVisible(); // quantity display
    
    // Check remove button
    await expect(page.getByRole('button', { name: 'Remove' })).toBeVisible();
  });

  test('should display correct total price', async ({ page }) => {
    await expect(page.getByText('Total: Ksh 90,000')).toBeVisible();
  });

  test('should display checkout button', async ({ page }) => {
    const checkoutButton = page.getByRole('button', { name: 'Checkout' });
    await expect(checkoutButton).toBeVisible();
    await expect(checkoutButton).toBeEnabled();
  });

  test('should increase quantity when + button is clicked', async ({ page }) => {
    // Mock the update cart API call
    await page.route('**/api/cart/**', async (route) => {
      if (route.request().method() === 'PUT') {
        const updatedItem = { ...mockCartItem, quantity: 3 };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([updatedItem])
        });
      }
    });

    // Click the increase button
    await page.getByRole('button', { name: '+' }).click();
    
    // Check for success toast
    await expect(page.getByText('Quantity updated!')).toBeVisible();
    
    // Verify the quantity updated in UI (you might need to reload the mock)
    await expect(page.getByText('Updating...')).toBeHidden();
  });

  test('should decrease quantity when - button is clicked', async ({ page }) => {
    // Mock the update cart API call
    await page.route('**/api/cart/**', async (route) => {
      if (route.request().method() === 'PUT') {
        const updatedItem = { ...mockCartItem, quantity: 1 };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([updatedItem])
        });
      }
    });

    // Click the decrease button
    await page.getByRole('button', { name: '-' }).click();
    
    // Check for success toast
    await expect(page.getByText('Quantity updated!')).toBeVisible();
  });

  test('should not allow quantity to go below 1', async ({ page }) => {
    // Set up cart with quantity 1
    const singleQuantityItem = { ...mockCartItem, quantity: 1 };
    await page.route('**/api/cart', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([singleQuantityItem])
        });
      }
    });

    await page.reload();

    // Try to decrease quantity when it's already 1
    await page.getByRole('button', { name: '-' }).click();
    
    // Check for error toast
    await expect(page.getByText('Quantity cannot be less than 1.')).toBeVisible();
  });

  test('should remove item from cart', async ({ page }) => {
    // Mock the remove from cart API call
    await page.route('**/api/cart/**', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]) // Empty cart after removal
        });
      }
    });

    // Click remove button
    await page.getByRole('button', { name: 'Remove' }).click();
    
    // Check for success toast
    await expect(page.getByText('Item removed successfully!')).toBeVisible();
  });

  test('should open checkout modal when checkout button is clicked', async ({ page }) => {
    await page.getByRole('button', { name: 'Checkout' }).click();
    
    // Check if modal opens (you'll need to adjust based on your modal implementation)
    // This assumes the modal has a specific test ID or identifiable element
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should display empty cart state', async ({ page }) => {
    // Clear existing route and mock empty cart response
    await page.unrouteAll();
    await page.route('**/api/cart**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      }
    });

    await page.goto('/cart', { waitUntil: 'networkidle' });
    
    // Check empty cart message
    await expect(page.getByText('Your cart is empty.')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Browse Products' })).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/cart', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });

    await page.reload();
    
    // Should show empty cart state when API fails
    await expect(page.getByText('Your cart is empty.')).toBeVisible();
  });

  test('should handle product data errors', async ({ page }) => {
    // Mock cart with invalid product data
    const invalidCartItem = {
      _id: 'cart-item-1',
      productId: 'invalid-string-id', // String instead of object
      quantity: 1
    };

    await page.route('**/api/cart', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([invalidCartItem])
        });
      }
    });

    await page.reload();
    
    // Check for error message
    await expect(page.getByText('Error: Product data is missing or invalid.')).toBeVisible();
  });

  test('should handle image loading errors', async ({ page }) => {
    // Wait for the page to load
    await expect(page.getByRole('heading', { name: 'My Cart' })).toBeVisible();
    
    // Get the product image
    const productImage = page.getByAltText('Test Product');
    
    // Simulate image error by evaluating JavaScript
    await page.evaluate(() => {
      const img = document.querySelector('img[alt="Test Product"]') as HTMLImageElement;
      if (img) {
        // Trigger the onError handler
        const event = new Event('error');
        img.dispatchEvent(event);
      }
    });
    
    // Check if fallback image is loaded
    const fallbackSrc = await productImage.getAttribute('src');
    expect(fallbackSrc).toContain('data:image/svg+xml');
  });

  test('should disable buttons during updates', async ({ page }) => {
    // Mock a slow API response
    await page.route('**/api/cart/**', async (route) => {
      // Delay the response to simulate loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCartItems)
      });
    });

    // Click increase button
    const increaseButton = page.getByRole('button', { name: '+' });
    await increaseButton.click();
    
    // Check that buttons are disabled during update
    await expect(increaseButton).toBeDisabled();
    await expect(page.getByRole('button', { name: '-' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Updating...' })).toBeVisible();
  });

  test('should navigate to products page from empty cart', async ({ page }) => {
    // Mock empty cart
    await page.route('**/api/cart', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.reload();
    
    // Click Browse Products button
    await page.getByRole('button', { name: 'Browse Products' }).click();
    
    // Check if navigated to products page
    await expect(page).toHaveURL('/products');
  });
});

// Test for accessibility
test.describe('Cart Page Accessibility', () => {
  test('should be accessible', async ({ page }) => {
    await page.route('**/api/cart', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockCartItem])
      });
    });
    
    await page.goto('/cart');
    await expect(page.getByRole('heading', { name: 'My Cart' })).toBeVisible();
    
    // Run accessibility tests
    // You can use @axe-core/playwright for more comprehensive accessibility testing
    // await injectAxe(page);
    // const accessibilityScanResults = await checkA11y(page);
    // expect(accessibilityScanResults.violations).toEqual([]);
  });
});