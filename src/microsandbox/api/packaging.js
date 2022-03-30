import { HubGoals } from "game/hub_goals";
import { HUDPinnedShapes } from "game/hud/parts/pinned_shapes";
import { ToggleRow } from "../rows/toggle_row";

/*
This hacky stuff is required because Packaging mod does not provide
any useful API. zoidran, if you see this, please consider exposing
at least some useful data, like the configured packaging shape, or
current settings.
*/

/** @this {HUDPinnedShapes} */
function internalPinShapeHook(sourceMethod, pin, integration) {
    // NOTE: This is *extremely* dirty, and may break if other
    // mods hook here as well.
    sourceMethod(pin);

    if (pin.className == "blueprint") {
        // Both blueprint and packaging were pinned, so we try
        // to find the handle for packaging to determine the
        // required shape key
        const handle = this.handles.find((handle) =>
            handle.element.classList.contains("package")
        );

        if (handle) {
            integration.shape = handle.key;
        } else {
            integration.shape = undefined;
        }
    }
}

/**
 * @param {string} key
 * @param {{ shape: string? }} integration
 */
function getShapesStoredByKeyHook(sourceMethod, key, integration) {
    if (key === integration.shape) {
        if (this.root.hud.parts.microSandbox?.freePackaging) {
            return Infinity;
        }
    }

    return sourceMethod(key);
}

/**
 * @param {string} key
 * @param {{ shape: string? }} integration
 */
function takeShapeByKeyHook(sourceMethod, key, amount, integration) {
    if (key === integration.shape) {
        if (this.root.hud.parts.microSandbox?.freePackaging) {
            // This would trigger an assert otherwise
            return;
        }
    }

    return sourceMethod(key, amount);
}

export function getPackagingRows(hud) {
    hud.freePackaging = false;
    return [
        new ToggleRow(hud, {
            label: "Free Packaging",
            getter: () => hud.freePackaging,
            setter: (value) => (hud.freePackaging = value)
        })
    ];
}

/**
 * @param {import("mods/mod").Mod} mod
 * @param {{ shape: string? }} self
 */
export function setupPackagingHooks(mod, self) {
    // Find out the required shape
    mod.modInterface.replaceMethod(
        HUDPinnedShapes,
        "internalPinShape",
        function (sourceMethod, [pin]) {
            internalPinShapeHook.call(this, sourceMethod, pin, self);
        }
    );

    // Return Infinity when asked for the shape
    mod.modInterface.replaceMethod(
        HubGoals,
        "getShapesStoredByKey",
        function (sourceMethod, [key]) {
            return getShapesStoredByKeyHook.call(this, sourceMethod, key, self);
        }
    );

    // Don't take the required shape, because it may be zero
    mod.modInterface.replaceMethod(
        HubGoals,
        "takeShapeByKey",
        function (sourceMethod, [key, amount]) {
            return takeShapeByKeyHook.call(
                this,
                sourceMethod,
                key,
                amount,
                self
            );
        }
    );
}
