import { DrawParameters } from "core/draw_parameters";
import { MapChunkView } from "game/map_chunk_view";
import { GameRoot } from "game/root";

declare global {
    declare type OverviewHookCallback = (
        root: GameRoot,
        chunk: MapChunkView,
        parameters: DrawParameters,
        offsetX: number,
        offsetY: number
    ) => void;
}
