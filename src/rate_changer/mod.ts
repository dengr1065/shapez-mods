import { createLogger } from "core/logging";
import { KEYCODES } from "game/key_action_mapper";
import { GameRoot } from "game/root";
import { Mod } from "mods/mod";
import { SerializedGame } from "savegame/savegame_typedefs";
import styles from "./assets/styles.less";
import * as hotkeys from "./hotkeys";
import { HUDRateChanger } from "./hud_element";
import { I18N, MOD_ID } from "./util";

export class RateChanger extends Mod {
    private logger = createLogger("RateChanger");

    init() {
        // TODO: Pause and Step integration
        this.registerHotkeys();
        this.signals.gameSerialized.add(this.saveCustomRate, this);
        this.signals.gameDeserialized.add(this.loadCustomRate, this);

        this.modInterface.registerCss(styles);
        this.signals.hudInitializer.add((root: GameRoot) => {
            if (root.gameMode.getFixedTickrate()) {
                return;
            }

            this.logger.debug("Creating Rate Changer HUD");
            root.hud.parts["rateChanger"] = new HUDRateChanger(root);
        });
    }

    private registerHotkeys() {
        this.modInterface.registerIngameKeybinding({
            id: MOD_ID + ":toggle",
            translation: I18N.hotkeys.toggleCustomTickRate,
            keyCode: KEYCODES.F5,
            handler: hotkeys.toggleCustomTickRate
        });

        this.modInterface.registerIngameKeybinding({
            id: MOD_ID + ":increase",
            translation: I18N.hotkeys.increaseTickRate,
            keyCode: KEYCODES.ArrowUp,
            modifiers: { alt: true },
            handler: hotkeys.increaseTickRate
        });

        this.modInterface.registerIngameKeybinding({
            id: MOD_ID + ":decrease",
            translation: I18N.hotkeys.decreaseTickRate,
            keyCode: KEYCODES.ArrowDown,
            modifiers: { alt: true },
            handler: hotkeys.decreaseTickRate
        });
    }

    private saveCustomRate(root: GameRoot, dump: SerializedGame) {
        const parts = root.hud.parts;
        if (!("rateChanger" in parts)) {
            // The game mode doesn't support RC
            return;
        }

        const hudElement = parts.rateChanger as HUDRateChanger;
        dump.modExtraData[`${this.metadata.id}`] = {
            customRate: hudElement.customRate
        };
        this.logger.log(`Saved custom rate: ${hudElement.customRate}`);
    }

    private loadCustomRate(root: GameRoot, dump: SerializedGame) {
        const id = this.metadata.id;
        const modData = (dump.modExtraData[id] as object) ?? {};

        if (!("customRate" in modData)) {
            // Upgrading from an older version or newly installed mod
            return;
        }

        this.logger.log(`Loading custom rate: ${modData.customRate}`);
        const customRate = modData.customRate as number | null;

        const hudElement = root.hud.parts["rateChanger"];
        if (hudElement instanceof HUDRateChanger) {
            hudElement.customRate = customRate;
        }
    }
}
