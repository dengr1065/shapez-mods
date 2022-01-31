import { MapChunkView } from "game/map_chunk_view";
import { DisplaySystem } from "game/systems/display";
import { Mod } from "mods/mod";
import { ldDrawMapView } from "./display";
import info from "./mod.json";

/**
 * @this {MapChunkView}
 * @param {import("core/draw_parameters").DrawParameters} parameters
 * @param {number} xoff
 * @param {number} yoff
 */
function drawMapViewDisplays(parameters) {
    parameters.context.imageSmoothingEnabled = false;
    this.root.systemMgr.systems.display._ldDrawMapView(parameters, this);
    parameters.context.imageSmoothingEnabled = true;
}

class LitDisplays extends Mod {
    init() {
        DisplaySystem.prototype._ldDrawMapView = ldDrawMapView;
        this.modInterface.runAfterMethod(
            MapChunkView,
            "drawOverlayPatches",
            drawMapViewDisplays
        );
    }
}

// eslint-disable-next-line no-undef
registerMod(LitDisplays, info);
