import { globalConfig } from "core/config";
import { enumColors, enumColorsToHexCode } from "game/colors";
import { ColorItem } from "game/items/color_item";

/**
 * @this {import("game/systems/display").DisplaySystem}
 * @param {import("core/draw_parameters").DrawParameters} parameters
 * @param {import("game/map_chunk_view").MapChunkView} chunk
 */
export function ldDrawMapView(parameters, chunk) {
    const contents = chunk.containedEntitiesByLayer.regular;

    for (const entity of contents) {
        if (!entity || !entity.components.Display) {
            continue;
        }

        const pinsComp = entity.components.WiredPins;
        const network = pinsComp.slots[0].linkedNetwork;

        if (!network || !network.hasValue()) {
            continue;
        }

        const value = this.getDisplayItem(network.currentValue);

        if (!value) {
            continue;
        }

        const origin = entity.components.StaticMapEntity.origin;
        const color =
            value instanceof ColorItem ? value.color : enumColors.white;

        parameters.context.fillStyle = enumColorsToHexCode[color];
        parameters.context.fillRect(
            origin.x * globalConfig.tileSize,
            origin.y * globalConfig.tileSize,
            globalConfig.tileSize,
            globalConfig.tileSize
        );
    }
}
