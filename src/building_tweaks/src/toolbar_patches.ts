import { gMetaBuildingRegistry } from "core/global_registries";
import { SingletonFactory } from "core/singleton_factory";
import { safeModulo } from "core/utils";
import { HUDBaseToolbar } from "game/hud/parts/base_toolbar";
import { KEYMAPPINGS } from "game/key_action_mapper";
import { MetaBuilding } from "game/meta_building";
import { getBuildingTweaksMod } from "./util";

type Toolbar = "secondary" | "primary";

function getBuildingToolbar(this: HUDBaseToolbar, index: number): Toolbar {
    const secondaryStartIndex = this.primaryBuildings.length;
    return index >= secondaryStartIndex ? "secondary" : "primary";
}

function getActiveBuildingSet(this: HUDBaseToolbar) {
    const activeToolbar = getBuildingToolbar.call(this, this.lastSelectedIndex);
    return activeToolbar == "primary"
        ? this.primaryBuildings
        : this.secondaryBuildings;
}

function getLastSelectedToolbarIndex(this: HUDBaseToolbar) {
    const buildingSet = getActiveBuildingSet.call(this);
    const isSecondary = buildingSet == this.secondaryBuildings;

    const offset = isSecondary ? this.primaryBuildings.length : 0;
    return this.lastSelectedIndex - offset;
}

function getNextBuilding(this: HUDBaseToolbar, reverse = false): MetaBuilding {
    const registry: SingletonFactory = gMetaBuildingRegistry;

    const direction = reverse ? -1 : 1;
    const buildingSet = getActiveBuildingSet.call(this);

    const startingIndex = getLastSelectedToolbarIndex.call(this);
    let index = startingIndex;

    do {
        index = safeModulo(index + direction, buildingSet.length);
        const building = registry.findByClass(buildingSet[index]);
        const handle = this.buildingHandles[building.id];

        if (handle.unlocked && !handle.selected) {
            return building;
        }
    } while (index !== startingIndex);

    // None of the buildings were suitable
    return null;
}

export function cycleBuildingsPatch(
    this: HUDBaseToolbar,
    srcMethod: () => void
) {
    const mod = getBuildingTweaksMod();
    if (!mod.settingsManager.cycleBuildingsFix) {
        srcMethod.call(this);
        return;
    }

    if (!this.visibilityCondition()) {
        return;
    }

    const reverseKey = KEYMAPPINGS.placement.rotateInverseModifier;
    const reverse = this.root.keyMapper.getBinding(reverseKey).pressed;

    const building = getNextBuilding.call(this, reverse);
    if (building === null) {
        return;
    }

    this.selectBuildingForPlacement(building);
}
