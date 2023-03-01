import { GameSystemWithFilter } from "game/game_system_with_filter";
import { enumNotificationType } from "game/hud/parts/notifications";
import { isTruthyItem } from "game/items/boolean_item";
import { GameRoot } from "game/root";
import { WireNetwork } from "game/systems/wire";
import { BreakpointComponent, BREAKPOINT_COMPONENT_ID } from "./component";
import { getPauseAndStep } from "./pause_and_step";

export class BreakpointSystem extends GameSystemWithFilter {
    constructor(root: GameRoot) {
        super(root, [BreakpointComponent]);
    }

    update() {
        for (const entity of this.allEntities) {
            const staticComponent = entity.components.StaticMapEntity;
            const pinsComponent = entity.components.WiredPins;
            const bpComponent: BreakpointComponent =
                entity.components[BREAKPOINT_COMPONENT_ID];

            if (!pinsComponent || !bpComponent) {
                continue;
            }

            const network: WireNetwork = pinsComponent.slots[0].linkedNetwork;
            const hasValue = network?.hasValue() ?? false;
            const isTruthy = hasValue && isTruthyItem(network.currentValue);

            if (!bpComponent.wasTruthy && isTruthy) {
                getPauseAndStep()?.togglePause();

                const position = staticComponent.origin;
                const text = `Breakpoint fired at ${position.toString()}!`;
                this.root.hud.signals.notification.dispatch(
                    text,
                    enumNotificationType.info
                );
            }

            bpComponent.wasTruthy = isTruthy;
        }
    }
}
