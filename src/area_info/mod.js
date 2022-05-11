import { Mod } from "mods/mod";
import { HUDAreaInfo } from "./hud";
import info from "./mod.json";
import styles from "./styles.less";
import icon from "./icon.webp";
import screenshot from "./screenshot.webp";
import readme from "./README.md";

class AreaInfo extends Mod {
    init() {
        this.metadata.extra.icon = icon;
        this.metadata.extra.screenshots = [screenshot];
        this.metadata.extra.readme = readme;

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

        // Move or hide vanilla blueprint placer
        const placer = root.hud.parts.blueprintPlacer;
        if (this.settings.useForBlueprints && placer) {
            placer.costDisplayParent.classList.add("withAreaInfo");

            if (this.settings.hideBlueprintPlacer) {
                // Useful for vanilla, as there's a single cost
                placer.costDisplayParent.style.display = "none";
            }
        }
    }
}

registerMod(AreaInfo, info);
