import { createLogger } from "core/logging";
import { Keybinding, KEYCODES } from "game/key_action_mapper";
import { GameRoot } from "game/root";
import { Mod } from "mods/mod";
import { showAddExclusionDialog } from "./exclusion";
import { getAllUpgradeKeys } from "./upgrades";
import { getLevelKeys } from "./zeitgeist";

type HubNukeSettings = {
    keepShapes: string[];
    keepLevels: number;
    keepBlueprints: boolean;
    keepUpgrades: boolean;
};

export class HubNuke extends Mod {
    logger = createLogger(this);

    init() {
        this.modInterface.registerIngameKeybinding({
            id: `${this.metadata.id}:add_exclusion`,
            translation: "Hub Nuke: Exclude a shape",
            modifiers: { ctrl: true, alt: true },
            keyCode: KEYCODES.F9,
            handler: this.addExclusion.bind(this)
        });

        this.modInterface.registerIngameKeybinding({
            id: `${this.metadata.id}:clean`,
            translation: "Hub Nuke: Clean storage",
            modifiers: { ctrl: true },
            keyCode: KEYCODES.F9,
            handler: this.clean.bind(this)
        });
    }

    addExclusion() {
        const signal = showAddExclusionDialog(this.dialogs);
        signal.add((key) => {
            const keepShapes: string[] = this.settings.keepShapes;
            if (!keepShapes.includes(key)) {
                keepShapes.push(key);
                this.saveSettings();
            }
        });
    }

    getPreservedKeys(root: GameRoot): Set<string> {
        const settings = this.settings as HubNukeSettings;
        const preservedKeys = new Set<string>(settings.keepShapes);

        for (const key of getLevelKeys(root, settings.keepLevels)) {
            preservedKeys.add(key);
        }

        if (settings.keepBlueprints) {
            const blueprintKey = root.gameMode.getBlueprintShapeKey();
            preservedKeys.add(blueprintKey);
        }

        if (settings.keepUpgrades) {
            const upgradeKeys = getAllUpgradeKeys(root);
            for (const key of upgradeKeys) {
                preservedKeys.add(key);
            }
        }

        return preservedKeys;
    }

    clean(root: GameRoot) {
        const altKey = new Keybinding(root.keyMapper, root.app, {
            keyCode: KEYCODES.Alt
        });

        if (altKey.pressed) {
            // Add Exclusion dialog key pressed
            return;
        }

        if (!root.gameMode.hasHub()) {
            this.logger.warn("Cannot clean Hub because it doesn't exist!");
            return;
        }

        const keys = this.getPreservedKeys(root);
        const preserved: { [k: string]: number } = {};

        for (const key of keys) {
            // Direct access to avoid conflicts with sandbox mods
            const stored = root.hubGoals.storedShapes[key];
            if (stored == undefined) {
                continue;
            }

            preserved[key] = stored;
        }

        // Replace the stored shapes object with clean one
        root.hubGoals.storedShapes = preserved;
        this.logger.log(
            `Left ${Object.keys(preserved).length} keys in the Hub`
        );
    }
}
