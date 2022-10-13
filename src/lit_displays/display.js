import { globalConfig } from "core/config";
import { DrawParameters } from "core/draw_parameters";
import { enumColors, enumColorsToHexCode } from "game/colors";
import { BOOL_FALSE_SINGLETON } from "game/items/boolean_item";
import { ColorItem } from "game/items/color_item";
import { ShapeItem } from "game/items/shape_item";

/**
 * Renders a single display.
 * @param {import("game/entity").Entity} entity
 * @param {DrawParameters} parameters
 * @param {number} offsetX
 * @param {number} offsetY
 * @this {import("./index").LitDisplays}
 */
function renderEntity(entity, parameters, offsetX, offsetY) {
    if (!entity || !entity.components.Display) {
        return;
    }

    const pinsComp = entity.components.WiredPins;
    /** @type {import("game/systems/wire").WireNetwork?} */
    const network = pinsComp.slots[0].linkedNetwork;

    if (!network || !network.hasValue()) {
        return;
    }

    const origin = entity.components.StaticMapEntity.origin;

    if (this.renderShapes && network.currentValue instanceof ShapeItem) {
        // This is where the fun begins
        network.currentValue.drawItemCenteredImpl(
            (origin.x + 0.5) * globalConfig.tileSize - offsetX,
            (origin.y + 0.5) * globalConfig.tileSize - offsetY,
            parameters,
            globalConfig.tileSize
        );
        return;
    }

    const color = getTileColor(network.currentValue);
    parameters.context.fillStyle = enumColorsToHexCode[color];
    parameters.context.fillRect(
        origin.x * globalConfig.tileSize - offsetX,
        origin.y * globalConfig.tileSize - offsetY,
        globalConfig.tileSize,
        globalConfig.tileSize
    );
}

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

    // This might be slow, but I'm not sure how chunk aggregates work
    const overlayParameters = new DrawParameters({
        context: this.context,
        desiredAtlasScale: parameters.desiredAtlasScale,
        root,
        visibleRect: parameters.visibleRect,
        zoomLevel: parameters.zoomLevel
    });

    for (const entity of contents) {
        renderEntity.call(this, entity, overlayParameters, offsetX, offsetY);
    }

    parameters.context.drawImage(this.canvas, offsetX, offsetY);
    parameters.context.imageSmoothingEnabled = true;
}

/**
 * Returns color that should be used for the specified network value.
 * @param {import("game/base_item").BaseItem} item Network value
 */
function getTileColor(item) {
    if (item === BOOL_FALSE_SINGLETON) {
        // Boolean 0 is also not rendered
        return null;
    }

    return item instanceof ColorItem ? item.color : enumColors.white;
}
