// Patches for Belt Underlays game system: handles underlay rendering

import { globalConfig } from "core/config";
import { Rectangle } from "core/rectangle";
import { FULL_CLIP_RECT } from "core/sprites";
import { enumDirectionToAngle } from "core/vector";
import { enumClippedBeltUnderlayType } from "game/components/belt_underlays";
import { getAnimationIndex } from "./shared";

/**
 * Mapping from underlay type to clip rect
 * @type {Object<enumClippedBeltUnderlayType, Rectangle>}
 */
const enumUnderlayTypeToClipRect = {
    [enumClippedBeltUnderlayType.none]: null,
    [enumClippedBeltUnderlayType.full]: FULL_CLIP_RECT,
    [enumClippedBeltUnderlayType.topOnly]: new Rectangle(0, 0, 1, 0.5),
    [enumClippedBeltUnderlayType.bottomOnly]: new Rectangle(0, 0.5, 1, 0.5)
};

function drawEntity(entity, parameters, chunk) {
    const staticComp = entity.components.StaticMapEntity;
    const underlays = entity.components.BeltUnderlays.underlays;

    for (const underlay of underlays) {
        const { pos, direction } = underlay;
        const transformedPos = staticComp.localTileToWorld(pos);
        const destX = transformedPos.x * globalConfig.tileSize;
        const destY = transformedPos.y * globalConfig.tileSize;

        // Culling, Part 1: Check if the chunk contains the tile
        if (
            !chunk.tileSpaceRectangle.containsPoint(
                transformedPos.x,
                transformedPos.y
            )
        ) {
            continue;
        }

        // Culling, Part 2: Check if the overlay is visible
        if (
            !parameters.visibleRect.containsRect4Params(
                destX,
                destY,
                globalConfig.tileSize,
                globalConfig.tileSize
            )
        ) {
            continue;
        }

        // Extract direction and angle
        const worldDirection = staticComp.localDirectionToWorld(direction);
        const angle = enumDirectionToAngle[worldDirection];

        const underlayType = this.computeBeltUnderlayType(entity, underlay);
        const clipRect = enumUnderlayTypeToClipRect[underlayType];
        if (!clipRect) {
            // Empty
            continue;
        }

        // Actually draw the sprite
        const x = destX + globalConfig.halfTileSize;
        const y = destY + globalConfig.halfTileSize;
        const angleRadians = Math.radians(angle);

        const animationIndex = getAnimationIndex(this.root);
        parameters.context.translate(x, y);
        parameters.context.rotate(angleRadians);

        const sprite =
            this.underlayBeltSprites[
                animationIndex % this.underlayBeltSprites.length
            ];
        entity.components.ColorCoded.getSprite(sprite).drawCachedWithClipRect(
            parameters,
            -globalConfig.halfTileSize,
            -globalConfig.halfTileSize,
            globalConfig.tileSize,
            globalConfig.tileSize,
            clipRect
        );

        parameters.context.rotate(-angleRadians);
        parameters.context.translate(-x, -y);
    }
}

export function drawChunk(_, [parameters, chunk]) {
    const contents = chunk.containedEntitiesByLayer.regular;

    for (const entity of contents) {
        if (!entity.components.BeltUnderlays) continue;

        drawEntity.call(this, entity, parameters, chunk);
    }
}
