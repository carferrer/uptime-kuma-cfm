const assert = require("node:assert/strict");
const dgram = require("node:dgram");
const { once } = require("node:events");
const { SIPMonitorType } = require("/opt/uptime-kuma/server/monitor-types/sip-options");

(async () => {
    const server = dgram.createSocket("udp4");
    let received = false;
    let requests = 0;
    let status = "200 OK";
    server.on("message", (packet, peer) => {
        const request = packet.toString("utf8");
        if (!request.startsWith("OPTIONS ")) return;
        received = true;
        requests++;
        assert.match(request, /^From: <sip:7001@127\.0\.0\.1>;/m);
        assert.doesNotMatch(request, /^Authorization:/m);
        const header = name => request.split("\r\n").find(line => line.toLowerCase().startsWith(name.toLowerCase() + ":"));
        const to = header("To");
        const reply = [
            "SIP/2.0 " + status,
            header("Via"),
            header("From"),
            to && to.includes(";tag=") ? to : to + ";tag=kuma-test",
            header("Call-ID"),
            header("CSeq"),
            "Content-Length: 0",
            "",
            "",
        ].join("\r\n");
        server.send(reply, peer.port, peer.address);
    });
    try {
        server.bind(0, "127.0.0.1");
        await once(server, "listening");
        for (status of ["200 OK", "401 Unauthorized", "403 Forbidden"]) {
            received = false;
            requests = 0;
            const heartbeat = {};
            await new SIPMonitorType().check({
                hostname: "127.0.0.1", port: server.address().port, basic_auth_user: "7001",
            }, heartbeat, {});
            assert.equal(received, true, "SIP OPTIONS was not sent over UDP");
            assert.equal(requests, 1, "probe must send one request without authentication retry");
            assert.equal(heartbeat.status, 1, "SIP " + status + " did not mark the monitor UP");
            assert.equal(heartbeat.msg, "SIP/2.0 " + status);
        }
        console.log("SIP OPTIONS over UDP: 200, 401 and 403 replies marked UP without retry");
    } finally {
        server.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
