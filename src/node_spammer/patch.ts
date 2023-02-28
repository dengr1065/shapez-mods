import { globalConfig } from "core/config";
import { RandomNumberGenerator } from "core/rng";
import { Vector } from "core/vector";
import { BaseItem } from "game/base_item";
import { enumColors } from "game/colors";
import { COLOR_ITEM_SINGLETONS } from "game/items/color_item";
import { MapChunk } from "game/map_chunk";
import { GameRoot } from "game/root";
import {
    enumSubShape,
    ShapeDefinition,
    ShapeLayer
} from "game/shape_definition";

type GeneratePatchesArgs = {
    rng: RandomNumberGenerator;
    chunkCenter: Vector;
    distanceToOriginInChunks: number;
};

function generateTile(root: GameRoot, rng: RandomNumberGenerator): BaseItem {
    if (rng.next() > 0.55) {
        // Place a random color
        const colors = Object.values(COLOR_ITEM_SINGLETONS);
        return rng.choice(colors);
    }

    const subShapes = Object.values(enumSubShape);
    const shapeLayer: ShapeLayer = [null, null, null, null].map(() => {
        return {
            subShape: rng.choice(subShapes),
            color: enumColors.uncolored
        };
    }) as ShapeLayer;

    const definition = new ShapeDefinition({
        layers: [shapeLayer]
    });

    return root.shapeDefinitionMgr.getShapeItemFromDefinition(definition);
}

export function generatePatches(
    this: MapChunk,
    _srcMethod: (args: GeneratePatchesArgs) => void,
    [{ rng }]: [GeneratePatchesArgs]
) {
    const layer = this.lowerLayer;

    for (let x = 0; x < globalConfig.mapChunkSize; x++) {
        for (let y = 0; y < globalConfig.mapChunkSize; y++) {
            const item = generateTile(this.root, rng);
            layer[x][y] = item;
        }
    }
}
