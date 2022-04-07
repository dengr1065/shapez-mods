import { Mod } from "mods/mod";
import info from "./mod.json";
import { onPlayButtonClicked, setRequireExistingSavegame } from "./main_menu";
import { T } from "translations";
import { stage4aInitEmptyGame } from "./ingame";
import { MainMenuState } from "states/main_menu";
import { InGameState } from "states/ingame";

const STRINGS = {
    dialogTitle: "Choose a starting point",
    dialogDescription:
        "Would you like to start from the beginning, or level {level}?",
    startFromBeginning: "Beginning",
    startFromFreeplay: "Freeplay"
};

class NewGamePlus extends Mod {
    init() {
        this.modInterface.replaceMethod(
            MainMenuState,
            "onPlayButtonClicked",
            onPlayButtonClicked
        );

        this.modInterface.runAfterMethod(
            InGameState,
            "stage4aInitEmptyGame",
            stage4aInitEmptyGame
        );

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

registerMod(NewGamePlus, info);
