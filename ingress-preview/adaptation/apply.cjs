const fs = require("node:fs");
const path = require("node:path");
const spec = require("./edits.json");
const root = path.resolve(process.argv[2] || ".");
if (JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version !== spec.version) {
    throw new Error("Unsupported Kuma version; review the Ingress adaptation before upgrading.");
}
const pending = new Map();
const read = (file) => pending.get(file) ?? fs.readFileSync(path.join(root, file), "utf8");
for (const { file, before, after, count } of spec.edits) {
    const input = read(file);
    const matches = input.split(before).length - 1;
    if (matches !== count) {
        throw new Error(file + ": expected " + count + " matches, found " + matches);
    }
    pending.set(file, input.split(before).join(after));
}
for (const [file, statement] of Object.entries(spec.imports)) {
    const input = read(file);
    if (file.endsWith(".vue")) {
        const tags = input.match(/<script(?: lang="(?:ts|js)")?>/g) || [];
        if (tags.length !== 1) {
            throw new Error(file + ": expected one script tag");
        }
        pending.set(file, input.replace(tags[0], tags[0] + "\n" + statement));
    } else {
        pending.set(file, statement + "\n" + input);
    }
}
// All guards are checked before changing the source.
for (const [file, content] of pending) {
    fs.writeFileSync(path.join(root, file), content);
}
fs.copyFileSync(path.join(__dirname, "ingress.js"), path.join(root, "src/ingress.js"));
console.log("Adapted " + pending.size + " source files for Kuma " + spec.version);
