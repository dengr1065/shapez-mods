import { Blueprint } from "game/blueprint";
import { HubGoals } from "game/hub_goals";
import { HUDBlueprintPlacer } from "game/hud/parts/blueprint_placer";
import { KEYCODES } from "game/key_action_mapper";
import { Mod } from "mods/mod";
import { rowClasses, setupIntegrations } from "./api";
import { HUDMicroSandbox } from "./hud";
import metadata from "./metadata";
import styles from "./styles.less";

/**
 * This one is used for tryPlace and stuff.
 * @param {Function} sourceMethod
 * @param {[import("game/root").GameRoot]} args
 */
function canAffordBlueprint(sourceMethod, [root]) {
    if (root.hud.parts.microSandbox?.freeBlueprints) {
        return true;
    }

    return sourceMethod(root);
}

/**
 * Used internally in blueprint placer HUD.
 * @this {HUDBlueprintPlacer}
 */
function getHasFreeCopyPaste(sourceMethod) {
    if (this.root.hud.parts.microSandbox?.freeBlueprints) {
        return true;
    }

    return sourceMethod();
}

/**
 * Unlocking all rewards mostly affects buildings
 * @this {HubGoals}
 */
function isRewardUnlocked(sourceMethod, args) {
    if (this.root.hud.parts.microSandbox?.unlockRewards) {
        return true;
    }

    return sourceMethod(...args);
}

class MicroSandbox extends Mod {
    init() {
        this.modInterface.registerCss(styles);
        this.modInterface.registerIngameKeybinding({
            id: "microsandbox",
            keyCode: KEYCODES.F6,
            translation: "Toggle \u00b5Sandbox",
            handler: (root) => root.hud.parts.microSandbox.toggle()
        });

        // Patches to allow free copy-paste
        this.modInterface.replaceMethod(
            Blueprint,
            "canAfford",
            canAffordBlueprint
        );

        this.modInterface.replaceMethod(
            HUDBlueprintPlacer,
            "getHasFreeCopyPaste",
            getHasFreeCopyPaste
        );

        // Patches for unlocked rewards
        this.modInterface.replaceMethod(
            HubGoals,
            "isRewardUnlocked",
            isRewardUnlocked
        );

        this.signals.appBooted.add(() => setupIntegrations(this));
        this.signals.gameInitialized.add(this.registerHud, this);

        // Expose built-in rows
        this.rows = rowClasses;
    }

    registerHud(/** @type {import("game/root").GameRoot} */ root) {
        const part = new HUDMicroSandbox(root, this);
        root.hud.parts.microSandbox = part;

        part.createElements(document.body);
        this.signals.hudElementInitialized.dispatch(part);
        part.initialize();
        this.signals.hudElementFinalized.dispatch(part);
    }
}

registerMod(MicroSandbox, metadata);
