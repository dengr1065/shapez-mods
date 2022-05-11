import { TextualGameState } from "core/textual_game_state";
import { makeDiv } from "core/utils";
import { MODS } from "mods/modloader";

function labelWrap(text, element) {
    const label = document.createElement("label");
    label.innerText = text;
    label.appendChild(element);

    return label;
}

function makeCheckboxInput(checked) {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = checked;

    return input;
}

function makeColorInput(color) {
    const input = document.createElement("input");
    input.type = "color";
    input.value = color;

    return input;
}

export class MapObserverSettingsState extends TextualGameState {
    constructor() {
        super("MapObserverSettingsState");

        /** @type {import("mods/mod").Mod} */
        this.mod = MODS.mods.find(
            (mod) => mod.metadata.id == "dengr1065:map_observer"
        );
    }

    onEnter() {
        const settings = this.mod.settings;

        const useHotkeys = makeCheckboxInput(settings.useHotkeys);
        const customizeGrid = makeCheckboxInput(settings.customizeGrid);
        const backgroundInput = makeColorInput(settings.gridBackground);
        const foregroundInput = makeColorInput(settings.gridForeground);

        useHotkeys.addEventListener("change", () => {
            settings.useHotkeys = useHotkeys.checked;
        });

        customizeGrid.addEventListener("change", () => {
            settings.customizeGrid = customizeGrid.checked;
        });

        backgroundInput.addEventListener("change", () => {
            settings.gridBackground = backgroundInput.value;
        });

        foregroundInput.addEventListener("change", () => {
            settings.gridForeground = foregroundInput.value;
        });

        const content = document.querySelector(".mainContent");
        makeDiv(content, undefined, [], "Settings");

        const zoomOutLimitHint = document.createElement("p");
        zoomOutLimitHint.innerHTML = [
            "Modifying level of zooming out for Map View to turn on is",
            "currently impossible in the settings. Please manually edit",
            "the configuration file. Sorry for inconvenience!"
        ].join("<br>");
        content.appendChild(zoomOutLimitHint);

        content.appendChild(labelWrap("Toggle Mode (Keybinding)", useHotkeys));
        content.appendChild(labelWrap("Customize Grid Colors", customizeGrid));
        content.appendChild(labelWrap("Background Color", backgroundInput));
        content.appendChild(labelWrap("Grid Lines", foregroundInput));
    }

    getStateHeaderTitle() {
        return "Map Observer";
    }

    onLeave() {
        this.mod.saveSettings();
        this.mod.setConfig();
    }
}
