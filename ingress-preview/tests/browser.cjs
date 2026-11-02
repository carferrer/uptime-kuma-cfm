const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const prefix = "/api/hassio_ingress/Test_Upper-lower123";
(async () => {
    const browser = await chromium.launch({ headless: true });
    try {
        const page = await browser.newPage();
        page.on("pageerror", error => console.log("BROWSER ERROR:", error.message));
        page.on("console", message => { if (message.type() === "error") console.log("CONSOLE:", message.text()); });
        for (const path of ["/", "/dashboard"]) {
            await page.goto("http://127.0.0.1:18099" + prefix + path);
            await page.waitForTimeout(3000);
            console.log("ROUTE DIAGNOSTIC:", JSON.stringify(await page.evaluate(() => {
                const router = document.querySelector("#app").__vue_app__.config.globalProperties.$router;
                return {
                    url: location.href,
                    base: document.querySelector("base")?.href,
                    meta: document.querySelector('meta[name="kuma-ingress-path"]')?.content,
                    routerBase: router.options.history.base,
                    currentRoute: router.currentRoute.value.fullPath,
                    matched: router.currentRoute.value.matched.map(r => r.path),
                    body: document.body.innerText.slice(0, 1500)
                };
            })));
            const body = await page.locator("body").innerText();
            assert.ok(!/Page Not Found|Página No Encontrada/.test(body), "Kuma rendered its not-found page");
            await page.reload();
            await page.waitForTimeout(1000);
            assert.ok(!/Page Not Found|Página No Encontrada/.test(await page.locator("body").innerText()));
        }
        await page.goto("http://127.0.0.1:18099/harness");
        const frame = page.frameLocator("iframe");
        await frame.locator("#app").waitFor();
        await page.waitForTimeout(2000);
        assert.ok(!/Page Not Found|Página No Encontrada/.test(await frame.locator("body").innerText()));
        console.log("Browser routing and iframe check passed");
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
