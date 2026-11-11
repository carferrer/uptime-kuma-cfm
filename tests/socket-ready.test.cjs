const { test } = require("node:test");
const assert = require("node:assert/strict");
const { waitForApplication } = require("./socket-ready.cjs");
test("waits through transport-only readiness without sending mutations", async () => {
    let calls = 0;
    const socket = {connected: true, timeout() { return this; }, emit(event, callback) {
        assert.equal(event, "needSetup");
        calls++;
        setTimeout(() => calls < 3 ? callback(new Error("timeout")) : callback(null, true), 1);
    }};
    assert.equal(await waitForApplication(socket, {timeoutMs: 1000, probeMs: 10, intervalMs: 1}), true);
    assert.equal(calls, 3);
});
test("accepts initialized installations", async () => {
    const socket = {connected: true, timeout() {return this;}, emit(event, callback) {callback(null, false);}};
    assert.equal(await waitForApplication(socket), false);
});
test("fails when application never becomes ready", async () => {
    const socket = {connected: true, timeout() {return this;}, emit(event, callback) {setTimeout(() => callback(new Error("timeout")), 1);}};
    await assert.rejects(waitForApplication(socket, {timeoutMs: 20, probeMs: 5, intervalMs: 1}), /did not become ready/);
});
test("rejects unexpected replies and disconnected sockets", async () => {
    await assert.rejects(waitForApplication({connected:false}), /disconnected/);
    const socket = {connected:true, timeout(){return this;}, emit(event, callback){callback(null, {});}};
    await assert.rejects(waitForApplication(socket), /Unexpected/);
});
