import { expect, test, type Page } from "@playwright/test";

async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Потребителско име").fill("admin");
  await page.getByLabel("Парола", { exact: true }).fill("turnyfly-demo");
  await page.getByRole("button", { name: "Вход" }).click();
  await expect(page).toHaveURL(/\/organize/);
}

test.describe("ScoreLive smoke", () => {
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

  test("locale toggle switches English UI and html lang", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "bg");
    await page.getByRole("button", { name: "English" }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(
      page.getByRole("heading", {
        name: "Tournaments for organizers, players, and fans",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Restore demo" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Български" }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "bg");
  });

  test("guest is redirected from organize to login", async ({ page }) => {
    await page.goto("/organize");
    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: "Вход за организатор" }),
    ).toBeVisible();
  });

  test("organizer can register and reach organize", async ({ page }) => {
    const suffix = Date.now().toString(36);
    const username = `org_${suffix}`;
    await page.goto("/register");
    const main = page.locator("#main-content");
    await expect(
      main.getByRole("heading", { name: "Регистрация за организатор" }),
    ).toBeVisible();
    await main.getByRole("textbox", { name: "Потребителско име" }).fill(username);
    await main.locator('input[name="password"]').fill("securepass1");
    await main.locator('input[name="confirmPassword"]').fill("securepass1");
    await main.getByRole("button", { name: "Регистрация" }).click();
    await expect(page).toHaveURL(/\/organize/);
    await expect(
      page.getByRole("heading", { name: "Организирай турнир" }),
    ).toBeVisible();
  });

  test("mobile nav opens drawer without page overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.getByText("ScoreLive").first()).toBeVisible();
    const openMenu = page.getByRole("button", { name: "Отвори меню" });
    await expect(openMenu).toBeVisible();
    await openMenu.click();
    await expect(page.getByRole("link", { name: "Любими" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Регистрация" })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflow).toBe(false);
  });

  test("keyboard create flow reaches team management", async ({ page }) => {
    await loginAsAdmin(page);
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
    await expect(page.getByText("BG", { exact: true }).first()).toBeVisible();
  });

  test("public tournament matches tab switches content", async ({ page }) => {
    await page.goto("/tournaments/demo-volleyball");
    await expect(
      page.getByRole("heading", { name: "Пролетна купа София" }),
    ).toBeVisible();
    await expect(page.getByText("Група A")).toBeVisible();
    const matchesTab = page.getByRole("tab", { name: "Мачове" });
    await expect(matchesTab).toBeVisible();
    await matchesTab.click();
    await expect(matchesTab).toHaveAttribute("aria-selected", "true");
    await expect(
      page.getByRole("heading", { name: "Мачове", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("list", { name: "Списък с мачове" }),
    ).toBeVisible();
  });

  test("league demo shows standings table", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Възстанови демо" }).click();
    await page.goto("/tournaments/demo-league");
    await expect(
      page.getByRole("heading", { name: "Есенно първенство Бургас" }),
    ).toBeVisible();
    await expect(
      page.getByText(/Първенство · 2026-09-01/),
    ).toBeVisible();
    await expect(
      page.getByRole("tab", { name: "Класиране" }),
    ).toBeVisible();
  });

  test("swiss demo shows standings with Buchholz", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Възстанови демо" }).click();
    await page.goto("/tournaments/demo-swiss");
    await expect(
      page.getByRole("heading", { name: "Швейцарска система Русе" }),
    ).toBeVisible();
    await expect(page.getByText(/Швейцарска система ·/)).toBeVisible();
    await expect(page.getByRole("tab", { name: "Класиране" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Бх" })).toBeVisible();
  });

  test("theme toggle persists dark class on html", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", {
      name: "Превключи към тъмна тема",
    });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await page
      .getByRole("button", { name: "Превключи към светла тема" })
      .click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });

  test("about and faq content pages render", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { name: "За ScoreLive" })).toBeVisible();
    await page.goto("/faq");
    await expect(
      page.getByRole("heading", { name: "Често задавани въпроси" }),
    ).toBeVisible();
    await expect(
      page.getByText("Къде се пазят данните?"),
    ).toBeVisible();
    await expect(
      page.getByText("Как работи следенето на живо?"),
    ).toBeVisible();
    await expect(
      page.getByText(/демото и текущите възможности/),
    ).toHaveCount(0);
  });

  test("home page includes FAQ section with shared questions", async ({
    page,
  }) => {
    await page.goto("/");
    const faq = page.locator("#faq");
    await expect(faq).toBeVisible();
    await expect(
      faq.getByRole("heading", { name: "Често задавани въпроси" }),
    ).toBeVisible();
    await expect(faq.getByText("Къде се пазят данните?")).toBeVisible();
    await expect(faq.getByText("Как работи следенето на живо?")).toBeVisible();
  });

  test("public tournament shows live indicator and polls API", async ({
    page,
  }) => {
    let pollCount = 0;
    await page.route("**/api/tournaments/demo-volleyball", async (route) => {
      if (route.request().method() === "GET") {
        pollCount += 1;
      }
      await route.continue();
    });

    await page.goto("/tournaments/demo-volleyball");
    await expect(
      page.getByRole("heading", { name: "Пролетна купа София" }),
    ).toBeVisible();
    await expect(page.getByTestId("live-indicator")).toBeVisible();
    await expect(page.getByTestId("live-indicator")).toHaveText("На живо");

    await expect
      .poll(() => pollCount, { timeout: 12000 })
      .toBeGreaterThanOrEqual(1);
  });

  test("favorite toggle adds tournament to favorites page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Възстанови демо" }).click();
    const firstHeart = page
      .getByRole("button", { name: "Добави в любими" })
      .first();
    await firstHeart.click();
    await page.goto("/favorites");
    await expect(
      page.getByRole("heading", { name: "Любими турнири" }),
    ).toBeVisible();
    await expect(page.getByRole("article").first()).toBeVisible();
  });

  test("score entry announces via live region", async ({ page }) => {
    await loginAsAdmin(page);
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
