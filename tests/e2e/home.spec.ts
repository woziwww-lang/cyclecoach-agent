import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("home exposes the main product entry points", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: /let/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /dashboard/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /plan/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /page|settings|sign/i })).toBeVisible();
});

test("home has no obvious accessibility violations", async ({ page }) => {
  await page.goto("/");

  const results = await new AxeBuilder({ page })
    .disableRules(["color-contrast"])
    .analyze();

  expect(results.violations).toEqual([]);
});
