import { KEYMAPPINGS } from "game/key_action_mapper";
import { defaultBuildingVariant, MetaBuilding } from "game/meta_building";
import { Mod } from "mods/mod";
import { T } from "translations";

export function hasKeybinding(building: MetaBuilding): boolean {
    // TODO: check whether per-layer bindings are needed
    return building.getId() in KEYMAPPINGS.buildings;
}

export function shouldCreateBinding(mod: Mod, building: MetaBuilding) {
    if (hasKeybinding(building)) {
        return false;
    }

    if (!(defaultBuildingVariant in T.buildings[building.getId()])) {
        return false;
    }

    const excludedBuildings = mod.settings.excludedBuildings;
    if (Array.isArray(excludedBuildings)) {
        return !excludedBuildings.includes(building.getId());
    }

    return true;
}

export function copyBuildingTranslation(building: MetaBuilding) {
    const id = building.getId();
    const translation = T.buildings[id][defaultBuildingVariant].name;

    T.keybindings.mappings[id] ??= translation;
}
