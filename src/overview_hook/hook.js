import { globalConfig } from "core/config";

/**
 * Returns instance of the Overview Hook mod.
 * @returns {import("./mod").OverviewHook}
 */
function getMod() {
    return ModExtras.require("dengr1065:overview_hook");
}

/**
 * Calls a hook with the specified chunk
 * @param {OverviewHookCallback} callback
 * @param {import("game/map_chunk_aggregate").MapChunkAggregate} aggregate
 * @param {import("game/map_chunk_view").MapChunkView} chunk
 * @param {import("core/draw_parameters").DrawParameters} parameters
 * @param {number} offsetX
 * @param {number} offsetY
 */
function callHook(callback, aggregate, chunk, parameters) {
    // Offset of this chunk (world coordinates)
    const worldOffsetX = chunk.x * globalConfig.mapChunkWorldSize;
    const worldOffsetY = chunk.y * globalConfig.mapChunkWorldSize;

    callback(aggregate.root, chunk, parameters, worldOffsetX, worldOffsetY);
}

/**
 * @param {{ mod: import("mods/mod").Mod, callback: OverviewHookCallback }[]} hooks
 * @param {import("core/draw_parameters").DrawParameters} parameters
 * @this {import("game/map_chunk_aggregate").MapChunkAggregate}
 */
export function drawOverlayHook(hooks, parameters) {
    if (ModExtras?.version === undefined) {
        return;
    }

    // Offset of this chunk aggregate (chunk coordinates)
    const chunkOffsetX = this.x * globalConfig.chunkAggregateSize;
    const chunkOffsetY = this.y * globalConfig.chunkAggregateSize;

    for (const { mod, callback } of hooks) {
        try {
            for (let x = 0; x < globalConfig.chunkAggregateSize; x++) {
                for (let y = 0; y < globalConfig.chunkAggregateSize; y++) {
                    const chunk = this.root.map.getChunk(
                        chunkOffsetX + x,
                        chunkOffsetY + y
                    );

                    callHook(callback, this, chunk, parameters);
                }
            }
        } catch (err) {
            const overviewHook = getMod();
            overviewHook.logger.error(
                "One of the hooks failed to render:",
                err,
                "(registered with " + mod.metadata.id + ")"
            );

            overviewHook.dialogs.showWarning(
                "Hook Error",
                `A hook registered by ${mod.metadata.name} failed to render.`
            );

            overviewHook.unhook(mod, callback);
        }
    }
}
