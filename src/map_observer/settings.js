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

function makeRangeInput(value, max) {
    const input = document.createElement("input");
    input.type = "range";
    input.max = String(max ?? 100);
    input.value = String(value ?? 0);

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

        const { color: gridColor, opacity: gridOpacity } = this.splitHexOpacity(
            settings.gridForeground
        );

        const useHotkeys = makeCheckboxInput(settings.useHotkeys);
        const smoothZoom = makeCheckboxInput(settings.smoothZoom);
        const customizeGrid = makeCheckboxInput(settings.customizeGrid);
        const backgroundInput = makeColorInput(settings.gridBackground);
        const foregroundInput = makeColorInput(gridColor);
        const opacityInput = makeRangeInput(gridOpacity, 255);
        const overviewChunkBg = makeColorInput(settings.overviewChunkBg);
        const overviewActiveChunkBg = makeColorInput(
            settings.overviewActiveChunkBg
        );

        useHotkeys.addEventListener("change", () => {
            settings.useHotkeys = useHotkeys.checked;
        });

        smoothZoom.addEventListener("change", () => {
            settings.smoothZoom = smoothZoom.checked;
        });

        customizeGrid.addEventListener("change", () => {
            settings.customizeGrid = customizeGrid.checked;
        });

        backgroundInput.addEventListener("change", () => {
            settings.gridBackground = backgroundInput.value;
        });

        const gridForegroundHandler = this.updateGridForeground.bind(
            this,
            foregroundInput,
            opacityInput
        );

        foregroundInput.addEventListener("change", gridForegroundHandler);
        opacityInput.addEventListener("change", gridForegroundHandler);

        overviewChunkBg.addEventListener("change", () => {
            settings.overviewChunkBg = overviewChunkBg.value;
        });

        overviewActiveChunkBg.addEventListener("change", () => {
            settings.overviewActiveChunkBg = overviewActiveChunkBg.value;
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
        content.appendChild(labelWrap("Alternative Smooth Zoom", smoothZoom));
        content.appendChild(labelWrap("Customize Colors", customizeGrid));
        content.appendChild(labelWrap("Regular Background", backgroundInput));
        content.appendChild(labelWrap("Grid Lines Color", foregroundInput));
        content.appendChild(labelWrap("Grid Lines Opacity", opacityInput));
        content.appendChild(labelWrap("Overview Background", overviewChunkBg));
        content.appendChild(
            labelWrap("Overview Background (Active)", overviewActiveChunkBg)
        );
    }

    updateGridForeground(colorInput, opacityInput) {
        const color = colorInput.value;
        const opacity = Number(opacityInput.value);

        this.mod.settings.gridForeground = this.combineHexOpacity(
            color,
            opacity
        );
    }

    combineHexOpacity(color, opacity) {
        return `${color}${opacity.toString(16)}`;
    }

    splitHexOpacity(hex) {
        if (hex.length === 7) {
            return { color: hex, opacity: 255 };
        }

        const opacity = Number("0x" + hex.slice(7));
        return { color: hex.slice(0, 7), opacity };
    }

    getStateHeaderTitle() {
        return "Map Observer";
    }

    onLeave() {
        this.mod.saveSettings();
        this.mod.setConfig();
    }
}
