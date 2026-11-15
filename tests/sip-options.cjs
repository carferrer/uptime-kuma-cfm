const assert = require("node:assert/strict");
const dgram = require("node:dgram");
const { once } = require("node:events");
const { SIPMonitorType } = require("/opt/uptime-kuma/server/monitor-types/sip-options");

(async () => {
    const server = dgram.createSocket("udp4");
    let received = false;
    server.on("message", (packet, peer) => {
        const request = packet.toString("utf8");
        if (!request.startsWith("OPTIONS ")) return;
        received = true;
        const header = name => request.split("\r\n").find(line => line.toLowerCase().startsWith(name.toLowerCase() + ":"));
        const to = header("To");
        const reply = [
            "SIP/2.0 200 OK",
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
        const heartbeat = {};
        await new SIPMonitorType().check({
            hostname: "127.0.0.1", port: server.address().port,
        }, heartbeat, {});
        assert.equal(received, true, "SIP OPTIONS was not sent over UDP");
        assert.equal(heartbeat.status, 1, "SIP 200 OK did not mark the monitor UP");
        console.log("SIP OPTIONS over UDP: UP");
    } finally {
        server.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
