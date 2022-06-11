import { globalConfig } from "core/config";
import { enumColors, enumColorsToHexCode } from "game/colors";
import { BOOL_FALSE_SINGLETON } from "game/items/boolean_item";
import { ColorItem } from "game/items/color_item";

/**
 * @param {import("game/root").GameRoot} root
 * @param {import("game/map_chunk_view").MapChunkView} chunk
 * @param {import("core/draw_parameters").DrawParameters} parameters
 * @param {number} offsetX
 * @param {number} offsetY
 * @this {import("./index").LitDisplays}
 */
export function renderDisplays(root, chunk, parameters, offsetX, offsetY) {
    if (root.currentLayer === "wires" && !this.renderOnWiresLayer) {
        // Rendering on Wires layer is disabled
        return;
    }

    parameters.context.imageSmoothingEnabled = false;
    const contents = chunk.containedEntitiesByLayer.regular;

    // We're re-using the canvas, clear it first
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const entity of contents) {
        if (!entity || !entity.components.Display) {
            continue;
        }

        const pinsComp = entity.components.WiredPins;
        const network = pinsComp.slots[0].linkedNetwork;

        if (!network || !network.hasValue()) {
            continue;
        }

        const value = getTileColor(network.currentValue);
        if (!value) {
            continue;
        }

        const origin = entity.components.StaticMapEntity.origin;

        this.context.fillStyle = enumColorsToHexCode[value];
        this.context.fillRect(
            origin.x * globalConfig.tileSize - offsetX,
            origin.y * globalConfig.tileSize - offsetY,
            globalConfig.tileSize,
            globalConfig.tileSize
        );
    }

    parameters.context.drawImage(this.canvas, offsetX, offsetY);
    parameters.context.imageSmoothingEnabled = true;
}

/**
 * Returns color that should be used for the specified network value.
 * @param {import("game/base_item").BaseItem} item Network value
 */
function getTileColor(item) {
    if (item === null) {
        // If there's no value, render nothing
        return null;
    }

    if (item === BOOL_FALSE_SINGLETON) {
        // Boolean 0 is also not rendered
        return null;
    }

    return item instanceof ColorItem ? item.color : enumColors.white;
}
