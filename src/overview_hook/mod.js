import { createLogger } from "core/logging";
import { MapChunkAggregate } from "game/map_chunk_aggregate";
import { Mod } from "mods/mod";
import { drawOverlayHook } from "./hook";
import metadata from "./mod.json";
import icon from "./icon.webp";

const logger = createLogger("Overview Hook");
const modExtrasWarning = [
    "Mod Extras is not installed or is outdated.",
    "Overview Hook requires Mod Extras 0.3.0 or newer",
    "to function."
].join(" ");

export class OverviewHook extends Mod {
    logger = logger;

    init() {
        this.modExtrasMissing = ModExtras?.version === undefined;
        this.signals.gameStarted.add(this.showModExtrasWarning, this);

        if (this.modExtrasMissing) {
            logger.error("Mod Extras is missing!");
        }

        /** @type {{ mod: Mod, callback: OverviewHookCallback }[]} */
        this.hooks = [];

        const hooksRef = this.hooks;
        this.modInterface.runAfterMethod(
            MapChunkAggregate,
            "drawOverlay",
            function (...args) {
                drawOverlayHook.call(this, hooksRef, ...args);
            }
        );
    }

    showModExtrasWarning() {
        if (this.modExtrasMissing) {
            this.dialogs.showWarning("Overview Hook", modExtrasWarning);
        }
    }

    /**
     * Sets a Map Overview rendering hook.
     * @param {Mod} mod Used to keep track of hooked mods.
     * @param {OverviewHookCallback} callback Function to call when rendering.
     */
    hook(mod, callback) {
        ModExtras.assertIsOfType(mod, Mod);
        ModExtras.assertIsOfType(callback, Function);

        if (this.hooks.some(({ callback: cb }) => cb == callback)) {
            logger.warn("Hooking the same callback twice");
        }

        this.hooks.push({ mod, callback });
    }

    /**
     * Removes the specified rendering hook or if not provided,
     * all hooks of the specified mod.
     * @param {Mod} mod Remove hooks of this mod.
     * @param {OverviewHookCallback} callback Specific hook to remove.
     */
    unhook(mod, callback) {
        ModExtras.assertIsOfType(mod, Mod);

        let modHooks = this.hooks.filter((hook) => hook.mod == mod);
        if (callback) {
            ModExtras.assertIsOfType(callback, Function);
            modHooks = modHooks.filter((hook) => hook.callback == callback);
        }

        for (const hook of modHooks) {
            // Remove these hooks from the list
            this.hooks.splice(this.hooks.indexOf(hook), 1);
        }
    }
}

metadata.extra.icon = icon;
registerMod(OverviewHook, metadata);
