import { createLogger } from "core/logging";
import { MODS } from "mods/modloader";
import metadata from "./mod.json";

/** @type {Map<import("mods/mod").Mod, Fix[]>} */
export const fixesByMod = new Map();
/** @type {Set<string>} */
export const enabledFixes = new Set();
const logger = createLogger("FixManager@fix_store");

export function findFixes() {
    fixesByMod.clear();

    for (const mod of MODS.mods) {
        // Check if there's a function on mod instance
        if (!("provideFixes" in mod)) {
            continue;
        }

        try {
            // To ensure no array modifications
            const result = [...mod.provideFixes()];
            for (const fix of result) {
                fix._mod = mod;
            }

            fixesByMod.set(mod, result);
        } catch (err) {
            const msg = `Mod "${mod.metadata.name}" failed to provide fixes!`;
            logger.error(msg, err);
        }
    }
}

export function getFixCount() {
    let count = 0;
    for (const modFixes of fixesByMod.values()) {
        count += modFixes.length;
    }

    return count;
}

/**
 * Returns fix from the store by the ID, or null if it
 * wasn't found.
 * @param {string} id
 */
export function getFixById(id) {
    for (const modFixes of fixesByMod.values()) {
        const fix = modFixes.find((fix) => fix.id == id);
        if (fix !== undefined) {
            return fix;
        }
    }

    // Nothing found
    return null;
}

/**
 * Returns display name of the specified fix.
 * @param {Fix} fix
 */
export function getDisplayName(fix) {
    let name = fix.id;

    if ("name" in fix) {
        // There's a human-readable name, use it
        name = fix.name;
    }

    if ("author" in fix) {
        name += ` (by ${fix.author})`;
    }

    return name;
}

export function fixesAffectSavegame() {
    for (const modFixes of fixesByMod.values()) {
        const enabledModFixes = modFixes.filter((fix) =>
            enabledFixes.has(fix.id)
        );
        if (enabledModFixes.some((fix) => fix.affectsSavegame)) {
            // Found at least one fix that affects savegame
            return true;
        }
    }

    return false;
}

/**
 * Enables or disables the specified fix and logs any errors.
 * If the fix throws an error, it gets re-thrown.
 * @param {Fix} fix
 * @param {boolean?} state Whether to enable this fix.
 */
export function toggleFix(fix, state) {
    if (state === undefined) {
        // Just toggle
        state = !enabledFixes.has(fix.id);
    }

    try {
        logger.debug(`${state ? "Enabling" : "Disabling"} fix "${fix.id}"`);
        if (state) {
            fix.enable.call(fix._mod);
            enabledFixes.add(fix.id);
        } else {
            fix.disable.call(fix._mod);
            enabledFixes.delete(fix.id);
        }

        // Re-check if we have any savegame-affecting fixes
        const fixManager = MODS.mods.find(
            (mod) => mod.metadata.id == metadata.id
        );

        fixManager.metadata.doesNotAffectSavegame = !fixesAffectSavegame();
    } catch (err) {
        const action = state ? "enable" : "disable";
        const msg = `Failed to ${action} fix "${fix.id}"!`;
        logger.error(msg, err);

        // Re-throw: this is handled later anyway
        throw err;
    }
}
