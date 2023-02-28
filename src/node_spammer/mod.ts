import { MapChunk } from "game/map_chunk";
import { Mod } from "mods/mod";
import { generatePatches } from "./patch";

export class NodeSpammer extends Mod {
    init() {
        this.modInterface.replaceMethod(
            MapChunk,
            "generatePredefined",
            () => false
        );

        this.modInterface.replaceMethod(
            MapChunk,
            "generatePatches",
            generatePatches
        );
    }
}
