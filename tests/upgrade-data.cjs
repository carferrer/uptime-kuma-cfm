// Run seed only with the old container stopped; verify only reads existing rows.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const Dialect = require("/opt/uptime-kuma/node_modules/knex/lib/dialects/sqlite3");
Dialect.prototype._driver = () => require("/opt/uptime-kuma/node_modules/@louislam/sqlite3");
const knex = require("/opt/uptime-kuma/node_modules/knex")({
    client: Dialect, connection: { filename: "/data/kuma.db" }, useNullAsDefault: true
});
const snapshotPath = "/data/ci-upgrade-snapshot.json";
async function snapshot() {
    const user = await knex("user").where({ username: "upgrade-fixture" }).first();
    delete user.twofa_last_token; // A successful OTP login intentionally changes this.
    return {
        user,
        monitor: await knex("monitor").where({ id: 1 }).first(),
        heartbeat: await knex("heartbeat").where({ monitor_id: 1, msg: "upgrade-fixture-history" }).first(),
        notification: await knex("notification").where({ name: "upgrade-fixture-notification" }).first(),
        setting: await knex("setting").where({ key: "ci-upgrade-fixture" }).first(),
        dbConfig: JSON.parse(fs.readFileSync("/data/db-config.json", "utf8"))
    };
}
(async () => {
    try {
        if (process.argv[2] === "seed") {
            const user = await knex("user").where({ username: "upgrade-fixture" }).first();
            assert.ok(user);
            await knex("user").where({ id: user.id }).update({ twofa_status: 1, twofa_secret: "ci-upgrade-fixture-secret", twofa_last_token: null });
            await knex("heartbeat").insert({ monitor_id: 1, status: 1, important: 1, msg: "upgrade-fixture-history", time: new Date().toISOString().replace("T", " ").replace("Z", ""), ping: 17, duration: 60 });
            await knex("notification").insert({ name: "upgrade-fixture-notification", user_id: user.id, config: JSON.stringify({ type: "webhook", webhookURL: "http://supervisor/unused" }), active: 1, is_default: 0 });
            await knex("setting").insert({ key: "ci-upgrade-fixture", value: JSON.stringify({ preserved: true }), type: "general" });
            fs.writeFileSync(snapshotPath, JSON.stringify(await snapshot()));
            console.log("Saved baseline: user, OTP, monitor, history, notification, settings and database configuration");
        } else {
            assert.deepEqual(await snapshot(), JSON.parse(fs.readFileSync(snapshotPath, "utf8")));
            console.log("All existing fixture data preserved exactly");
        }
    } finally { await knex.destroy(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
