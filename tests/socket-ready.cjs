// Wait for Kuma's application handlers, not only the Engine.IO transport.
async function waitForApplication(socket, { timeoutMs = 60000, probeMs = 1000, intervalMs = 250 } = {}) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        if (!socket.connected) throw new Error("Socket disconnected while waiting for Kuma handlers");
        const remaining = deadline - Date.now();
        const result = await new Promise(resolve => {
            socket.timeout(Math.min(probeMs, remaining)).emit("needSetup", (error, value) => resolve({ error, value }));
        });
        if (!result.error) {
            if (typeof result.value !== "boolean") throw new Error("Unexpected needSetup response");
            return result.value;
        }
        await new Promise(resolve => setTimeout(resolve, Math.min(intervalMs, Math.max(0, deadline - Date.now()))));
    }
    throw new Error("Kuma application handlers did not become ready before timeout");
}
module.exports = { waitForApplication };
