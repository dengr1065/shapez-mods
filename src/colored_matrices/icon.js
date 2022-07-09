import { makeOffscreenBuffer } from "core/buffer_utils";
import { randomChoice, randomInt, rotateFlatMatrix3x3 } from "core/utils";
import metadata from "./mod.json";

const patterns = [
    [1, 0, 1, 0, 1, 0, 1, 0, 1],
    [0, 1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 1, 0, 1, 1],
    [1, 1, 1, 1, 0, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1]
];

function getRandomPattern() {
    let src = randomChoice(patterns);
    const rotation = randomInt(0, 3);

    for (let i = 0; i < rotation; i++) {
        src = rotateFlatMatrix3x3(src);
    }

    return src;
}

/**
 * Renders the specified pattern on a canvas context.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number[]} pattern
 * @param {number} x
 * @param {number} y
 * @param {number} size
 */
function drawPattern(ctx, pattern, x, y, size) {
    const pixelSize = (size - x) / Math.sqrt(pattern.length);

    for (let i = 0; i < pattern.length; i++) {
        const px = i % 3;
        const py = Math.floor(i / 3);

        if (pattern[i] === 0) {
            continue;
        }

        ctx.fillRect(
            x + px * pixelSize,
            y + py * pixelSize,
            pixelSize,
            pixelSize
        );
    }
}

/**
 * This entire function is dedicated to creating an awesome
 * dynamic icon for the mod in Mod Extras.
 * @returns {string} Data URL of the resulting icon
 */
export function generateModIcon() {
    const [canvas, ctx] = makeOffscreenBuffer(128, 128, {
        smooth: true,
        reusable: false,
        label: `${metadata.id}:icon`
    });

    const hue = randomInt(0, 359);

    // Background
    ctx.fillStyle = `hsl(${hue}, 20%, 15%)`;
    ctx.beginRoundedRect(0, 0, 128, 128, 10);
    ctx.fill();

    // Foreground (pattern)
    const pattern = getRandomPattern();
    ctx.fillStyle = `hsl(${hue}, 90%, 60%)`;
    drawPattern(ctx, pattern, 32, 32, 96);

    return canvas.toDataURL("image/png");
}
