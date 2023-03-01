import { generateMatrixRotations } from "core/utils";
import { enumDirection, Vector } from "core/vector";
import {
    enumPinSlotType,
    WiredPinsComponent,
    WirePinSlotDefinition
} from "game/components/wired_pins";
import { Entity } from "game/entity";
import { defaultBuildingVariant } from "game/meta_building";
import { GameRoot } from "game/root";
import { enumHubGoalRewards } from "game/tutorial_goals";
import { ModMetaBuilding } from "mods/mod_meta_building";
import { BreakpointComponent } from "./component";
import metadata from "./mod.json";
import tutorial from "./tutorial.webp";

export const BREAKPOINT_BUILDING_ID = `${metadata.id}:breakpoint`;

const overlayMatrix = generateMatrixRotations([1, 1, 1, 1, 0, 1, 0, 1, 0]);
const description =
    "Pauses the game when a truthy value is received. " +
    "The game will not be paused again until value becomes falsy.";

export class BreakpointBuilding extends ModMetaBuilding {
    constructor() {
        super(BREAKPOINT_BUILDING_ID);
    }

    static getAllVariantCombinations() {
        return [
            {
                variant: defaultBuildingVariant,
                name: "Breakpoint",
                description: description,
                tutorialImageBase64: tutorial
            }
        ];
    }

    getSilhouetteColor() {
        return "#efe040";
    }

    getIsUnlocked(root: GameRoot) {
        return root.hubGoals.isRewardUnlocked(
            enumHubGoalRewards.reward_wires_painter_and_levers
        );
    }

    getLayer() {
        return "wires";
    }

    getRenderPins() {
        return false;
    }

    getSpecialOverlayRenderMatrix(rotation: number) {
        return overlayMatrix[rotation];
    }

    setupEntityComponents(entity: Entity) {
        const pinSlot: WirePinSlotDefinition = {
            type: enumPinSlotType.logicalAcceptor,
            pos: new Vector(0, 0),
            direction: enumDirection.bottom
        };

        entity.addComponent(
            new WiredPinsComponent({
                slots: [pinSlot]
            })
        );

        entity.addComponent(new BreakpointComponent({}));
    }
}
