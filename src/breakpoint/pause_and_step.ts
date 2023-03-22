import { Mod } from "mods/mod";
import { MODS } from "mods/modloader";

interface PauseAndStep extends Mod {
    togglePause(): void;
}

const PAUSE_AND_STEP = "pause-and-step";

export function getPauseAndStep(): PauseAndStep | undefined {
    return MODS.mods.find(
        (mod) => mod.metadata.id === PAUSE_AND_STEP
    ) as PauseAndStep;
}
