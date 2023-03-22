import { GameRoot } from "game/root";
import { MODS } from "mods/modloader";
import type { Zeitgeist } from "../zeitgeist";

const ZEITGEIST_ID = "dengr1065:zeitgeist";

function getZeitgeist(): Zeitgeist | undefined {
    return MODS.mods.find(
        (mod) => mod.metadata.id === ZEITGEIST_ID
    ) as Zeitgeist;
}

/**
 * Returns shape keys of levels that should be preserved. Zeitgeist
 * is used if available to return more than one key.
 * @param root Reference to the current game
 * @param amount Amount of levels to return
 */
export function getLevelKeys(root: GameRoot, amount: number): string[] {
    const zeitgeist = getZeitgeist();

    if (amount < 1) {
        // No levels requested
        return [];
    }

    if (amount == 1 || zeitgeist === undefined) {
        const definition = root.hubGoals.currentGoal.definition;
        return [definition.getHash()];
    }

    // Assuming Zeitgeist is installed, return the requested levels
    const levels: string[] = [];
    for (let delta = 0; delta < amount; delta++) {
        // NOTE: We're looking into the past!
        const level = zeitgeist.getGoal(root, -delta);

        if (level === null) {
            // Level <1, we can stop looking further
            break;
        }

        levels.push(level.definition.getHash());
    }

    return levels;
}
