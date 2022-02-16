import { Mod } from "mods/mod";
import info from "./mod.json";
import { NGPMainMenuState, setRequireExistingSavegame } from "./main_menu";
import { T } from "translations";
import { NGPInGameState } from "./ingame";
import { BUILD_OPTIONS } from "core/globals";

const STRINGS = {
    dialogTitle: "Choose a starting point",
    dialogDescription:
        "Would you like to start from the beginning, or level {level}?",
    startFromBeginning: "Beginning",
    startFromFreeplay: "Freeplay"
};

const failureText = `
One of game methods could not be patched. Most likely this
means that your game version does not support patching, and
the mod cannot run. Current game version: {version}
`
    .replace(/\s+/gm, " ")
    .trim();

class NewGamePlus extends Mod {
    init() {
        this.failed = false;

        try {
            // eslint-disable-next-line no-undef
            shapez.MainMenuState = NGPMainMenuState;
            // eslint-disable-next-line no-undef
            shapez.InGameState = NGPInGameState;
        } catch {
            this.failed = true;
        }

        setRequireExistingSavegame(this.settings.requireExistingSavegame);
        this.signals.appBooted.add(this.registerStrings, this);
        this.signals.stateEntered.add(this.showFailureWarning, this);
    }

    registerStrings() {
        T.newGamePlus = {
            dialogTitle: STRINGS.dialogTitle,
            dialogDescription: STRINGS.dialogDescription
        };

        T.dialogs.buttons.startFromBeginning = STRINGS.startFromBeginning;
        T.dialogs.buttons.startFromFreeplay = STRINGS.startFromFreeplay;
    }

    /**
     * @param {import("states/main_menu").MainMenuState} state
     */
    showFailureWarning(state) {
        if (state.getKey() == "MainMenuState" && this.failed) {
            this.failed = false;

            const version =
                BUILD_OPTIONS.BUILD_VERSION +
                " (" +
                BUILD_OPTIONS.BUILD_COMMIT_HASH +
                ")";
            const text = failureText.replace("{version}", version);
            this.dialogs.showWarning(this.metadata.name, text);
        }
    }
}

// eslint-disable-next-line no-undef
registerMod(NewGamePlus, info);
