// C24: read-only browser audit for the affiliates UI. Never calls state-changing APIs.
const { chromium } = require("C:/Users/JL/AppData/Roaming/npm/node_modules/autonomousmcp/node_modules/playwright");
const base = process.env.QA_DOMAIN || "http://127.0.0.1:5392";
const paths = ["/seja-afiliada", "/consultar-candidatura", "/acesso-equipe-afiliadas", "/admin/afiliadas"];
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
  let passed = 0;
  let failed = 0;
  try {
    for (const width of [390, 1365]) {
      for (const path of paths) {
        const page = await browser.newPage({ viewport: { width, height: 920 } });
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message.slice(0, 140)));
        await page.route("**/*", (route) => {
          const url = route.request().url();
          if (url.startsWith(base) || url.startsWith("data:")) return route.continue();
          return route.abort();
        });
        try {
          const response = await page.goto(base + path, { waitUntil: "domcontentloaded", timeout: 45000 });
          await page.waitForTimeout(850);
          const info = await page.evaluate(() => {
            const footer = document.querySelector("footer");
            const main = document.querySelectorAll("main");
            const href = (text) => Array.from(footer?.querySelectorAll("a") || []).find((a) => a.textContent?.trim() === text)?.getAttribute("href");
            return {
              mains: main.length,
              codeHref: href("Acompanhar inscrição por código") || null,
              legacyHref: href("Inscrições antigas por e-mail") || null,
              adminSkip: document.querySelector('a[href="#conteudo-admin-afiliadas"]')?.textContent?.trim() || null,
              adminMain: document.querySelector("main")?.id || "",
              overflow: document.documentElement.scrollWidth > window.innerWidth + 5,
            };
          });
          const navigationValid = path === "/admin/afiliadas"
            ? info.adminSkip === "Pular para o painel de afiliadas" && info.adminMain === "conteudo-admin-afiliadas"
            : info.codeHref === "/consultar-candidatura" && info.legacyHref === "/acompanhar-inscricao";
          const ok = response?.status() === 200 && info.mains === 1 && navigationValid && !info.overflow && errors.length === 0;
          console.log(JSON.stringify({ width, path, http: response?.status(), ...info, errors, ok }));
          if (ok) passed++; else failed++;
        } catch (error) {
          console.log(JSON.stringify({ width, path, ok: false, error: String(error.message).slice(0, 200) }));
          failed++;
        } finally {
          await page.close();
        }
      }
    }
    console.log(JSON.stringify({ total: passed + failed, passed, failed, readOnly: true }));
    if (failed) process.exitCode = 1;
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error("C24_BROWSER_ERROR: " + error.message); process.exitCode = 1; });
