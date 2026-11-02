// Test fixture only: enough Supervisor API for the base image's startup scripts.
// It does not simulate HA sessions or validate Ingress authentication.
const http = require("node:http");
const data = {
    name: "Ingress CI fixture", description: "Isolated test", version: "0.1.0",
    version_latest: "0.1.0", update_available: false, timezone: "UTC",
    operating_system: "CI", arch: "amd64", machine: "CI", homeassistant: "CI",
    supervisor: "CI", options: {}
};
http.createServer((request, response) => {
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({
        result: "ok",
        data: request.url === "/addons/self/options/config" ? {} : data
    }));
}).listen(80, "0.0.0.0", () => console.log("Supervisor startup fixture ready"));

require("./ingress-proxy.cjs");
