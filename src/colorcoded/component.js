import {
    enumColors,
    enumColorToShortcode,
    enumShortcodeToColor
} from "game/colors";
import { Component } from "game/component";
import { types } from "savegame/serialization";
import {
    AtlasSprite,
    ORIGINAL_SPRITE_SCALE,
    SpriteAtlasLink
} from "core/sprites";
import { COLOR_FILTERS } from "./filters";

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

    /**
     * @param {AtlasSprite} source
     * @param {string} filter
     */
    createSprite(source, filter) {
        const sourceLink = source.linksByResolution[ORIGINAL_SPRITE_SCALE];
        const { w, h } = sourceLink;

        const sprite = new AtlasSprite(source.spriteName);

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext("2d");
        ctx.filter = filter;
        source.draw(ctx, 0, 0, w, h);

        const link = new SpriteAtlasLink({
            w,
            h,
            atlas: canvas,
            packOffsetX: 0,
            packOffsetY: 0,
            packedX: 0,
            packedY: 0,
            packedW: w,
            packedH: h
        });

        for (const resolution of ["0.25", "0.5", "0.75"]) {
            sprite.linksByResolution[resolution] = link;
        }

        return sprite;
    }

    getSprite(source) {
        if (!this.hasColorFilter()) {
            return source;
        }

        if (!source.colorCoded) {
            source.colorCoded = [];
        }

        const filter = this.getColorFilter();
        if (!source.colorCoded[filter]) {
            // create a sprite with applied filter and cache it
            source.colorCoded[filter] = this.createSprite(source, filter);
        }

        return source.colorCoded[filter];
    }
}
