const assert = require("node:assert/strict");
const WebSocket = require("/opt/uptime-kuma/node_modules/ws");
const base = "http://172.30.32.3:3001";
(async () => {
    const res = await fetch(base + "/dashboard");
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes('<base href="/">'));
    assert.ok(html.includes('name="kuma-ingress-path" content=""'));
    assert.ok(!html.includes("__KUMA_INGRESS_PATH__"));
    const asset = html.match(/src="\.\/(assets\/[^"]+\.js)"/);
    assert.ok(asset);
    assert.equal((await fetch(base + "/" + asset[1])).status, 200);
    // Caller-supplied Ingress headers must not change the direct URL base.
    const injected = await fetch(base, {headers: {"X-Ingress-Path": "/api/hassio_ingress/untrusted"}});
    assert.ok(!(await injected.text()).includes("/api/hassio_ingress/untrusted"));
    await new Promise((resolve, reject) => {
        const ws = new WebSocket(base.replace("http:", "ws:") + "/socket.io/?EIO=4&transport=websocket");
        const timer = setTimeout(() => { ws.terminate(); reject(new Error("Direct socket timed out")); }, 10000);
        ws.once("error", e => {clearTimeout(timer); reject(e);});
        ws.once("message", data => {
            clearTimeout(timer);
            try {assert.ok(data.toString().startsWith("0{")); ws.close(); resolve();}
            catch(e) {ws.terminate(); reject(e);}
        });
    });
    console.log("Direct HTML, assets and Socket.IO verified; backend 3002 remains private");
})().catch(e => {console.error(e);process.exitCode=1;});
