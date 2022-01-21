// Patches to StaticMapEntity system to apply filters

import { globalConfig } from "core/config";

function drawSpriteWithFilter(entity, parameters, sprite) {
    const { StaticMapEntity, ColorCoded } = entity.components;
    const filter = ColorCoded.hasColorFilter();

    if (filter) {
        parameters.context.filter = ColorCoded.getColorFilter();
    }

    StaticMapEntity.drawSpriteOnBoundsClipped(parameters, sprite, 2);

    if (filter) {
        parameters.context.filter = "none";
    }
}

export function drawChunk(_, [parameters, chunk]) {
    const contents = chunk.containedEntitiesByLayer.regular;
    for (const entity of contents) {
        const staticComp = entity.components.StaticMapEntity;
        const sprite = staticComp.getSprite();

        if (sprite) {
            // Avoid drawing an entity twice which has been drawn for
            // another chunk already
            if (this.drawnUids.has(entity.uid)) {
                continue;
            }

            this.drawnUids.add(entity.uid);
            drawSpriteWithFilter(entity, parameters, sprite);
        }
    }
}

export function drawWiresChunk(_, [parameters, chunk]) {
    const drawnUids = new Set();
    const contents = chunk.wireContents;

    for (let y = 0; y < globalConfig.mapChunkSize; ++y) {
        for (let x = 0; x < globalConfig.mapChunkSize; ++x) {
            const entity = contents[x][y];

            if (entity) {
                if (drawnUids.has(entity.uid)) {
                    continue;
                }
                drawnUids.add(entity.uid);

                const staticComp = entity.components.StaticMapEntity;
                const sprite = staticComp.getSprite();

                if (sprite) {
                    drawSpriteWithFilter(entity, parameters, sprite);
                }
            }
        }
    }
}
