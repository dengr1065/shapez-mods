import { Mod } from "mods/mod";
import * as systemPatches from "./system_patches";
import { StaticMapEntitySystem } from "game/systems/static_map_entity";
import { ColorCodedComponent, COLOR_FILTERS } from "./component";
import { COLOR_ITEM_SINGLETONS } from "game/items/color_item";
import { gMetaBuildingRegistry } from "core/global_registries";
import { round2Digits } from "core/utils";
import { HUDColorSelector } from "./hud";
import { resources } from "./themes";
import { THEMES } from "game/theme";
import { enumColors } from "game/colors";
import { MainMenuState } from "states/main_menu";

import css from "./hud.css";
import info from "./mod.json";

import { DISCLAIMER } from "./cringe";

// https://stackoverflow.com/a/2348659
function hexToHue(hex) {
    const int = parseInt(hex.slice(1), 16);
    const r = (int >> 16) / 255;
    const g = ((int >> 8) & 0xff) / 255;
    const b = (int & 0xff) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    if (max == min) {
        return null;
    }

    let h = -1;
    const d = max - min;
    switch (max) {
        case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
        case g:
            h = (b - r) / d + 2;
            break;
        case b:
            h = (r - g) / d + 4;
            break;
    }
    h /= 6;

    return Math.floor(h * 360);
}

/**
 * @param {import("game/items/color_item").ColorItem} item
 */
function getColorFilter(item) {
    if (item.color == enumColors.white) {
        return "grayscale(1) brightness(1.4)";
    }

    const hex = item.getBackgroundColorAsResource();
    if (!hex) {
        // color is not available in our theme
        return "grayscale(1)";
    }

    const hue = hexToHue(hex);
    if (hue == null) {
        return "grayscale(1)";
    }

    return `contrast(1.8) hue-rotate(${round2Digits(hue - 38)}deg)`;
}

class ColorCoded extends Mod {
    init() {
        this.modInterface.registerComponent(ColorCodedComponent);

        // patch static map entity game system
        for (const method in systemPatches) {
            this.modInterface.replaceMethod(
                StaticMapEntitySystem,
                method,
                systemPatches[method]
            );
        }

        // once the game is initialized, all modded colors should be present
        this.signals.appBooted.add(this.setMissingColors, this);
        this.signals.appBooted.add(this.setColorFilters, this);
        this.signals.appBooted.add(this.patchEntityComponents, this);

        // show first launch warning
        this.signals.stateEntered.add(this.firstLaunch, this);

        // register hud to set color codes
        this.signals.gameInitialized.add(this.registerHud, this);

        this.modInterface.registerCss(css);
    }

    setColorFilters() {
        for (const item of Object.values(COLOR_ITEM_SINGLETONS)) {
            COLOR_FILTERS[item.color] = getColorFilter(item);
        }
    }

    patchEntityComponents() {
        // might not work, contact shrimp because cct buildings
        // will crash the game
        for (const instance of gMetaBuildingRegistry.entries) {
            this.modInterface.runAfterMethod(
                instance.constructor,
                "setupEntityComponents",
                function (entity) {
                    entity.addComponent(new ColorCodedComponent({}));
                }
            );
        }
    }

    setMissingColors() {
        for (const theme in resources) {
            const themeRes = THEMES[theme].map.resources;
            for (const color in resources[theme]) {
                if (!themeRes[color]) {
                    themeRes[color] = resources[theme][color];
                }
            }
        }
    }

    /**
     * @param {import("core/game_state").GameState} state
     */
    firstLaunch(state) {
        if (state instanceof MainMenuState) {
            if (!this.settings.firstLaunch) return;

            const signals = this.dialogs.showWarning("ColorCoded", DISCLAIMER, [
                "ok:good:timeout"
            ]);

            signals.ok.add(() => {
                this.settings.firstLaunch = false;
                this.saveSettings();
            });
        }
    }

    /**
     * @param {import("game/root").GameRoot} root
     */
    registerHud(root) {
        const part = new HUDColorSelector(root);
        root.hud.parts.colorSelector = part;

        this.signals.hudElementInitialized.dispatch(part);
        part.createElements(document.body);
        part.initialize();
        this.signals.hudElementFinalized.dispatch(part);
    }
}

// eslint-disable-next-line no-undef
registerMod(ColorCoded, info);
