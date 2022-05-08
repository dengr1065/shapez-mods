import { ToggleRow } from "../rows/toggle_row";

/**
 * Integration: creates additional rows that require
 * Mod Extras presence.
 * @param {import("../hud").HUDMicroSandbox} hud
 */
export function getModExtrasRows(hud) {
    return [
        new ToggleRow(hud, {
            label: "Free Blueprints",
            getter: () => hud.freeBlueprints,
            setter: (value) => (hud.freeBlueprints = value)
        }),
        new ToggleRow(hud, {
            label: "Unlock Rewards",
            getter: () => hud.unlockRewards,
            setter: (value) => (hud.unlockRewards = value)
        })
    ];
}
