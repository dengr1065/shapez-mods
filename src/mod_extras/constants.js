import { MODS } from "mods/modloader";

export const MOD_ID = "dengr1065:mod_extras";
export const MOD_IO_LINK = "https://shapez.mod.io/";

/** @returns {import("./index").ModExtras} */
export function getMod() {
    return MODS.mods.find((mod) => mod.metadata.id == MOD_ID);
}

const fmtWarning = "format string missing";
export const T = {
    // Header of ModListState
    activeMods: {
        one: "{count} mod active",
        other: "{count} mods active"
    },
    reloadMods: "Soft Restart",
    openModsFolder: "Mods Folder",
    // Actions
    filterModsHint: "Filter mods\u2026",
    showLibraryMods: "Show Library Mods",
    // Mod Info
    chooseMod: "Select a mod from the list to view information about it.",
    noModsFound: (
        "Welcome to <mod>! This mod allows you to view information " +
        "about other mods, but none are installed. Visit the <modio> to find " +
        "some popular mods."
    ).replace("<modio>", `<a href="${MOD_IO_LINK}">Mod Marketplace</a>`),
    affectsSavegame: "This mod affects savegames.",
    noExtraInfo: "This mod does not provide additional information.",
    authorsTitle: "Mod authors",
    viewWebsite: "View website",
    openModSettings: "Settings",
    viewSourceCode: "Source Code",
    screenshots: "Screenshots",
    dependencies: {
        title: "Dependencies",
        hint: {
            one: "This mod is required:",
            many: "These mods are required:"
        },
        missing: "(missing)",
        old: "(old)",
        new: "(too new)"
    },
    readme: "About this mod",
    // Generic
    modVersion: "version <x>",
    modVersionUpdate: "version <x> - update available!",
    authors: {
        none: "No authors specified.",
        two: "<0> and <1>",
        more: "<0> and <x> more"
    },
    changelog: {
        title: "<mod> Changelog",
        view: "Changelog",
        noChanges: "No changes specified.",
        installed: "<version> (installed)"
    },
    update: {
        title: "New version available - <x>",
        noSummary: "There's no information about this update."
    }
};

export function format(string = fmtWarning, replacement = {}) {
    for (const key in replacement) {
        string = string.replaceAll(`{${key}}`, replacement[key]);
    }

    return string;
}
