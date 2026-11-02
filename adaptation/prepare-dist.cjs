const fs = require("node:fs");
const path = require("node:path");
const dist = path.resolve(process.argv[2]);
const index = path.join(dist, "index.html");
let html = fs.readFileSync(index, "utf8");
if (html.split("<head>").length !== 2 || html.includes("__KUMA_INGRESS_PATH__")) {
    throw new Error("Unexpected built index.html");
}
html = html.replace("<head>", '<head>\n<base href="__KUMA_INGRESS_PATH__/">\n<meta name="kuma-ingress-path" content="__KUMA_INGRESS_PATH__">');
// PWA belongs to Home Assistant. Do not advertise a second root-scoped app.
html = html.replace(/<link\b[^>]*rel="manifest"[^>]*>/g, "");
fs.writeFileSync(index, html);
for (const extension of [".gz", ".br"]) {
    fs.rmSync(index + extension, { force: true });
}
