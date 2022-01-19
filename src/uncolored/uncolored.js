import { enumColors } from "game/colors";
import { COLOR_ITEM_SINGLETONS } from "game/items/color_item";
import { MapChunk } from "game/map_chunk";
import { Mod } from "mods/mod";
import info from "./mod.json";

function internalGenerateColorPatch(_, [rng, colorPatchSize, distance]) {
    // First, determine available colors
    let availableColors = [enumColors.red, enumColors.green];
    if (distance > 2) {
        availableColors.push(enumColors.blue);
    }
    if (distance > 3) {
        availableColors.push(enumColors.uncolored);
    }

    this.internalGeneratePatch(
        rng,
        colorPatchSize,
        COLOR_ITEM_SINGLETONS[rng.choice(availableColors)]
    );
}

class UncoloredMod extends Mod {
    init() {
        this.modInterface.replaceMethod(
            MapChunk,
            "internalGenerateColorPatch",
            internalGenerateColorPatch
        );
    }
}

// eslint-disable-next-line no-undef
registerMod(UncoloredMod, info);
