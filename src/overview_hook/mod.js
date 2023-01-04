import { createLogger } from "core/logging";
import { MapChunkAggregate } from "game/map_chunk_aggregate";
import { Mod } from "mods/mod";
import { drawOverlayHook } from "./hook";
import metadata from "./bundled.mod.json";
import icon from "./icon.webp";

const logger = createLogger("Overview Hook");

export class OverviewHook extends Mod {
    logger = logger;

    init() {
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

    /**
     * Sets a Map Overview rendering hook.
     * @param {Mod} mod Used to keep track of hooked mods.
     * @param {OverviewHookCallback} callback Function to call when rendering.
     */
    hook(mod, callback) {
        if (!(mod instanceof Mod)) {
            throw new Error('Cannot hook: invalid "mod" argument provided');
        } else if (typeof callback !== "function") {
            throw new Error('Cannot hook: "callback" is not a function');
        }

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
        if (!(mod instanceof Mod)) {
            throw new Error('Cannot unhook: invalid "mod" argument provided');
        }

        let modHooks = this.hooks.filter((hook) => hook.mod == mod);
        if (callback) {
            if (typeof callback !== "function") {
                throw new Error('Cannot unhook: "callback" is not a function');
            }
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
