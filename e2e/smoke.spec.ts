import { expect, test } from "@playwright/test";

test.describe("Turnyfly smoke", () => {
  test("skip link moves focus to main content", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", {
      name: "Към основното съдържание",
    });
    await expect(skip).toBeFocused();
    await skip.click();
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("keyboard create flow reaches team management", async ({ page }) => {
    await page.goto("/organize");
    await expect(page.getByLabel("Име на турнира")).toBeVisible();
    await page.getByLabel("Име на турнира").fill("Тестов турнир");
    await page.getByLabel("Спорт / дисциплина").fill("Баскетбол");
    await page.getByLabel("Начална дата").fill("2026-06-01");
    await page.getByLabel("Крайна дата").fill("2026-06-02");
    await page.getByRole("button", { name: "Създай и добави отбори" }).click();
    await expect(
      page.getByRole("heading", { name: "Тестов турнир" }),
    ).toBeVisible();
    await page.getByLabel("Нов отбор / участник").fill("Отбор А");
    await page.getByRole("button", { name: "Добави" }).click();
    await expect(page.getByText("Отбор А")).toBeVisible();
  });

  test("score entry announces via live region", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: "Възстанови демо" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Възстанови демо" }).click();
    await page.goto("/organize/demo-volleyball");
    await expect(
      page.getByRole("heading", { name: "Пролетна купа София" }),
    ).toBeVisible();
    await page.getByRole("tab", { name: "Резултати" }).click();

    const saveButton = page
      .getByRole("button", { name: "Запази резултат" })
      .first();
    const form = saveButton.locator("xpath=ancestor::form");
    const inputs = form.locator("input");
    await inputs.nth(0).fill("3");
    await inputs.nth(1).fill("0");
    await saveButton.click();

    await expect(
      page.getByRole("status").filter({ hasText: "Резултатът е обновен" }),
    ).toBeAttached({ timeout: 5000 });
  });
});
