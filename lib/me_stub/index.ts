import { GameState } from "core/game_state";
import { Signal } from "core/signal";
import { Mod } from "mods/mod";
import { T } from "translations";

const GET_MOD_EXTRAS_URL = "https://skimnerphi.net/mods/mod_extras/";

function getMEVersion(): string | null {
    return ("ModExtras" in window && ModExtras.version) || null;
}

function showMissingDialog(mod: Mod) {
    const { getModExtras }: { [k: string]: Signal } = mod.dialogs.showWarning(
        "Mod Extras Missing",
        `Mod "${mod.metadata.name}" requires an up-to-date
        version of Mod Extras to function properly.`,
        ["later:bad", "getModExtras:good"]
    );

    getModExtras.add(() => {
        mod.app.platformWrapper.openExternalLink(GET_MOD_EXTRAS_URL);
    });
}

export function requireModExtras(mod: Mod) {
    const version = getMEVersion();
    const signal: Signal = mod.signals.stateEntered;

    function onStateEntered(state: GameState) {
        if (state.key === "MainMenuState") {
            showMissingDialog(mod);
            signal.remove(this);
        }
    }

    if (version === null) {
        T.dialogs.buttons.getModExtras = "Get Mod Extras";
        signal.add(onStateEntered, onStateEntered);
    }

    return version !== null;
}
