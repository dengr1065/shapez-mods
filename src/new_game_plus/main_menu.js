import { Dialog } from "core/modal_dialog_elements";
import { generateLevelDefinitions } from "game/modes/regular";
import { MainMenuState } from "states/main_menu";
import { T } from "translations";

// default value
let gRequireExistingSavegame = true;

export function setRequireExistingSavegame(value) {
    gRequireExistingSavegame = value;
}

export class NGPMainMenuState extends MainMenuState {
    onPlayButtonClicked() {
        if (!this.canStartFromFreeplay()) {
            return super.onPlayButtonClicked();
        }

        const signals = this.showChooserDialog();
        signals.startFromBeginning.add(super.onPlayButtonClicked, this);
        signals.startFromFreeplay.add(this.playFromFreeplay, this);
    }

    showChooserDialog() {
        const dialog = new Dialog({
            app: this.app,
            title: T.newGamePlus.dialogTitle,
            contentHTML: T.newGamePlus.dialogDescription.replace(
                "{level}",
                this.getFreeplayLevel()
            ),
            buttons: ["startFromBeginning", "startFromFreeplay"],
            closeButton: true,
            type: "info"
        });

        this.dialogs.internalShowDialog(dialog);
        return dialog.buttonSignals;
    }

    getFreeplayLevel() {
        // this is just a coincidence (that's what i tell myself)
        return generateLevelDefinitions().length + 1;
    }

    canStartFromFreeplay() {
        if (!gRequireExistingSavegame) {
            // sounds like cheating, but ok
            return true;
        }

        /** @type {import("savegame/savegame_typedefs").SavegamesData[]} */
        const savegames = this.app.savegameMgr.currentData.savegames;
        const freeplayLevel = this.getFreeplayLevel();

        return savegames.some((s) => s.level >= freeplayLevel);
    }

    playFromFreeplay() {
        const savegame = this.app.savegameMgr.createNewSavegame();
        this.moveToState("InGameState", {
            savegame,
            startingLevel: this.getFreeplayLevel()
        });
    }
}
