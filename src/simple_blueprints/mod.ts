import { DrawParameters } from "core/draw_utils";
import { HUDBlueprintPlacer } from "game/hud/parts/blueprint_placer";
import { THEMES } from "game/theme";
import { Mod } from "mods/mod";
import _metadata from "./mod.json";
import { drawBlueprint } from "./renderer";
import icon from "./icon.webp";

export function drawPatch(
    this: HUDBlueprintPlacer,
    srcMethod: (parameters: DrawParameters) => void,
    [parameters]: [DrawParameters]
) {
    if (!this.root.camera.getIsMapOverlayActive()) {
        srcMethod(parameters);
        return;
    }

    const blueprint = this.currentBlueprint.get();
    if (!blueprint) {
        return;
    }

    const mousePosition = this.root.app.mousePosition;
    if (!mousePosition) {
        // Not on screen
        return;
    }

    const worldPos = this.root.camera.screenToWorld(mousePosition);
    const tile = worldPos.toTileSpace();
    drawBlueprint(parameters, blueprint, tile);
}

class SimpleBlueprints extends Mod {
    init() {
        this.modInterface.replaceMethod(HUDBlueprintPlacer, "draw", drawPatch);
        this.signals.appBooted.add(this.modifyThemes, this);
    }

    modifyThemes() {
        for (const themeId in THEMES) {
            THEMES[themeId][this.metadata.id] = {
                blueprintColor: this.settings.blueprintColor
            };
        }
    }
}

const metadata = _metadata as unknown as ModExtrasMetadata;
metadata.extra.icon = icon;
registerMod(SimpleBlueprints, metadata);
