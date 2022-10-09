import { createLogger } from "core/logging";
import { keyToKeyCode } from "game/key_action_mapper";
import { Mod } from "mods/mod";
import { shiftWireColors } from "./logic";
import _metadata from "./mod.json";
import icon from "./icon.webp";
import { registerKeybindingForOverlay } from "../../lib/kboverlay";

export class WireShifter extends Mod {
    logger = createLogger(this.constructor.name);

    init() {
        const keybinding = this.modInterface.registerIngameKeybinding({
            id: `${this.metadata.id}:shift_wire_colors`,
            translation: "Shift Wire Colors",
            keyCode: keyToKeyCode("R"),
            handler: shiftWireColors.bind(this)
        });

        registerKeybindingForOverlay(this.modInterface, {
            id: keybinding.id,
            condition: (hud) => hud.anythingSelectedOnMap
        });
    }
}

const metadata = <ModExtrasMetadata>(<unknown>_metadata);
metadata.extra.icon = icon;
registerMod(WireShifter, metadata);
