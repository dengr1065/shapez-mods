import { MODS } from "mods/modloader";

const description = [
    "This mod does not have a website.",
    "Mod Extras has added a placeholder in order",
    "to allow loading old compatible savegames",
    "without this mod."
].join("\n");

export const nwLink = "data:text/plain;base64," + btoa(description);

export function apply() {
    for (const mod of MODS.mods) {
        if (!("website" in mod.metadata)) {
            mod.metadata.website = nwLink;
        }
    }
}
