// Synthetic CI credentials only; never use against a real installation.
const assert = require("node:assert/strict");
const { io } = require("/opt/uptime-kuma/node_modules/socket.io-client");
const notp = require("/opt/uptime-kuma/node_modules/notp");
const seed = process.argv[2] === "seed";
const base = "http://172.30.32.3:" + (seed ? "3001" : "8099");
const headers = seed ? {} : { "X-Ingress-Path": "/api/hassio_ingress/Upgrade_123", Host: "ha.example.test", Origin: "http://ha.example.test" };
const password = "CI-fixture-Passphrase-792!";
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    let ready = false;
    for (let n = 0; n < 60; n++) {
        try {
            const response = await fetch(base + "/setup-database-info", { headers, signal: AbortSignal.timeout(1000) });
            if (response.ok) {
                const setup = await response.json();
                if (setup.needSetup) {
                    assert.ok(seed, "Existing database unexpectedly needs setup");
                    const configured = await fetch(base + "/setup-database", {
                        method: "POST", headers: { ...headers, "Content-Type": "application/json" },
                        body: JSON.stringify({ dbConfig: { type: "sqlite" } })
                    });
                    assert.equal(configured.status, 200);
                }
            }
            const probe = await fetch(base + "/socket.io/?EIO=4&transport=polling", { headers, signal: AbortSignal.timeout(1000) });
            if ((await probe.text()).startsWith("0{")) { ready = true; break; }
        } catch {}
        await sleep(1000);
    }
    assert.ok(ready, "Server did not become ready");
    const socket = io(base, { transports: ["websocket"], extraHeaders: headers, reconnection: false, timeout: 10000 });
    const emit = (...args) => new Promise((resolve, reject) => socket.timeout(10000).emit(...args, (error, result) => error ? reject(error) : resolve(result)));
    try {
        await new Promise((resolve, reject) => { socket.once("connect", resolve); socket.once("connect_error", reject); });
        if (seed) {
            const setup = await emit("setup", "upgrade-fixture", password);
            assert.equal(setup.ok, true, JSON.stringify(setup));
        }
        const login = await emit("login", { username: "upgrade-fixture", password });
        if (seed) {
            assert.equal(login.ok, true, JSON.stringify(login));
            const result = await emit("add", {
                name: "Preserved upgrade monitor", type: "http", url: "http://supervisor/health",
                active: false, interval: 60, retryInterval: 60, maxretries: 0,
                accepted_statuscodes: ["200-299"], notificationIDList: {},
                maxredirects: 10, method: "GET"
            });
            assert.equal(result.ok, true, JSON.stringify(result));
            assert.equal(result.monitorID, 1);
            console.log("Original 2026.11.01 created a real user and monitor");
        } else {
            assert.equal(login.tokenRequired, true, "OTP must still be required after upgrade");
            const result = await emit("login", {
                username: "upgrade-fixture", password,
                token: notp.totp.gen("ci-upgrade-fixture-secret")
            });
            assert.equal(result.ok, true, JSON.stringify(result));
            const monitor = await emit("getMonitor", 1);
            assert.equal(monitor.ok, true, JSON.stringify(monitor));
            assert.equal(monitor.monitor.name, "Preserved upgrade monitor");
            console.log("Existing password, OTP and monitor work through Ingress after upgrade");
        }
    } finally { socket.disconnect(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
