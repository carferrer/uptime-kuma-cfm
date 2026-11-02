const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const config = fs.readFileSync(path.join(__dirname, "../config.yaml"), "utf8");
const entry = config.match(/^ingress_entry:\s*(.+)$/m)?.[1] || "";
const prefix = "/api/hassio_ingress/Test_Upper-lower123";
(async () => {
    const browser = await chromium.launch({ headless: true });
    try {
        const page = await browser.newPage();
        page.on("pageerror", error => console.log("BROWSER ERROR:", error.message));
        page.on("console", message => { if (message.type() === "error") console.log("CONSOLE:", message.text()); });
        // Supervisor constructs ingress_url by appending the configured entry
        // to a prefix that ALREADY ends in "/". Preserve this exact behavior.
        const configuredPath = "/" + entry;
        const rootResponse = await fetch("http://127.0.0.1:18099" + prefix + "/", { redirect: "manual" });
        console.log("ROOT REDIRECT:", rootResponse.status, rootResponse.headers.get("location"));
        assert.equal(rootResponse.status, 302);
        assert.equal(rootResponse.headers.get("location"), prefix + "/dashboard");
        // Keep the empty-instance setup event from masking the invalid route.
        await page.route("**/socket.io/**", route => route.abort());
        await page.goto("http://127.0.0.1:18099" + prefix + "//dashboard");
        await page.waitForTimeout(2000);
        const legacyRoute = await page.evaluate(() =>
            document.querySelector("#app").__vue_app__.config.globalProperties.$router.currentRoute.value.fullPath);
        console.log("Legacy leading-slash entry reproducer:", legacyRoute);
        assert.equal(legacyRoute, "//dashboard");
        assert.ok(/Page Not Found|Página No Encontrada/.test(await page.locator("body").innerText()));
        await page.unroute("**/socket.io/**");
        for (const path of [...new Set([configuredPath, "/", "/dashboard"])]) {
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
