import { KEYCODES } from "game/key_action_mapper";
import { Mod } from "mods/mod";
import info from "./mod.json";
import { initialize } from "./css";
import { HUDCustomCSSEditor } from "./editor";
import styles from "./editor.less";

class CustomCSSMod extends Mod {
    init() {
        initialize(this.settings.css || "");
        this.modInterface.registerCss(styles);

        this.modInterface.registerIngameKeybinding({
            id: "custom_css_editor",
            keyCode: KEYCODES.F8,
            modifiers: { ctrl: true },
            translation: "Custom CSS/LESS Editor",
            handler: (root) => root.hud.parts.customCSSEditor.toggle()
        });

        this.signals.gameInitialized.add(this.registerHud, this);
    }

    registerHud(/** @type {import("game/root").GameRoot} */ root) {
        const part = new HUDCustomCSSEditor(root, this);
        root.hud.parts.customCSSEditor = part;

        this.signals.hudElementInitialized.dispatch(part);
        part.createElements(document.body);
        part.initialize();
        this.signals.hudElementFinalized.dispatch(part);
    }
}

registerMod(CustomCSSMod, info);
