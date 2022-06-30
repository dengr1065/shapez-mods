import { Mod } from "mods/mod";
import { StaticMapEntitySystem } from "game/systems/static_map_entity";
import { BeltSystem } from "game/systems/belt";
import { BeltUnderlaysSystem } from "game/systems/belt_underlays";
import { ColorCodedComponent } from "./component";
import { COLOR_ITEM_SINGLETONS } from "game/items/color_item";
import { gMetaBuildingRegistry } from "core/global_registries";
import { HUDColorSelector, SIGNAL_NAME } from "./hud";
import { resources } from "./themes";
import { THEMES } from "game/theme";
import { COLOR_FILTERS, getColorFilter } from "./filters";
import { Signal } from "core/signal";
import { GameCore } from "game/core";

import * as systemPatches from "./system_patches";
import * as beltPatches from "./belts/belt_patches";
import * as beltUnderlaysPatches from "./belts/belt_underlays_patches";

import { MainMenuState } from "states/main_menu";

import css from "./hud.css";
import info from "./mod.json";
import icon from "./metadata/icon.webp";
import screenshot0 from "./metadata/screenshot0.png";

import { DISCLAIMER } from "./cringe";

const systemsToPatch = [
    { cls: StaticMapEntitySystem, patches: systemPatches },
    { cls: BeltSystem, patches: beltPatches },
    { cls: BeltUnderlaysSystem, patches: beltUnderlaysPatches }
];

class ColorCoded extends Mod {
    init() {
        this.modInterface.registerComponent(ColorCodedComponent);
        this.component = ColorCodedComponent;
        this.signalName = SIGNAL_NAME;

        // patch game systems
        for (const { cls, patches } of systemsToPatch) {
            for (const method in patches) {
                this.modInterface.replaceMethod(cls, method, patches[method]);
            }
        }

        // make sure the signal is registered, as soon as possible
        this.modInterface.runBeforeMethod(
            GameCore,
            "internalInitCanvas",
            function () {
                this.root.signals[SIGNAL_NAME] = new Signal();
            }
        );

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

        // also register signal dispatched by the hud
        this.signals[SIGNAL_NAME] = new Signal();
    }
}

info.extra.icon = icon;
info.extra.screenshots = [screenshot0];
registerMod(ColorCoded, info);
