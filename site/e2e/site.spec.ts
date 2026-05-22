import { test, expect } from "@playwright/test";

test.describe("Skills Documentation Site", () => {
  test("home page loads with correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Skills — Asymmetric Effort");
  });

  test("navigation bar is visible with brand text", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
    await expect(nav).toContainText("Skills");
  });

  test("hero section has h1 heading", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("section.hero, [class*='hero']").first();
    await expect(hero).toBeVisible();
    const h1 = hero.locator("h1");
    await expect(h1).toBeVisible();
  });

  test("class cards are rendered (at least 8)", async ({ page }) => {
    await page.goto("/");
    const cards = page.locator("[class*='card']");
    await expect(cards).not.toHaveCount(0);
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(8);

    const expectedClasses = [
      "automation",
      "data",
      "development",
      "devops",
      "documentation",
      "jokes",
      "security",
      "testing",
    ];

    const pageContent = await page.textContent("body");
    for (const cls of expectedClasses) {
      expect(pageContent?.toLowerCase()).toContain(cls);
    }
  });

  test("footer is visible and contains version number", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer).toContainText(/v?\d+\.\d+\.\d+/);
  });

  test("footer contains 'Asymmetric Effort'", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer).toContainText("Asymmetric Effort");
  });

  test("hash navigation works: clicking a class card navigates to #/classname", async ({
    page,
  }) => {
    await page.goto("/");
    const card = page.locator("[class*='card']").first();
    await card.click();
    await page.waitForTimeout(500);
    const url = page.url();
    expect(url).toContain("#/");
  });

  test("skill detail page renders when navigating to a skill hash route", async ({
    page,
  }) => {
    await page.goto("/#/security");
    await page.waitForTimeout(1000);
    const content = page.locator("#root, [id='root'], main");
    await expect(content.first()).not.toBeEmpty();
  });

  test("dark mode: html element has data-theme attribute", async ({
    page,
  }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme");
  });

  test("no JavaScript console errors on page load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });
    await page.goto("/");
    await page.waitForTimeout(2000);
    expect(errors).toHaveLength(0);
  });

  test("meta description tag exists", async ({ page }) => {
    await page.goto("/");
    const meta = page.locator('meta[name="description"]');
    await expect(meta).toHaveCount(1);
    const content = await meta.getAttribute("content");
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(0);
  });

  test("favicon link exists", async ({ page }) => {
    await page.goto("/");
    const favicon = page.locator(
      'link[rel="icon"], link[rel="shortcut icon"]'
    );
    const count = await favicon.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
