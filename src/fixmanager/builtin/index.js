import helloWorldFix, { initializeHelloWorldFix } from "./hello_world";
import settingsMenuFix, { initSettingsMenuFix } from "./settings_menu";

const builtInFixes = [helloWorldFix, settingsMenuFix];

/**
 * This function hooks into various places of the game
 * to change behavior depending on the fixes.
 * @param {import("mods/mod_interface").ModInterface} modInterface
 */
export function initializeFixes(modInterface) {
    initializeHelloWorldFix(modInterface);
    initSettingsMenuFix(modInterface);
}

export { builtInFixes };
