import { makeButton } from "core/utils";
import { HUDSettingsMenu } from "game/hud/parts/settings_menu";
import { FIXES_STATE } from "../fixes_state";
import styles from "./settings_menu.less";

let showButton = false;

/**
 * If this fix is enabled, add FixManager button to the menu.
 * @this {HUDSettingsMenu}
 */
function addButton() {
    if (!showButton) {
        return;
    }

    const button = makeButton(this.buttonContainer);
    button.id = "fixManager";

    this.trackClicks(button, () => {
        this.root.gameState.moveToState(FIXES_STATE, {
            backToStateId: this.root.gameState.key,
            backToStatePayload: this.root.gameState.creationPayload
        });
    });
}

/**
 * Adds a FixManager button to the Settings Menu
 * @param {import("mods/mod_interface").ModInterface} modInterface
 */
export function initSettingsMenuFix(modInterface) {
    modInterface.runAfterMethod(HUDSettingsMenu, "createElements", addButton);
    modInterface.registerCss(styles);
}

/** @type {Fix} */
const settingsMenuFix = {
    id: "show_in_settings_menu",
    name: "Show in Settings Menu",
    affectsSavegame: false,
    enable: function () {
        showButton = true;
    },
    disable: function () {
        showButton = false;
    }
};

export default settingsMenuFix;
