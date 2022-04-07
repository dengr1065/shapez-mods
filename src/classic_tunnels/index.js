import { globalConfig } from "core/config";
import {
    enumDirection,
    enumDirectionToAngle,
    enumDirectionToVector
} from "core/vector";
import { enumUndergroundBeltMode } from "game/components/underground_belt";
import { UndergroundBeltSystem } from "game/systems/underground_belt";
import { Mod } from "mods/mod";
import info from "./mod.json";

/**
 * Finds the receiver for a given sender
 * @this {UndergroundBeltSystem}
 * @param {import("game/entity").Entity} entity
 * @returns {import("game/components/underground_belt").LinkedUndergroundBelt}
 */
function findRecieverForSender(_, [entity]) {
    const { StaticMapEntity, UndergroundBelt } = entity.components;

    const searchDirection = StaticMapEntity.localDirectionToWorld(
        enumDirection.top
    );
    const searchVector = enumDirectionToVector[searchDirection];
    const targetRotation = enumDirectionToAngle[searchDirection];
    let currentTile = StaticMapEntity.origin;

    // Search in the direction of the tunnel
    for (
        let searchOffset = 0;
        searchOffset <
        globalConfig.undergroundBeltMaxTilesByTier[UndergroundBelt.tier];
        ++searchOffset
    ) {
        currentTile = currentTile.add(searchVector);

        const potentialReceiver = this.root.map.getTileContent(
            currentTile,
            "regular"
        );
        if (!potentialReceiver) {
            // Empty tile
            continue;
        }
        const receiverUndergroundComp =
            potentialReceiver.components.UndergroundBelt;
        if (
            !receiverUndergroundComp ||
            receiverUndergroundComp.tier !== UndergroundBelt.tier
        ) {
            // Not a tunnel, or not on the same tier
            continue;
        }

        if (receiverUndergroundComp.mode !== enumUndergroundBeltMode.receiver) {
            // Not a receiver, but a sender -> Abort to make sure we don't deliver double
            continue;
        }

        const receiverStaticComp = potentialReceiver.components.StaticMapEntity;
        if (receiverStaticComp.rotation !== targetRotation) {
            // Wrong rotation
            continue;
        }

        return { entity: potentialReceiver, distance: searchOffset };
    }

    // None found
    return { entity: null, distance: 0 };
}

class ClassicTunnels extends Mod {
    init() {
        this.modInterface.replaceMethod(
            UndergroundBeltSystem,
            "findRecieverForSender",
            findRecieverForSender
        );
    }
}

window.$shapez_registerMod(ClassicTunnels, info);
