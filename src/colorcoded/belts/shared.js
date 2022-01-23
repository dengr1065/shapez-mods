import { globalConfig } from "core/config";
import { BELT_ANIM_COUNT } from "game/systems/belt";

function getSpeedMultiplier(root) {
    return Math.min(root.hubGoals.getBeltBaseSpeed(), 10);
}

export function getAnimationIndex(root) {
    return Math.floor(
        ((root.time.realtimeNow() *
            getSpeedMultiplier(root) *
            BELT_ANIM_COUNT *
            126) /
            42) *
            globalConfig.itemSpacingOnBelts
    );
}
