import { arrayDeleteValue } from "core/utils";
import { MODS } from "mods/modloader";

/**
 * Write custom pinned shapes to the savegame object.
 * @this {import("game/hud/parts/pinned_shapes").HUDPinnedShapes}
 */
export function serialize(srcMethod) {
    const data = srcMethod();
    return {
        ...data,
        customShapes: this.customPinnedShapes
    };
}

/**
 * Attempt to read custom pinned shapes from the savegame.
 * @this {import("game/hud/parts/pinned_shapes").HUDPinnedShapes}
 */
export function deserialize(srcMethod, [data]) {
    const error = srcMethod(data);
    if (error) {
        return error;
    }

    if (!("customShapes" in data)) {
        // No data, but no errors either
        return;
    }

    const { customShapes } = data;
    if (!Array.isArray(customShapes) || !customShapes.every(isValidCustomPin)) {
        // There is some data, but it's invalid
        return "[Custom Pins] Invalid custom pinned shapes data.";
    }

    this.customPinnedShapes = customShapes;
}

/**
 * @this {import("game/hud/parts/pinned_shapes").HUDPinnedShapes}
 */
export function isShapePinned(srcMethod, [key]) {
    if (this.customPinnedShapes.some((pin) => pin.key === key)) {
        return true;
    }

    return srcMethod(key);
}

/**
 * @this {import("game/hud/parts/pinned_shapes").HUDPinnedShapes}
 */
export function postRerenderFull() {
    for (const pin of this.customPinnedShapes) {
        this.internalPinShape({
            key: pin.key,
            throughputOnly: pin.throughput
        });
    }
}

/**
 * @param {[import("game/shape_definition").ShapeDefinition, boolean?, boolean?]} args
 * @this {import("game/hud/parts/pinned_shapes").HUDPinnedShapes}
 */
export function pinNewShape(_, args) {
    const key = args[0].getHash();
    if (this.isShapePinned(key)) {
        return;
    }

    if (args[1] === true) {
        // Pin as a custom shape instead
        const throughput = !!args[2];
        this.customPinnedShapes.push({ key, throughput });
    } else {
        this.pinnedShapes.push(key);
    }

    this.rerenderFull();
}

/**
 * @this {import("game/hud/parts/pinned_shapes").HUDPinnedShapes}
 */
export function unpinShape(srcMethod, [key]) {
    // This is slow, but acceptable in pinned shapes
    const pin = this.customPinnedShapes.find((pin) => pin.key == key);
    if (pin) {
        // The pinned shape was a custom one, no need to return control
        arrayDeleteValue(this.customPinnedShapes, pin);
        this.rerenderFull();
        return;
    }

    // Fall back to automated pins handler
    srcMethod(key);
}

function isValidCustomPin(pin) {
    return typeof pin.key == "string" && typeof pin.throughput == "boolean";
}

export function isIndustriesPresent() {
    return MODS.mods.some((mod) => mod.metadata.id === "shapez-industries");
}
