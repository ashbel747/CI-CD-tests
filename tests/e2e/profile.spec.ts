import { test, expect } from "@playwright/test";

test.describe("Profile Page", () => {
  test("should block unauthorized user", async ({ page }) => {
    await page.goto("/profile");

    // Give the page a chance to load
    await page.waitForTimeout(1000);

    const loading = page.getByText("Loading...");
    const errorMessage = page.getByText("Could not load profile");
    const loginLink = page.getByRole("link", { name: "Login" });

    // Check which one is actually visible
    if (await loading.isVisible()) {
        // If stuck on loading, fail
        throw new Error("Profile page is stuck on loading for unauthorized user");
    }

    const isErrorVisible = await errorMessage.isVisible();
    const isLoginVisible = await loginLink.isVisible();

    expect(isErrorVisible || isLoginVisible).toBeTruthy();
  });



  test("should show profile details for logged in user", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.fill('input[name="email"]', "mainaashbel@gmail.com");
    await page.fill('input[name="password"]', "1238@ashbel");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/");

    // Navigate to profile
    await page.goto("/profile");

    // Profile heading
    await expect(page.getByRole("heading", { name: "My Profile" })).toBeVisible();

    // Profile details
    await expect(page.getByText(/Name:/)).toBeVisible();
    await expect(page.getByText(/Email:/)).toBeVisible();
    await expect(page.getByText(/Role:/)).toBeVisible();

    // Logout button (scoped to profile container)
    const profileContainer = page.locator("div", { hasText: "My Profile" });
    await expect(profileContainer.getByRole("button", { name: "Logout" })).toBeVisible();
  });
});
