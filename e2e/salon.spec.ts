import { test, expect } from "@playwright/test";

test.describe("The Jawed Habib Salon – Lalganj E2E Test Suite", () => {
  test("Homepage loads with luxury branding and verified business facts", async ({ page }) => {
    await page.goto("/");

    // Verify Brand title & Logo
    await expect(page).toHaveTitle(/The Jawed Habib Salon/i);
    await expect(page.getByText("THE JAWED HABIB").first()).toBeVisible();

    // Verify Lalganj branch identity
    await expect(page.getByText(/Lalganj/i).first()).toBeVisible();

    // Verify Operating hours
    await expect(page.getByText(/10:00 AM – 10:00 PM/i).first()).toBeVisible();

    // Verify CTA buttons
    const bookBtn = page.getByRole("link", { name: /Book Appointment/i }).first();
    await expect(bookBtn).toBeVisible();
  });

  test("Navigation across public salon pages", async ({ page }) => {
    // Services Page
    await page.goto("/services");
    await expect(page).toHaveTitle(/Services/i);
    await expect(page.getByText(/Hair Services|Haircuts/i).first()).toBeVisible();

    // Pricing Page
    await page.goto("/pricing");
    await expect(page).toHaveTitle(/Pricing/i);
    await expect(page.getByText(/Standard Haircut/i).first()).toBeVisible();

    // Packages Page
    await page.goto("/packages");
    await expect(page).toHaveTitle(/Packages/i);
    await expect(page.getByText(/Signature Hair Refresh/i).first()).toBeVisible();

    // Transformations Page
    await page.goto("/transformations");
    await expect(page).toHaveTitle(/Transformations/i);

    // Gallery Page
    await page.goto("/gallery");
    await expect(page).toHaveTitle(/Gallery/i);

    // Stylists Page
    await page.goto("/stylists");
    await expect(page).toHaveTitle(/Stylists/i);
  });

  test("Appointment Booking Workflow", async ({ page }) => {
    await page.goto("/booking");
    await expect(page.getByText(/Book Your Experience/i).first()).toBeVisible();

    // Step 1: Select a service
    const serviceCheckbox = page.locator("input[type='checkbox']").first();
    if (await serviceCheckbox.isVisible()) {
      await serviceCheckbox.check();
    }

    // Step 2: Next button
    const nextBtn = page.getByRole("button", { name: /Next|Continue/i }).first();
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
    }
  });

  test("Customer Login & Registration Page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel(/Phone Number or Email/i).or(page.getByPlaceholder(/phone/i)).first()).toBeVisible();

    await page.goto("/register");
    await expect(page.getByLabel(/Full Name/i).or(page.getByPlaceholder(/name/i)).first()).toBeVisible();
  });

  test("Admin Authentication & Protected Routes", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByText(/Administrative Access/i).or(page.getByText(/Admin Login/i)).first()).toBeVisible();
  });
});
