// Patches to StaticMapEntity system to apply filters

import { globalConfig } from "core/config";
import {
    AtlasSprite,
    ORIGINAL_SPRITE_SCALE,
    SpriteAtlasLink
} from "core/sprites";

/**
 * @param {AtlasSprite} source
 * @param {string} filter
 */
function createSprite(source, filter) {
    const sourceLink = source.linksByResolution[ORIGINAL_SPRITE_SCALE];
    const { w, h } = sourceLink;

    const sprite = new AtlasSprite(source.spriteName);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    ctx.filter = filter;
    source.draw(ctx, 0, 0, w, h);

    const link = new SpriteAtlasLink({
        w,
        h,
        atlas: canvas,
        packOffsetX: 0,
        packOffsetY: 0,
        packedX: 0,
        packedY: 0,
        packedW: w,
        packedH: h
    });

    for (const resolution of ["0.25", "0.5", "0.75"]) {
        sprite.linksByResolution[resolution] = link;
    }

    return sprite;
}

function drawSpriteWithFilter(entity, parameters, sprite) {
    const { StaticMapEntity, ColorCoded } = entity.components;

    if (ColorCoded.hasColorFilter()) {
        if (!sprite.colorCoded) {
            sprite.colorCoded = [];
        }

        const filter = ColorCoded.getColorFilter();
        if (!sprite.colorCoded[filter]) {
            // create a sprite with applied filter and cache it
            sprite.colorCoded[filter] = createSprite(sprite, filter);
        }

        sprite = sprite.colorCoded[filter];
    }

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
