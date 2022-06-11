import { TextualGameState } from "core/textual_game_state";
import { makeDiv } from "core/utils";
import { MODS } from "mods/modloader";
import {
    enabledFixes,
    fixesByMod,
    getDisplayName,
    toggleFix
} from "./fix_store";
import metadata from "./mod.json";

export const FIXES_STATE = "FixesState";

export class FixesState extends TextualGameState {
    mod = MODS.mods.find((mod) => mod.metadata.id == metadata.id);

    constructor() {
        super(FIXES_STATE);
    }

    getStateHeaderTitle() {
        return "Game Fixes";
    }

    onEnter() {
        /** @type {Map<Fix, HTMLDivElement>} */
        this.fixElements = new Map();
        this.content = document.createDocumentFragment();

        for (const [mod, fixes] of fixesByMod.entries()) {
            const header = makeDiv(this.content, null, ["modHeader"]);
            header.innerText = `Provided by ${mod.metadata.name}`;

            for (const fix of fixes) {
                const isEnabled = enabledFixes.has(fix.id);
                const fixElement = makeDiv(this.content, null, [
                    "fix",
                    "noPressEffect"
                ]);

                const fixName = makeDiv(fixElement);
                fixName.innerText = getDisplayName(fix);

                const fixToggle = document.createElement("input");
                fixElement.appendChild(fixToggle);
                fixToggle.type = "checkbox";
                fixToggle.checked = isEnabled;

                this.trackClicks(fixElement, () => {
                    // If an error occurs, this will be reset back
                    fixToggle.checked = !fixToggle.checked;
                    this.fixToggled(fix, fixToggle.checked);
                });

                this.content.appendChild(fixElement);
            }
        }

        document.querySelector(".mainContent").appendChild(this.content);
    }

    /**
     * Callback for fix toggles
     * @param {Fix} fix
     * @param {boolean} value
     */
    fixToggled(fix, value) {
        try {
            toggleFix(fix, value);
            this.mod.writeConfig();
        } catch {
            // Hint that there's an error and reset checkbox
            const element = this.fixElements.get(fix);
            const toggle = element.querySelector("input");
            element.classList.add("error");
            toggle.checked = !value;
        }
    }
}

/**
 * Adds the "Game Fixes" button
 * @this {import("states/main_menu").MainMenuState}
 */
export function mainMenuPostEnter() {
    const mainWrapper = this.htmlElement.querySelector(".mainWrapper");
    const buttonsContainer = makeDiv(mainWrapper, null, ["buttonsContainer"]);

    const fixesButton = makeDiv(buttonsContainer, "gameFixes");
    fixesButton.innerText = "Game Fixes";

    this.trackClicks(fixesButton, () => {
        this.moveToState(FIXES_STATE);
    });
}
