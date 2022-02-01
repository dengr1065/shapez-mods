import { Mod } from "mods/mod";
import info from "./mod.json";
import { NGPMainMenuState, setRequireExistingSavegame } from "./main_menu";
import { T } from "translations";
import { NGPInGameState } from "./ingame";

const STRINGS = {
    dialogTitle: "Choose a starting point",
    dialogDescription:
        "Would you like to start from the beginning, or level {level}?",
    startFromBeginning: "Beginning",
    startFromFreeplay: "Freeplay"
};

class NewGamePlus extends Mod {
    init() {
        // eslint-disable-next-line no-undef
        shapez.MainMenuState = NGPMainMenuState;
        // eslint-disable-next-line no-undef
        shapez.InGameState = NGPInGameState;

        setRequireExistingSavegame(this.settings.requireExistingSavegame);
        this.signals.appBooted.add(this.registerStrings, this);
    }

    registerStrings() {
        T.newGamePlus = {
            dialogTitle: STRINGS.dialogTitle,
            dialogDescription: STRINGS.dialogDescription
        };

        T.dialogs.buttons.startFromBeginning = STRINGS.startFromBeginning;
        T.dialogs.buttons.startFromFreeplay = STRINGS.startFromFreeplay;
    }
}

// eslint-disable-next-line no-undef
registerMod(NewGamePlus, info);
