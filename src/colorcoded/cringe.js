/*
 * Your warranty is now void.
 *
 * I am not responsible for bricked devices, dead SD cards,
 * thermonuclear war, or you getting fired because the alarm app failed. Please
 * do some research if you have any concerns about features included in this kernel
 * before flashing it! YOU are choosing to make these modifications, and if
 * you point the finger at me for messing up your device, I will laugh at you.*/

import info from "./mod.json";

const betaLine = "You're on a beta version of ColorCoded, expect some bugs.";
const issuesLink = "https://github.com/dengr1065/shapez-mods/issues".replace(
    /.+/,
    '<a href="$&">$&</a>'
);

export const DISCLAIMER = [
    "This mod might conflict with other installed mods",
    "because it replaces core parts of the game with",
    "own implementations. Some features might not work,",
    "and the game may crash. ColorCoded attempts to",
    "support buildings and colors from other mods, but",
    "they must be registered in correct loading stages.",
    "",
    "The mod also has own HUD parts, so HUD from other",
    "mods might get obstructed. If that's the case,",
    "please let me know!",
    "",
    "Using ColorCoded on savegames created without it",
    "is dangerous and can cause unexpected behavior.",
    "Savegames created with this mod might also not",
    "load without it. To avoid possible savegame",
    "corruptions, make frequent backups.",
    "",
    ...(info.version.endsWith("b") ? [betaLine] : []),
    "Report issues to " + issuesLink,
    "Visit the mod loader Discord server for support."
].join("<br>");
