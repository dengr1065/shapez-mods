import { HUDBuildingPlacer } from "game/hud/parts/building_placer";
import { HUDBuildingPlacerLogic } from "game/hud/parts/building_placer_logic";
import { Mod } from "mods/mod";
import {
    drawPatch,
    isDirectionLockActiveGetter,
    onMouseMovePatch,
    onMouseUpPatch,
    postInitialize,
    tryPlaceCurrentBuildingAtPatch,
    updatePatch
} from "./building_placer_patches";
import { SettingsManager } from "./settings";
import { HUDBaseToolbar } from "game/hud/parts/base_toolbar";
import { cycleBuildingsPatch } from "./toolbar_patches";

export class BuildingTweaks extends Mod {
    settingsManager = new SettingsManager(this);

    init() {
        // Cache the mod instance to avoid expensive find call
        this.modInterface.runBeforeMethod(
            HUDBuildingPlacerLogic,
            "initialize",
            postInitialize
        );

        // Belt planner always on (follows multiplace setting)
        Object.defineProperty(
            HUDBuildingPlacerLogic.prototype,
            "isDirectionLockActive",
            { get: isDirectionLockActiveGetter }
        );

        // Keep the selected building while in map overview
        this.modInterface.replaceMethod(
            HUDBuildingPlacerLogic,
            "update",
            updatePatch
        );

        this.modInterface.replaceMethod(
            HUDBuildingPlacerLogic,
            "tryPlaceCurrentBuildingAt",
            tryPlaceCurrentBuildingAtPatch
        );

        this.modInterface.replaceMethod(
            HUDBuildingPlacerLogic,
            "onMouseMove",
            onMouseMovePatch
        );

        this.modInterface.replaceMethod(
            HUDBuildingPlacerLogic,
            "onMouseUp",
            onMouseUpPatch
        );

        this.modInterface.replaceMethod(HUDBuildingPlacer, "draw", drawPatch);

        // Cycle buildings in the current toolbar
        this.modInterface.replaceMethod(
            HUDBaseToolbar,
            "cycleBuildings",
            cycleBuildingsPatch
        );
    }
}
