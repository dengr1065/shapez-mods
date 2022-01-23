// Patches for Static Map Entity game system: handles most buildings

import { globalConfig } from "core/config";

function drawSpriteWithFilter(entity, parameters, source) {
    const { StaticMapEntity, ColorCoded } = entity.components;

    const sprite = ColorCoded.getSprite(source);
    StaticMapEntity.drawSpriteOnBoundsClipped(parameters, sprite, 2);
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
