"use strict";

const assert = require("node:assert/strict");
const dgram = require("node:dgram");
const { once } = require("node:events");
const test = require("node:test");
const { probeSipOptions } = require("../adaptation/sip-options-probe.cjs");

test("one OPTIONS gets one 401 without trying an empty password", async () => {
    const server = dgram.createSocket("udp4");
    server.bind(0, "127.0.0.1");
    await once(server, "listening");
    let requests = 0;
    server.on("message", (packet, peer) => {
        requests++;
        const request = packet.toString("utf8");
        assert.match(request, /^OPTIONS sip:127\.0\.0\.1:\d+ SIP\/2\.0/m);
        assert.match(request, /^From: <sip:7001@127\.0\.0\.1>;/m);
        assert.match(request, /;rport\r\n/);
        assert.doesNotMatch(request, /^Authorization:/m);
        const get = name => request.match(new RegExp(`^${name}: [^\\r\\n]+`, "m"))?.[0];
        const response = [
            "SIP/2.0 401 Unauthorized", get("Via"), get("From"), get("To") + ";tag=pbx",
            get("Call-ID"), get("CSeq"),
            'WWW-Authenticate: Digest realm="pbx", nonce="abc"',
            "Content-Length: 0", "", "",
        ].join("\r\n");
        server.send(response, peer.port, peer.address);
    });
    try {
        const status = await probeSipOptions("127.0.0.1", server.address().port, 1000, "7001");
        assert.equal(status, "SIP/2.0 401 Unauthorized");
        await new Promise(resolve => setTimeout(resolve, 50));
        assert.equal(requests, 1);
    } finally {
        server.close();
    }
});

test("rejects invalid user without sending a packet", async () => {
    await assert.rejects(probeSipOptions("127.0.0.1", 5060, 1000, ""), /SIP From user is required/);
    await assert.rejects(probeSipOptions("127.0.0.1", 5060, 1000, "x\r\nAuthorization: bad"), /Invalid SIP From user/);
});

