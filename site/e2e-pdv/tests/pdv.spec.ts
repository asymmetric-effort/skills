import { test, expect } from "@playwright/test";

const SITE_URL =
  process.env.SITE_URL || "https://skills.asymmetric-effort.com";

test.describe("Post-Deployment Verification — skills.asymmetric-effort.com", () => {
  test("site responds with 200", async ({ request }) => {
    const response = await request.get("/");
    expect(response.status()).toBe(200);
  });

  test("page title is correct", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Skills — Asymmetric Effort");
  });

  test("meta description exists and is non-empty", async ({ page }) => {
    await page.goto("/");
    const meta = page.locator('meta[name="description"]');
    await expect(meta).toHaveCount(1);
    const content = await meta.getAttribute("content");
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(0);
  });

  test("noscript fallback content exists", async ({ page }) => {
    await page.goto("/");
    const noscript = page.locator("noscript");
    const count = await noscript.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("SPA renders: #root has content", async ({ page }) => {
    await page.goto("/");
    const root = page.locator("#root");
    await expect(root).not.toBeEmpty();
  });

  test("SPA renders: hero section visible", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("section.hero, [class*='hero']").first();
    await expect(hero).toBeVisible();
  });

  test("SPA renders: nav visible", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  test("navigation links work: click class links and verify content changes", async ({
    page,
  }) => {
    await page.goto("/");
    const card = page.locator("[class*='card']").first();
    const cardText = await card.textContent();
    await card.click();
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).toContain("#/");
    const content = await page.textContent("body");
    expect(content).toBeTruthy();
  });

  test("footer shows version matching VERSION file content", async ({
    page,
    request,
  }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer).toContainText(/v?\d+\.\d+\.\d+/);
  });

  test("footer contains 'Asymmetric Effort' and GitHub link", async ({
    page,
  }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toContainText("Asymmetric Effort");
    const githubLink = footer.locator('a[href*="github.com"]');
    const count = await githubLink.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("SEO: robots.txt accessible", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("User-agent");
  });

  test("SEO: sitemap.xml accessible", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("urlset");
  });

  test("JSON-LD structured data present and valid", async ({ page }) => {
    await page.goto("/");
    const jsonLd = page.locator('script[type="application/ld+json"]');
    const count = await jsonLd.count();
    expect(count).toBeGreaterThanOrEqual(1);
    const content = await jsonLd.first().textContent();
    expect(content).toBeTruthy();
    const parsed = JSON.parse(content!);
    expect(parsed).toHaveProperty("@context");
    expect(parsed).toHaveProperty("@type");
  });

  test("favicon accessible", async ({ request }) => {
    const response = await request.get("/favicon.ico");
    expect(response.status()).toBe(200);
  });

  test("no JavaScript console errors during page load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });
    await page.goto("/");
    await page.waitForTimeout(3000);
    expect(errors).toHaveLength(0);
  });

  test("dark mode: data-theme attribute is set on html element", async ({
    page,
  }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme");
  });

  test("skill catalog: at least 8 class cards rendered", async ({ page }) => {
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

  test("skill detail: navigating to #/security/pentest shows skill content", async ({
    page,
  }) => {
    await page.goto("/#/security/pentest");
    await page.waitForTimeout(2000);
    const root = page.locator("#root");
    await expect(root).not.toBeEmpty();
    const content = await page.textContent("body");
    expect(content?.toLowerCase()).toContain("pentest");
  });
});
