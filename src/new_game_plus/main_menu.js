import { Dialog } from "core/modal_dialog_elements";
import { generateLevelDefinitions } from "game/modes/regular";
import { T } from "translations";

// default value
let gRequireExistingSavegame = true;

export function setRequireExistingSavegame(value) {
    gRequireExistingSavegame = value;
}

/** @this {import("states/main_menu").MainMenuState} */
export function onPlayButtonClicked(superMethod) {
    if (!canStartFromFreeplay.call(this)) {
        return superMethod();
    }

    const signals = showChooserDialog.call(this);
    signals.startFromBeginning.add(superMethod, this);
    signals.startFromFreeplay.add(startFromFreeplay, this);
}

/** @this {import("states/main_menu").MainMenuState} */
function showChooserDialog() {
    const dialog = new Dialog({
        app: this.app,
        title: T.newGamePlus.dialogTitle,
        contentHTML: T.newGamePlus.dialogDescription.replace(
            "{level}",
            getFreeplayLevel()
        ),
        buttons: ["startFromBeginning", "startFromFreeplay"],
        closeButton: true,
        type: "info"
    });

    this.dialogs.internalShowDialog(dialog);
    return dialog.buttonSignals;
}

function getFreeplayLevel() {
    // this is just a coincidence (that's what i tell myself)
    return generateLevelDefinitions().length + 1;
}

/** @this {import("states/main_menu").MainMenuState} */
function canStartFromFreeplay() {
    if (!gRequireExistingSavegame) {
        // sounds like cheating, but ok
        return true;
    }

    /** @type {import("savegame/savegame_typedefs").SavegamesData[]} */
    const savegames = this.app.savegameMgr.currentData.savegames;
    const freeplayLevel = getFreeplayLevel();

    return savegames.some((s) => s.level >= freeplayLevel);
}

/** @this {import("states/main_menu").MainMenuState} */
function startFromFreeplay() {
    const savegame = this.app.savegameMgr.createNewSavegame();
    this.moveToState("InGameState", {
        savegame,
        startingLevel: getFreeplayLevel()
    });
}
