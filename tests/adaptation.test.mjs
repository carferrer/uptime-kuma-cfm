import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, existsSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(path.join(root, "adaptation/ingress.js"), "utf8");
const helper = await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));
function page(prefix, pathname) {
    globalThis.document = { querySelector: () => prefix === null ? null : { content: prefix } };
    globalThis.location = { pathname };
}
test("deep links and socket paths remain inside the Ingress prefix", () => {
    page("/api/hassio_ingress/test_A-123", "/api/hassio_ingress/test_A-123/dashboard/7");
    assert.equal(helper.appPathname(), "/dashboard/7");
    assert.equal(helper.ingressBase() + "socket.io", "/api/hassio_ingress/test_A-123/socket.io");
    assert.equal(helper.ingressURL("/status/private?edit"), "/api/hassio_ingress/test_A-123/status/private?edit");
});
test("untrusted base paths and external navigation are rejected", () => {
    for (const value of ["https://evil.test", '//evil.test', '/api/hassio_ingress/x"><script>', "/api/hassio_ingress/../x", "/api/hassio_ingress/x/extra"]) {
        page(value, value);
        assert.throws(() => helper.ingressBase(), /Invalid/);
    }
    page("/api/hassio_ingress/abc", "/api/hassio_ingress/abcdef/dashboard");
    assert.throws(() => helper.appPathname(), /outside/);
    assert.throws(() => helper.ingressURL("//evil.test"), /relative/);
});
test("direct upstream mode keeps its root path", () => {
    page(null, "/dashboard");
    assert.equal(helper.ingressBase(), "/");
    assert.equal(helper.appPathname(), "/dashboard");
});
test("built HTML gets its base before assets; stale compressed HTML is removed", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "kuma-dist-"));
    writeFileSync(path.join(dir, "index.html"), '<html><head><link rel="manifest" href="./manifest.json"><script type="module" src="./assets/app.js"></script></head></html>');
    for (const ext of [".gz", ".br"]) writeFileSync(path.join(dir, "index.html" + ext), "stale");
    const run = spawnSync(process.execPath, [path.join(root, "adaptation/prepare-dist.cjs"), dir], { encoding: "utf8" });
    assert.equal(run.status, 0, run.stderr);
    const html = readFileSync(path.join(dir, "index.html"), "utf8");
    assert.ok(html.indexOf("<base ") < html.indexOf("<script "));
    assert.ok(!html.includes('rel="manifest"'));
    assert.ok(!existsSync(path.join(dir, "index.html.gz")));
    assert.ok(!existsSync(path.join(dir, "index.html.br")));
    const rerun = spawnSync(process.execPath, [path.join(root, "adaptation/prepare-dist.cjs"), dir]);
    assert.notEqual(rerun.status, 0);
});
test("upstream version drift is rejected before any adaptation", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "kuma-version-"));
    writeFileSync(path.join(dir, "package.json"), '{"version":"999.0.0"}');
    const run = spawnSync(process.execPath, [path.join(root, "adaptation/apply.cjs"), dir], { encoding: "utf8" });
    assert.notEqual(run.status, 0);
    assert.match(run.stderr, /Unsupported Kuma version/);
});
test("adaptation applies to upstream and fails closed if run twice", { skip: !process.env.UPSTREAM_DIR }, () => {
    const dir = mkdtempSync(path.join(tmpdir(), "kuma-source-"));
    cpSync(process.env.UPSTREAM_DIR, dir, { recursive: true });
    const run = spawnSync(process.execPath, [path.join(root, "adaptation/apply.cjs"), dir], { encoding: "utf8" });
    assert.equal(run.status, 0, run.stderr);
    const socket = readFileSync(path.join(dir, "src/mixins/socket.js"), "utf8");
    assert.ok(socket.includes('path: ingressBase() + "socket.io"'));
    assert.ok(socket.includes("appPathname().match(page)"));
    const main = readFileSync(path.join(dir, "src/main.js"), "utf8");
    assert.ok(main.includes('!ingressPrefix() && "serviceWorker"'));
    const router = readFileSync(path.join(dir, "src/router.js"), "utf8");
    assert.ok(router.includes("createWebHistory(ingressBase())"));
    const second = spawnSync(process.execPath, [path.join(root, "adaptation/apply.cjs"), dir]);
    assert.notEqual(second.status, 0);
});
