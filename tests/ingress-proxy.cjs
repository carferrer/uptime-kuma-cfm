// Test-only path-stripping proxy. Does not reproduce HA authentication.
const http = require("node:http");
const prefix = "/api/hassio_ingress/Test_Upper-lower123";
function options(req) {
    return {
        hostname: "172.30.32.3", port: 8099,
        path: req.url.slice(prefix.length) || "/", method: req.method,
        headers: { ...req.headers, "x-ingress-path": prefix }
    };
}
const server = http.createServer((req, res) => {
    if (req.url === "/harness") {
        res.setHeader("content-type", "text/html");
        res.end('<iframe src="' + prefix + '/" style="width:100%;height:800px"></iframe>');
        return;
    }
    if (!req.url.startsWith(prefix + "/")) { res.writeHead(404); res.end(); return; }
    const upstream = http.request(options(req), reply => {
        res.writeHead(reply.statusCode, reply.headers);
        reply.pipe(res);
    });
    upstream.on("error", () => { res.writeHead(502); res.end(); });
    req.pipe(upstream);
});
server.on("upgrade", (req, client, head) => {
    if (!req.url.startsWith(prefix + "/")) { client.destroy(); return; }
    const upstream = http.request(options(req));
    upstream.on("upgrade", (res, socket, upstreamHead) => {
        let response = "HTTP/1.1 101 Switching Protocols\r\n";
        for (let i = 0; i < res.rawHeaders.length; i += 2) {
            response += res.rawHeaders[i] + ": " + res.rawHeaders[i + 1] + "\r\n";
        }
        client.write(response + "\r\n");
        if (upstreamHead.length) client.write(upstreamHead);
        if (head.length) socket.write(head);
        client.pipe(socket).pipe(client);
        socket.on("error", () => client.destroy());
        client.on("error", () => socket.destroy());
    });
    upstream.on("response", () => client.destroy());
    upstream.on("error", () => client.destroy());
    upstream.end();
});
server.listen(8080, "0.0.0.0");
