import { createLogger } from "core/logging";
import { Dialog } from "core/modal_dialog_elements";
import { makeDiv } from "core/utils";
import semver from "semver";
import { getMod, MOD_ID, T } from "../constants";
import { getChangelog, isValidVersion } from "../mod_helpers";

const logger = createLogger("ME:Changelog");
const CLASS = (MOD_ID + ":changelog").replaceAll(":", "_");

/**
 * @param {import("mods/mod").Mod} mod
 * @param {boolean} onlyIfNewer
 */
export function showChangelogDialog(mod, onlyIfNewer = true) {
    if (!isValidVersion(mod)) {
        throw new Error("Invalid mod version, not showing changelog");
    }

    const meMod = getMod();
    const lastViewed = meMod.settings.lastViewedChangelogs;
    const lastVersion = lastViewed[mod.metadata.id];

    const changelog = getChangelog(mod, lastVersion);
    const hasNewEntries = changelog.some((change) => change.new);

    if (onlyIfNewer && !hasNewEntries) {
        logger.log(
            "All changelogs for version",
            mod.metadata.version,
            "of",
            mod.metadata.name,
            "have been already viewed."
        );
        return;
    }

    const uniqId = CLASS + (Math.random() * 32768).toString(16);
    const dialog = new Dialog({
        app: meMod.app,
        title: T.changelog.title.replace("<mod>", mod.metadata.name),
        buttons: [],
        closeButton: true,
        type: "info",
        contentHTML: `<div id="${uniqId}" class="${CLASS}"></div>`
    });

    const root = document.createDocumentFragment();

    for (const entry of changelog) {
        const element = makeDiv(root, undefined, ["entry"]);
        element.classList.toggle("new", entry.new);

        const version = makeDiv(element, undefined, ["version"]);
        version.innerText = semver.eq(entry.version, mod.metadata.version)
            ? T.changelog.installed.replace("<version>", entry.version)
            : entry.version;

        if (entry.changes.length == 0) {
            makeDiv(element, undefined, ["empty"]).innerText =
                T.changelog.noChanges;
            continue;
        }

        for (const change of entry.changes) {
            const changeElement = makeDiv(element, undefined, ["change"]);
            changeElement.innerText = change;
        }
    }

    meMod.dialogs.internalShowDialog(dialog);
    const dialogRoot = document.getElementById(uniqId);
    dialogRoot.appendChild(root);

    const rollback =
        lastVersion && semver.gt(lastVersion, mod.metadata.version);
    if (lastVersion && !hasNewEntries && !rollback) {
        // No need to persist again
        return;
    }

    // It's important that we actually save last version
    // present in changelog here.
    logger.log("Persisting changelog state for", mod.metadata.name);
    lastViewed[mod.metadata.id] = changelog.find((entry) =>
        semver.lte(entry.version, mod.metadata.version)
    )?.version;
    meMod.saveSettings();
}
