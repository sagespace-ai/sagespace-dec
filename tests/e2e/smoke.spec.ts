import { test, expect } from "@playwright/test"

test.describe("Smoke Tests", () => {
  test("navigation works", async ({ page }) => {
    await page.goto("/")

    // Check homepage loads
    await expect(page).toHaveTitle(/SageSpace/)

    // Navigate to key pages
    await page.click('a[href="/council"]')
    await expect(page).toHaveURL(/\/council/)

    await page.click('a[href="/memory"]')
    await expect(page).toHaveURL(/\/memory/)

    await page.click('a[href="/observatory"]')
    await expect(page).toHaveURL(/\/observatory/)
  })

  test("council deliberation runs", async ({ page }) => {
    await page.goto("/council")

    // Fill in question
    await page.fill('textarea[placeholder*="question"]', "What is the meaning of life?")

    // Select sages
    await page.click('button:has-text("Select Sages")')
    await page.click('input[type="checkbox"]')

    // Start deliberation
    await page.click('button:has-text("Start")')

    // Wait for results (demo mode should be fast)
    await expect(page.locator("text=Synthesis")).toBeVisible({ timeout: 5000 })
  })

  test("memory persists conversation", async ({ page }) => {
    await page.goto("/")

    // Start a conversation
    await page.fill("textarea", "Hello, how are you?")
    await page.click('button[type="submit"]')

    // Wait for response
    await expect(page.locator("text=demo response")).toBeVisible({ timeout: 3000 })

    // Go to memory lane
    await page.click('a[href="/memory"]')

    // Check conversation appears
    await expect(page.locator("text=Hello, how are you?")).toBeVisible()
  })

  test("persona creation works", async ({ page }) => {
    await page.goto("/persona-editor")

    // Fill persona form
    await page.fill('input[name="name"]', "Test Sage")
    await page.fill('textarea[name="systemPrompt"]', "You are a test sage.")
    await page.fill('textarea[name="description"]', "A test persona")
    await page.fill('input[name="emoji"]', "🧪")

    // Save persona
    await page.click('button:has-text("Create")')

    // Check success message
    await expect(page.locator("text=created")).toBeVisible({ timeout: 2000 })
  })

  test("observatory displays metrics", async ({ page }) => {
    await page.goto("/observatory")

    // Check metrics are visible
    await expect(page.locator("text=Total Conversations")).toBeVisible()
    await expect(page.locator("text=Average Rating")).toBeVisible()
    await expect(page.locator("text=Response Time")).toBeVisible()

    // Check system health
    await expect(page.locator("text=healthy")).toBeVisible()
  })
})
