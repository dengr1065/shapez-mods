import { Mod } from "mods/mod";
import { HUDAreaInfo } from "./hud";
import info from "./mod.json";
import styles from "./styles.less";

class AreaInfo extends Mod {
    init() {
        this.modInterface.registerCss(styles);
        this.signals.gameInitialized.add(this.registerHud, this);
    }

    registerHud(/** @type {import("game/root").GameRoot} */ root) {
        const part = new HUDAreaInfo(root, this);
        root.hud.parts.areaInfo = part;

        this.signals.hudElementInitialized.dispatch(part);
        part.createElements(document.body);
        part.initialize();
        this.signals.hudElementFinalized.dispatch(part);
    }
}

// eslint-disable-next-line no-undef
registerMod(AreaInfo, info);
