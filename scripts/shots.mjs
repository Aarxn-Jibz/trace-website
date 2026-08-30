/**
 * Visual QA harness — drives Chrome and captures the showcase flows.
 * Dev-only; lives outside the app bundle.
 *
 *   node scripts/shots.mjs
 */
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);

const BASE = process.env.BASE ?? "http://localhost:3000";
const OUT = process.env.OUT ?? "D:/dev/code/trace/.shots";
const EXE = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";

/**
 * Kept out of package.json on purpose — this is a scratch QA harness.
 *   PLAYWRIGHT_PATH=/path/to/playwright-core node scripts/shots.mjs
 */
const pwEntry = process.env.PLAYWRIGHT_PATH ?? "playwright-core";
const pwModule = await import(
  pwEntry.startsWith("/") || /^[A-Za-z]:[\\/]/.test(pwEntry)
    ? pathToFileURL(require.resolve(pwEntry)).href
    : pwEntry
);
// CJS interop: playwright-core may surface exports under `default`
const { chromium } = pwModule.chromium ? pwModule : pwModule.default;

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: EXE, headless: true });

async function shot(name, { width = 1600, height = 1000, path = "/", steps } = {}) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(1400);
  if (steps) await steps(page);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  if (errors.length) console.log(`  ! ${name}: ${errors.slice(0, 4).join(" | ")}`);
  else console.log(`  ok ${name}`);
  await page.close();
}

console.log("\nCapturing TRACE…\n");

await shot("01-home-hero");

await shot("02-home-full", {
  steps: async (p) => {
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await p.waitForTimeout(1200);
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(600);
  },
});

await shot("03-home-dossiers", {
  steps: async (p) => {
    await p.locator("#dossiers").scrollIntoViewIfNeeded();
    await p.waitForTimeout(1200);
  },
});

await shot("04-home-protocol", {
  steps: async (p) => {
    await p.locator("#protocol").scrollIntoViewIfNeeded();
    await p.waitForTimeout(1000);
  },
});

await shot("05-case-header", { path: "/case/1" });

await shot("06-case-briefing", {
  path: "/case/1",
  steps: async (p) => {
    await p.evaluate(() => window.scrollBy(0, 900));
    await p.waitForTimeout(1000);
  },
});

await shot("07-case-locker", {
  path: "/case/1",
  steps: async (p) => {
    await p.locator("#evidence").scrollIntoViewIfNeeded();
    await p.waitForTimeout(1200);
  },
});

// Flow 2 -> 3: open auth.log, then search
await shot("08-console-authlog-search", {
  path: "/case/1",
  steps: async (p) => {
    await p.locator("#evidence").scrollIntoViewIfNeeded();
    await p.waitForTimeout(600);
    await p.getByRole("button", { name: "View auth.log" }).first().click();
    await p.waitForTimeout(1300);
    await p.keyboard.press("Control+f");
    await p.waitForTimeout(300);
    await p.keyboard.type("192.168.1.42", { delay: 28 });
    await p.waitForTimeout(1400);
  },
});

// Flow 4: CSV
await shot("09-console-csv", {
  path: "/case/1",
  steps: async (p) => {
    await p.locator("#evidence").scrollIntoViewIfNeeded();
    await p.waitForTimeout(600);
    await p.getByRole("button", { name: "View users.csv" }).first().click();
    await p.waitForTimeout(1200);
  },
});

// Flow 5: unsupported
await shot("10-console-unsupported", {
  path: "/case/1",
  steps: async (p) => {
    await p.locator("#evidence").scrollIntoViewIfNeeded();
    await p.waitForTimeout(600);
    await p.getByRole("button", { name: "View network_capture.pcap" }).first().click();
    await p.waitForTimeout(1200);
  },
});

await shot("11-console-markdown", {
  path: "/case/1",
  steps: async (p) => {
    await p.locator("#evidence").scrollIntoViewIfNeeded();
    await p.waitForTimeout(600);
    await p.getByRole("button", { name: "View incident_notes.md" }).first().click();
    await p.waitForTimeout(1200);
  },
});

await shot("12-console-json", {
  path: "/case/1",
  steps: async (p) => {
    await p.locator("#evidence").scrollIntoViewIfNeeded();
    await p.waitForTimeout(600);
    await p.getByRole("button", { name: "View metadata.json" }).first().click();
    await p.waitForTimeout(1200);
  },
});

await shot("13-locked-case", { path: "/case/2" });

// mobile
await shot("14-mobile-home", { width: 390, height: 844 });
await shot("15-mobile-case", { width: 390, height: 844, path: "/case/1" });

await browser.close();
console.log(`\nSaved to ${OUT}\n`);
