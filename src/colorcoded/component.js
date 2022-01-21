import {
    enumColors,
    enumColorToShortcode,
    enumShortcodeToColor
} from "game/colors";
import { Component } from "game/component";
import { types } from "savegame/serialization";

export const COLOR_FILTERS = {};

export class ColorCodedComponent extends Component {
    static getId() {
        return "ColorCoded";
    }

    static getSchema() {
        return {
            color: types.string
        };
    }

    constructor({ color = "u" }) {
        super();
        window.assert(!!enumShortcodeToColor[color], "Invalid color: ", color);

        this.color = color;
    }

    copyAdditionalStateTo(component) {
        component.color = this.color;
    }

    hasColorFilter() {
        // uncolored means the building is not color-coded
        return this.color != enumColorToShortcode[enumColors.uncolored];
    }

    getColorFilter() {
        /** @type {import("game/items/color_item").ColorItem} */
        const filter = COLOR_FILTERS[enumShortcodeToColor[this.color]];
        return "brightness(0.8) sepia(100%) brightness(1.1) " + filter;
    }
}
