import {
    enumRotaterVariants,
    MetaRotaterBuilding
} from "game/buildings/rotater";
import { Mod } from "mods/mod";
import info from "./mod.json";
import sprite from "./building.png";
import blueprintSprite from "./blueprint.png";
import { enumHubGoalRewards } from "game/tutorial_goals";
import { Vector } from "core/vector";
import { MOD_ITEM_PROCESSOR_SPEEDS } from "game/hub_goals";
import { enumItemProcessorTypes } from "game/components/item_processor";
import { MOD_ITEM_PROCESSOR_HANDLERS } from "game/systems/item_processor";
import { generateMatrixRotations } from "core/utils";

const variant = "turn";
const processor = "rotatorTurn";
const matrix = generateMatrixRotations([0, 1, 1, 1, 1, 1, 1, 1, 0]);

/** @param {import("game/root").GameRoot} root */
MOD_ITEM_PROCESSOR_SPEEDS[processor] = (root) =>
    root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.rotater180);

MOD_ITEM_PROCESSOR_HANDLERS[processor] = (payload) => {
    // Smartest way to do anything, even if unsure if that works
    payload.outItems.push({
        item: payload.items.get(0)
    });
};

class TurnRotator extends Mod {
    init() {
        this.modInterface.replaceMethod(
            MetaRotaterBuilding,
            "updateVariants",
            (source, [entity, rotationVariant, buildingVariant]) => {
                if (buildingVariant == variant) {
                    entity.components.ItemProcessor.type = processor;
                    return;
                }

                source(entity, rotationVariant, buildingVariant);
            }
        );

        this.modInterface.replaceMethod(
            MetaRotaterBuilding,
            "getSpecialOverlayRenderMatrix",
            (source, [r, rv, v, e]) => {
                if (v == variant) {
                    return matrix[r];
                }

                return source(r, rv, v, e);
            }
        );

        this.modInterface.addVariantToExistingBuilding(
            MetaRotaterBuilding,
            variant,
            {
                regularSpriteBase64: sprite,
                blueprintSpriteBase64: blueprintSprite,
                name: "Rotator (360°)",
                description: "Rotates shapes by 360 degrees.",
                isUnlocked: (root) =>
                    root.hubGoals.isRewardUnlocked(
                        enumHubGoalRewards.reward_rotater_180
                    ),
                dimensions: new Vector(1, 1),
                additionalStatistics: (root) =>
                    MetaRotaterBuilding.prototype.getAdditionalStatistics(
                        root,
                        enumRotaterVariants.rotate180
                    )
            }
        );
    }
}

// eslint-disable-next-line no-undef
registerMod(TurnRotator, info);
