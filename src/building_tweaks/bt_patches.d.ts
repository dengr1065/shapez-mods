import { BuildingTweaks } from "./src/mod";

declare module "game/hud/parts/building_placer_logic" {
    interface HUDBuildingPlacerLogic {
        buildingTweaks: BuildingTweaks;
    }
}
