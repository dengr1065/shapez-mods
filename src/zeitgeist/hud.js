import { BaseHUDPart } from "game/hud/base_hud_part";
import { MODS } from "mods/modloader";
import metadata from "./mod.json";

export class HUDZeitgeist extends BaseHUDPart {
    initialize() {
        /** @type {import("./index").Zeitgeist} */
        this.mod = MODS.mods.find((mod) => mod.metadata.id === metadata.id);
    }

    /**
     * @param {import("core/draw_utils").DrawParameters} parameters
     */
    drawOverlays(parameters) {
        if (!this.mod.shouldDisplay) {
            return;
        }

        const uiScale = this.root.app.getEffectiveUiScale();

        const baseSize = uiScale * 32;
        const currentSize = baseSize * 1.5;
        const gap = baseSize / 4;

        const centerX = this.root.gameWidth / 2;
        const centerY = 32 * uiScale + currentSize / 2;

        const currentGoal = this.mod.getGoal(this.root, 0);
        currentGoal.definition.drawCentered(
            centerX,
            centerY,
            parameters,
            currentSize
        );

        const pastLevels = this.mod.settings.pastLevels;
        const futureLevels = this.mod.settings.futureLevels;
        const pastX = centerX - (currentSize - baseSize) / 2;
        const futureX = centerX + (centerX - pastX);

        for (let i = -pastLevels; i <= futureLevels; i++) {
            if (i === 0) {
                // We already drew the current goal
                continue;
            }

            const goal = this.mod.getGoal(this.root, i);
            if (goal === null) {
                // No level there
                continue;
            }

            const finalX = (i < 0 ? pastX : futureX) + (baseSize + gap) * i;
            goal.definition.drawCentered(finalX, centerY, parameters, baseSize);
        }
    }
}
