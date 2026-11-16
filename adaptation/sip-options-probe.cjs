"use strict";

const dgram = require("node:dgram");
const dns = require("node:dns/promises");
const net = require("node:net");
const { randomBytes } = require("node:crypto");
const { domainToASCII } = require("node:url");

function sipHost(value) {
    const input = String(value || "").trim().replace(/^\[|\]$/g, "");
    if (net.isIP(input)) return input;
    const host = domainToASCII(input);
    if (!host || host.length > 253 || !/^[a-z0-9.-]+$/i.test(host)) {
        throw new Error("Invalid SIP hostname");
    }
    return host;
}

function sipUser(value) {
    const user = String(value || "").trim();
    if (!user) throw new Error("SIP From user is required");
    if (!/^[a-z0-9_.!~*'()%+-]+$/i.test(user)) {
        throw new Error("Invalid SIP From user");
    }
    return user;
}

/** Send one OPTIONS request and return the first final response from this transaction. */
async function probeSipOptions(hostname, port, timeout, fromUser) {
    const host = sipHost(hostname);
    const user = sipUser(fromUser);
    const remotePort = Number(port);
    if (!Number.isInteger(remotePort) || remotePort < 1 || remotePort > 65535) {
        throw new Error("Invalid SIP port");
    }
    const peer = await dns.lookup(host);
    const socket = dgram.createSocket(peer.family === 6 ? "udp6" : "udp4");
    const id = randomBytes(12).toString("hex");
    const callId = `${id}@kuma`;
    const targetHost = peer.family === 6 ? `[${host}]` : host;

    return new Promise((resolve, reject) => {
        let done = false;
        const finish = (error, result) => {
            if (done) return;
            done = true;
            clearTimeout(timer);
            socket.close();
            if (error) reject(error);
            else resolve(result);
        };
        const timer = setTimeout(() => finish(new Error("SIP OPTIONS timed out")), timeout);
        socket.on("error", error => finish(error));
        socket.on("message", packet => {
            const reply = packet.toString("utf8");
            const status = reply.split(/\r?\n/, 1)[0];
            const responseId = reply.match(/^Call-ID:\s*([^\r\n]+)\s*$/im)?.[1]?.trim();
            const cseq = reply.match(/^CSeq:\s*1\s+OPTIONS\s*$/im);
            if (responseId !== callId || !cseq) return;
            if (/^SIP\/2\.0\s+[2-6]\d\d\b/.test(status)) finish(null, status);
        });
        socket.connect(remotePort, peer.address, error => {
            if (error) return finish(error);
            if (done) return;
            const local = socket.address();
            const viaHost = peer.family === 6 ? `[${local.address}]` : local.address;
            const request = [
                `OPTIONS sip:${targetHost}:${remotePort} SIP/2.0`,
                `Via: SIP/2.0/UDP ${viaHost}:${local.port};branch=z9hG4bK${id};rport`,
                "Max-Forwards: 70",
                `To: <sip:${targetHost}>`,
                `From: <sip:${user}@${targetHost}>;tag=${id}`,
                `Call-ID: ${callId}`,
                "CSeq: 1 OPTIONS",
                "Content-Length: 0",
                "",
                "",
            ].join("\r\n");
            socket.send(Buffer.from(request), error => {
                if (error) finish(error);
            });
        });
    });
}

module.exports = { probeSipOptions };

