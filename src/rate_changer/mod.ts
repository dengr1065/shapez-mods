import { KEYCODES } from "game/key_action_mapper";
import { GameRoot } from "game/root";
import { Mod } from "mods/mod";
import styles from "./assets/styles.less";
import * as hotkeys from "./hotkeys";
import { HUDRateChanger } from "./hud_element";
import { I18N, MOD_ID } from "./util";

export class RateChanger extends Mod {
    init() {
        // TODO: Pause and Step integration

        this.registerHotkeys();

        this.modInterface.registerCss(styles);
        this.signals.hudInitializer.add((root: GameRoot) => {
            if (root.gameMode.getFixedTickrate()) {
                return;
            }

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
}
