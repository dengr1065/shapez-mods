import { round2Digits } from "core/utils";
import { enumColors, enumColorsToHexCode } from "game/colors";

export const COLOR_FILTERS = {};

// https://stackoverflow.com/a/2348659
function hexToHue(hex) {
    const int = parseInt(hex.slice(1), 16);
    const r = (int >> 16) / 255;
    const g = ((int >> 8) & 0xff) / 255;
    const b = (int & 0xff) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    if (max == min) {
        return null;
    }

    let h = -1;
    const d = max - min;
    switch (max) {
        case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
        case g:
            h = (b - r) / d + 2;
            break;
        case b:
            h = (r - g) / d + 4;
            break;
    }
    h /= 6;

    return Math.floor(h * 360);
}

/**
 * @param {import("game/items/color_item").ColorItem} item
 */
export function getColorFilter(item) {
    if (item.color == enumColors.white) {
        return "grayscale(1) brightness(1.1)";
    }

    const hex =
        item.getBackgroundColorAsResource() ?? enumColorsToHexCode[item.color];
    if (!hex) {
        // color is not available in our theme
        return "grayscale(1)";
    }

    const hue = hexToHue(hex);
    if (hue == null) {
        return "grayscale(1)";
    }

    return `contrast(0.8) saturate(1.8) brightness(0.85) hue-rotate(${round2Digits(
        hue - 47
    )}deg)`;
}
