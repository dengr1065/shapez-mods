import { gMetaBuildingRegistry } from "core/global_registries";
import { Signal } from "core/signal";
import { GameCore } from "game/core";
import { COLOR_ITEM_SINGLETONS } from "game/items/color_item";
import { BeltSystem } from "game/systems/belt";
import { BeltUnderlaysSystem } from "game/systems/belt_underlays";
import { StaticMapEntitySystem } from "game/systems/static_map_entity";
import { THEMES } from "game/theme";
import { Mod } from "mods/mod";
import { ColorCodedComponent } from "./component";
import { COLOR_FILTERS, getColorFilter } from "./filters";
import { HUDColorSelector, SIGNAL_NAME } from "./hud";
import { resources } from "./themes";

import * as beltPatches from "./belts/belt_patches";
import * as beltUnderlaysPatches from "./belts/belt_underlays_patches";
import * as systemPatches from "./system_patches";

import { MainMenuState } from "states/main_menu";

import css from "./hud.css";
import icon from "./metadata/icon.webp";
import screenshot0 from "./metadata/screenshot0.png";
import info from "./mod.json";

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

        // move color-coding entity data to modExtraData
        this.signals.gameDeserialized.add(this.loadSavegameData, this);
        this.signals.gameSerialized.add(this.saveSavegameData, this);

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

    /**
     * @param {import("game/root").GameRoot} root
     */
    loadSavegameData(root, data) {
        console.log(data);
        if (!(this.metadata.id in data.modExtraData)) {
            return;
        }

        const componentId = ColorCodedComponent.getId();

        /** @type {ColorCodedExtraData} */
        const store = data.modExtraData[this.metadata.id];
        store.colorToUid ??= {};

        const uidMap = root.entityMgr.getFrozenUidSearchMap();
        root.logic.performBulkOperation(() => {
            for (const color in store.colorToUid) {
                if (!ColorCodedComponent.isValidColor(color)) {
                    continue;
                }

                const uids = store.colorToUid[color];
                const entities = uids.map((uid) => uidMap.get(uid));
                for (const entity of entities) {
                    /** @type {ColorCodedComponent} */
                    const comp = entity.components[componentId];
                    if (!comp) {
                        continue;
                    }

                    comp.color = color;
                }
            }
        });
    }

    saveSavegameData(_root, data) {
        const componentId = ColorCodedComponent.getId();

        /** @type {ColorCodedExtraData} */
        const store = { colorToUid: {} };
        data.modExtraData[this.metadata.id] = store;

        for (const entity of data.entities) {
            const component = entity.components[componentId];
            if (!component) {
                continue;
            }

            const color = component.color;
            if (!ColorCodedComponent.isDefaultColor(color)) {
                store.colorToUid[color] ??= [];
                store.colorToUid[color].push(entity.uid);
            }

            delete entity.components[componentId];
        }
    }
}

info.extra.icon = icon;
info.extra.screenshots = [screenshot0];
registerMod(ColorCoded, info);
