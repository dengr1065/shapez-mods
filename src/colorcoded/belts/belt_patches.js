// Patches for Belt game system: handles belt rendering

import { BELT_ANIM_COUNT } from "game/systems/belt";
import { getAnimationIndex } from "./shared";

function renderSimplifiedBelts(parameters, contents, animationIndex) {
    let hoveredBeltPath = null;
    const mousePos = this.root.app.mousePosition;

    if (mousePos && this.root.currentLayer === "regular") {
        const { x, y } = this.root.camera.screenToWorld(mousePos).toTileSpace();
        const contents = this.root.map.getLayerContentXY(x, y, "regular");

        if (contents && contents.components.Belt) {
            hoveredBeltPath = contents.components.Belt.assignedPath;
        }
    }

    for (const entity of contents) {
        if (!entity.components.Belt) continue;

        const direction = entity.components.Belt.direction;
        let sprite = this.beltAnimations[direction][0];

        if (entity.components.Belt.assignedPath === hoveredBeltPath) {
            sprite =
                this.beltAnimations[direction][
                    animationIndex % BELT_ANIM_COUNT
                ];
        }

        entity.components.StaticMapEntity.drawSpriteOnBoundsClipped(
            parameters,
            entity.components.ColorCoded.getSprite(sprite),
            0
        );
    }
}

export function drawChunk(_, [parameters, chunk]) {
    const animationIndex = getAnimationIndex(this.root);

    const contents = chunk.containedEntitiesByLayer.regular;
    if (this.root.app.settings.getAllSettings().simplifiedBelts) {
        // POTATO Mode: Only show items when belt is hovered
        renderSimplifiedBelts.call(this, parameters, contents, animationIndex);
        return;
    }

    for (const entity of contents) {
        if (!entity.components.Belt) continue;

        const direction = entity.components.Belt.direction;
        const sprite =
            this.beltAnimations[direction][animationIndex % BELT_ANIM_COUNT];

        // Culling happens within the static map entity component
        entity.components.StaticMapEntity.drawSpriteOnBoundsClipped(
            parameters,
            entity.components.ColorCoded.getSprite(sprite),
            0
        );
    }
}
