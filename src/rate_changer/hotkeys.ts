import { STOP_PROPAGATION } from "core/signal";
import { GameRoot } from "game/root";
import { HUDRateChanger } from "./hud_element";

export function toggleCustomTickRate(root: GameRoot) {
    const rateChanger: HUDRateChanger = root.hud.parts["rateChanger"];
    if (rateChanger === undefined) {
        return;
    }

    rateChanger.toggleCustomRate();
}

function adjustTickRate(root: GameRoot, decrease: boolean) {
    const rateChanger: HUDRateChanger = root.hud.parts["rateChanger"];
    if (rateChanger === undefined) {
        return;
    }

    rateChanger.adjustRate(decrease);
    return STOP_PROPAGATION;
}

export function increaseTickRate(root: GameRoot) {
    return adjustTickRate(root, false);
}

export function decreaseTickRate(root: GameRoot) {
    return adjustTickRate(root, true);
}
