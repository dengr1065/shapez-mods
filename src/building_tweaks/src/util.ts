import { MODS } from "mods/modloader";
import { BuildingTweaks } from "./mod";

export function getBuildingTweaksMod(): BuildingTweaks {
    return MODS.mods.find(
        (mod) => mod.metadata.id === "dengr1065:building_tweaks"
    ) as BuildingTweaks;
}
