import { HubGoals } from "game/hub_goals";
import { GameHUD } from "game/hud/hud";
import { Mod } from "mods/mod";
import { HUDZeitgeist } from "./hud";
import metadata from "./mod.json";
import icon from "./icon.webp";
import readme from "./README.md";

export class Zeitgeist extends Mod {
    init() {
        this.modInterface.registerHudElement("zeitgeist", HUDZeitgeist);
        this.modInterface.runAfterMethod(GameHUD, "drawOverlays", function (p) {
            // Needs explicit statement
            this.parts.zeitgeist.drawOverlays(p);
        });
    }

    /**
     * Returns hub goal corresponding to the specified level.
     * @param {import("game/root").GameRoot} root
     * @param {number} delta Relative level to retreive
     * @returns {{
     * definition: import("game/shape_definition").ShapeDefinition,
     * required: number,
     * reward: string,
     * throughputOnly: boolean
     * } | null}
     */
    getGoal(root, delta = 0) {
        if (typeof delta !== "number") {
            throw new Error("Level delta must be a number");
        }

        if (delta === 0) {
            return root.hubGoals.currentGoal;
        }

        const level = root.hubGoals.level + delta;
        if (level < 1) {
            // Nothing there
            return null;
        }

        const cache = (root.hubGoals.__zg_cache ??= []);
        if (level in cache) {
            // Previously fetched
            return cache[level];
        }

        // We do a little trolling: this is slow and unsafe, but who cares
        try {
            const fakeGoals = new HubGoals(root);
            fakeGoals.level = level;
            fakeGoals.computeNextGoal();

            cache[level] = fakeGoals.currentGoal;
        } catch {
            cache[level] = null;
        }

        return cache[level];
    }

    get shouldDisplay() {
        return this.settings.pastLevels > 0 || this.settings.futureLevels > 0;
    }
}

metadata.extra.icon = icon;
metadata.extra.readme = readme;
registerMod(Zeitgeist, metadata);
