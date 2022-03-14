import { MODS } from "mods/modloader";
import semver from "semver";
import { T } from "./constants";
import { modRequire } from "./mod_require";

/**
 * Gets parsed requirements of a mod.
 * @param {import("mods/mod").Mod} mod
 */
export function getDependencies(mod) {
    if (!mod.metadata.extra || !mod.metadata.extra.requires) {
        return [];
    }

    /** @type {{ id: string, version: string, missing: boolean }[]} */
    let requires = mod.metadata.extra.requires;

    if (Array.isArray(requires)) {
        requires = requires.map((r) => ({
            id: r,
            version: "*"
        }));
    } else {
        const oldRequires = requires;
        requires = [];

        // Here, invalid versions are ignored
        for (const req in oldRequires) {
            requires.push({
                id: req,
                version: semver.validRange(oldRequires[req]) || "*"
            });
        }
    }

    return requires.map((req) => {
        const requiredMod = MODS.mods.find((m) => m.metadata.id == req.id);
        const installedVersion = requiredMod?.metadata.version;

        return {
            ...req,
            name: requiredMod?.metadata?.name ?? req.id,
            missing: !modRequire(req.id, req.version, true),
            installedVersion: installedVersion
                ? semver.clean(installedVersion)
                : undefined
        };
    });
}

/**
 * @param {import("mods/mod").Mod} mod
 * @returns {{ name: string, icon?: string, email: string?, website: string? }[]}
 */
export function getAuthors(mod) {
    if (!mod.metadata.extra?.authors?.length) {
        // Extra metadata for authors is missing,
        // empty or invalid
        if (!mod.metadata.author) {
            return [];
        }

        return [{ name: mod.metadata.author }];
    }

    return mod.metadata.extra.authors.map((author) => {
        if (typeof author === "string") {
            return { name: author };
        }

        return author;
    });
}

/**
 * @param {import("mods/mod").Mod} mod
 * @returns {{ url: string, description?: string }[]}
 */
export function getScreenshots(mod) {
    if (!mod.metadata.extra?.screenshots?.length) {
        // Either no extra or no screenshots
        return [];
    }

    return mod.metadata.extra.screenshots.map((screenshot) => {
        if (typeof screenshot === "string") {
            return { url: screenshot };
        }

        return screenshot;
    });
}

/**
 * @param {import("mods/mod").Mod} mod
 * @param {string?} lastVersion
 */
export function getChangelog(mod, lastVersion = undefined) {
    if (typeof mod.metadata.extra?.changelog !== "object") {
        return [];
    }

    const versions = Object.keys(mod.metadata.extra.changelog)
        .map(semver.valid)
        .filter((version) => !!version)
        .sort(semver.rcompare);

    /** @type {{ version: string, new: boolean, changes: string[] }[]} */
    const result = [];
    for (const version of versions) {
        const changes = mod.metadata.extra.changelog[version];
        if (!Array.isArray(changes)) {
            continue;
        }

        const isNew = lastVersion && semver.gt(version, lastVersion);
        result.push({
            version,
            new: Boolean(isNew),
            changes: changes.filter((change) => typeof change === "string")
        });
    }

    return result;
}

/**
 * @param {import("mods/mod").Mod} mod
 */
export function getAuthorString(mod) {
    const authors = getAuthors(mod).map((author) => author.name);

    switch (authors.length) {
        case 0:
            return T.authors.none;
        case 1:
            return authors[0];
        case 2:
            return T.authors.two
                .replace("<0>", authors[0])
                .replace("<1>", authors[1]);
    }

    return T.authors.more
        .replace("<0>", authors[0])
        .replace("<x>", authors.length - 1);
}

/**
 * @param {import("mods/mod").Mod} mod
 */
export function isValidVersion(mod) {
    return !!semver.clean(mod.metadata.version);
}

/**
 * @param {import("mods/mod").Mod} mod
 */
export function hasMissingDeps(mod) {
    return getDependencies(mod).some((dep) => dep.missing);
}

/**
 * @param {import("mods/mod").Mod} mod
 */
export function hasExtraMetadata(mod) {
    if (typeof mod.metadata.extra !== "object") {
        return false;
    }

    const props = ["icon", "authors", "readme", "source", "changelog"];
    return props.some((prop) =>
        Object.prototype.hasOwnProperty.call(mod.metadata.extra, prop)
    );
}

export function dependencyLabel(dependency) {
    if (!dependency.missing) {
        return undefined;
    }

    if (!dependency.installedVersion) {
        return T.dependencies.missing;
    }

    return semver.gtr(dependency.installedVersion, dependency.version)
        ? T.dependencies.new
        : T.dependencies.old;
}

export function getSortedMods() {
    /**
     * @param {import("mods/mod").Mod} a
     * @param {import("mods/mod").Mod} b
     */
    function sort(a, b) {
        let result = 0;
        result -= isValidVersion(a) - isValidVersion(b);
        result -= hasMissingDeps(a) - hasMissingDeps(b);
        // TODO: sort mods with satisfied conflicts higher

        return result;
    }

    return [...MODS.mods].sort(sort);
}
