const assert = require("node:assert/strict");
const WebSocket = require("/opt/uptime-kuma/node_modules/ws");
const target = process.env.TARGET || "172.30.32.3";
const base = "http://" + target + ":8099";
const headers = { "X-Ingress-Path": "/api/hassio_ingress/test_A-123", Host: "ha.example.test" };

(async () => {
    if (process.argv[2] === "denied") {
        const response = await fetch(base + "/dashboard", { headers });
        assert.equal(response.status, 403);
        console.log("Non-Supervisor client rejected");
        return;
    }
    let response;
    for (let n = 0; n < 90; n++) {
        try {
            response = await fetch(base + "/dashboard", { headers, redirect: "manual" });
            if (response.status === 200) break;
        } catch {}
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    assert.equal(response?.status, 200, "Kuma did not become ready");
    const html = await response.text();
    assert.ok(html.includes('<base href="/api/hassio_ingress/test_A-123/">'));
    assert.ok(!html.includes("__KUMA_INGRESS_PATH__"));
    assert.ok(response.headers.get("cache-control").includes("no-store"));
    const asset = html.match(/src="\.\/(assets\/[^"]+\.js)"/);
    assert.ok(asset, "Relative built entry asset missing");
    assert.equal((await fetch(base + "/" + asset[1], { headers })).status, 200);
    assert.equal((await fetch(base + "/dashboard", { headers: { Host: "ha.example.test" } })).status, 400);
    assert.equal((await fetch(base + "/dashboard", { headers: { ...headers, "X-Ingress-Path": '//evil.test/"' } })).status, 400);
    await assert.rejects(fetch("http://" + target + ":3001", { signal: AbortSignal.timeout(3000) }));
    await new Promise((resolve, reject) => {
        const ws = new WebSocket("ws://" + target + ":8099/socket.io/?EIO=4&transport=websocket", {
            headers: { ...headers, Origin: "http://ha.example.test" }
        });
        const timer = setTimeout(() => { ws.terminate(); reject(new Error("WebSocket handshake timed out")); }, 10000);
        ws.once("error", reject);
        ws.once("message", data => {
            clearTimeout(timer);
            try { assert.ok(data.toString().startsWith("0{")); ws.close(); resolve(); }
            catch (error) { ws.terminate(); reject(error); }
        });
    });
    console.log("Ingress HTML, assets, header validation, private backend and WebSocket verified");
})().catch(error => { console.error(error); process.exitCode = 1; });
