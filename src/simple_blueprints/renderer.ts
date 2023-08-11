import { globalConfig } from "core/config";
import { DrawParameters } from "core/draw_utils";
import { Vector } from "core/vector";
import { Blueprint } from "game/blueprint";
import { MetaBuilding } from "game/meta_building";
import metadata from "./mod.json";

const PIXEL_SIZE = globalConfig.tileSize / 3;

function drawMatrix(
    { context }: DrawParameters,
    matrix: number[] | null,
    tile: Vector
) {
    const worldTile = tile.toWorldSpace();
    for (let dx = 0; dx < 3; ++dx) {
        for (let dy = 0; dy < 3; ++dy) {
            const isFilled = matrix[dx + dy * 3];
            if (isFilled) {
                context.fillRect(
                    worldTile.x + dx * PIXEL_SIZE,
                    worldTile.y + dy * PIXEL_SIZE,
                    PIXEL_SIZE,
                    PIXEL_SIZE
                );
            }
        }
    }
}

function rotateSize(size: Vector, rotation: number) {
    switch (rotation) {
        case 0:
        case 180:
            return size;
        case 90:
        case 270:
            return new Vector(size.y, size.x);
    }

    throw new Error(`Invalid rotation requested: ${rotation}`);
}

function applyAdjust(pos: Vector, size: Vector, rotation: number) {
    switch (rotation) {
        case 0:
        case 90:
            return pos;
        case 180:
            return pos.subScalars(size.x - 1, 0);
        case 270:
            return pos.subScalars(0, size.y - 1);
    }
}

export function drawBlueprint(
    parameters: DrawParameters,
    blueprint: Blueprint,
    tile: Vector
) {
    // FIXME: refactor to use getMod
    const blueprintColor = shapez["THEME"][metadata.id]["blueprintColor"];
    parameters.context.fillStyle = blueprintColor;

    const placeableAlpha = blueprintColor == null ? 0.8 : 1;

    for (const entity of blueprint.entities) {
        const staticComp = entity.components.StaticMapEntity;
        const newPos = staticComp.origin.add(tile);

        const rect = staticComp.getTileSpaceBounds();
        rect.moveBy(tile.x, tile.y);

        const metaBuilding: MetaBuilding = staticComp.getMetaBuilding();
        const variant = staticComp.getVariant();
        const rotationVariant = staticComp.getRotationVariant();

        const canPlace = parameters.root.logic.checkCanPlaceEntity(entity, {
            offset: tile
        });
        parameters.context.globalAlpha = canPlace ? placeableAlpha : 0.3;

        if (blueprintColor === null) {
            // Use the regular map overview color
            parameters.context.fillStyle = metaBuilding.getSilhouetteColor(
                variant,
                rotationVariant
            );
        }

        const matrix = metaBuilding.getSpecialOverlayRenderMatrix(
            staticComp.rotation,
            rotationVariant,
            variant,
            entity
        );

        if (matrix) {
            drawMatrix(parameters, matrix, newPos);
        } else {
            const size = rotateSize(
                staticComp.getTileSize(),
                staticComp.rotation
            );
            const worldTile = applyAdjust(
                newPos,
                size,
                staticComp.rotation
            ).toWorldSpace();

            parameters.context.fillRect(
                worldTile.x,
                worldTile.y,
                Math.abs(globalConfig.tileSize * size.x),
                Math.abs(globalConfig.tileSize * size.y)
            );
        }
    }

    parameters.context.globalAlpha = 1;
}
