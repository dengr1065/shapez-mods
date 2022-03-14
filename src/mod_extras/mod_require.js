import { createLogger } from "core/logging";
import { MODS } from "mods/modloader";
import semver from "semver";

const logger = createLogger("ModExtras:Require");

/**
 * Require a specific version of a mod.
 * @param {string} id ID of required mod
 * @param {string} version Acceptable versions range
 * @param {*} optional If true, returns undefined for missing mods
 */
export function modRequire(id, version = "*", optional = false) {
    if (semver.validRange(version) === null) {
        throw new Error(`Invalid version range requested for "${id}".`);
    }

    const mod = MODS.mods.find((mod) => mod.metadata.id == id);
    if (mod === undefined) {
        if (optional) {
            return mod;
        }

        throw new Error(`Mod "${id}" is not installed, but is required.`);
    }

    const modName = mod.metadata.name || id;
    const modVersion = mod.metadata.version;

    const cleanVer = semver.clean(modVersion);
    if (cleanVer === null) {
        const warning = `Mod "${modName}" has invalid version "${modVersion}".`;
        logger.warn(warning);

        if (optional) {
            return undefined;
        }

        throw new Error(warning);
    }

    if (semver.satisfies(cleanVer, version, { includePrerelease: true })) {
        return mod;
    }

    if (optional) {
        return undefined;
    }

    throw new Error(
        `Version of "${modName}" does not satisfy ${version} requirement.`
    );
}
