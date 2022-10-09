const { readdirSync, existsSync, readFileSync } = require("fs");
const { resolve, join } = require("path");
const { validateMod, unwrapExtras } = require("./mod_utils");

const sourceDir = resolve("./src");
const modsMetadata = {};

function resolveEntries() {
    /** @type {{ [name: string]: string }} */
    const entries = {};
    const buildOnly = process.env.BUILD_ONLY?.split(",");

    for (const modDir of readdirSync(sourceDir)) {
        const location = join(sourceDir, modDir, "mod.json");
        if (!existsSync(location)) {
            continue;
        }

        const text = readFileSync(location, "utf-8");
        const mod = JSON.parse(text);

        try {
            validateMod(mod);
        } catch (error) {
            console.warn("%s: %s", modDir, error.message);
        }

        unwrapExtras(mod);
        entries[modDir] = resolve("./src", modDir, mod.entry);
        modsMetadata[modDir] = mod;
    }

    if (!buildOnly?.length) {
        return entries;
    }

    for (const mod of buildOnly) {
        // BUILD_ONLY allows resolving only explicitly specified mods
        if (!(mod in entries)) {
            console.warn('Asked to build "%s" but it wasn\'t found!', mod);
            console.log("These mods were found:", entries);
        }
    }

    for (const mod in entries) {
        if (!buildOnly.includes(mod)) {
            delete entries[mod];
        }
    }

    return entries;
}

module.exports = { modsMetadata, resolveEntries };
